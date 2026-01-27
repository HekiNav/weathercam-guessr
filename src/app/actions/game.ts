"use server"
import { atLeastOneTrue, FormState, LeaderboardItem, LatLonLike, Map, MapType, MapVisibility, score } from "@/lib/definitions";
import { Image } from "./image";
import { createDB } from "@/lib/db";
import z from "zod";
import { and, desc, eq, or, sql, SQL } from "drizzle-orm";
import { image, leaderboard, map } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export interface GameState<T extends string> extends FormState<["practiceConfig", "server", "image"]> {
    step: T,
    title: string,

}
export type BasicGameState = GameState<"config_practice" | "init" | "login">
export type AnyGameState = GamePlayState | GameDailyInfoState | BasicGameState | GamePracticePlayState | GameLeaderboardState

export interface GameLeaderboardState extends GameState<"leaderboard"> {
    items: LeaderboardItem[]
}

export interface GamePracticePlayState extends GameState<"game" | "results"> {
    round: number,
    maxRound?: number,
    points: number,
    prevPoints?: number,
    image: Image,
}
export interface GamePlayState extends GamePracticePlayState {
    map: Map
}

export interface GameDailyInfoState extends GameState<"daily_info"> {
    lastGame?: LeaderboardItem
}
export interface GameData<T extends string> {
    type: T
}
export type GameMode = "practice" | "daily"
export interface GameInitData extends GameData<"init"> {
    gameMode: GameMode
}
export interface GamePracticeBeginData extends GameData<"practice_begin"> {
    config: GamePracticeBeginDataConfig
}
export type GameDailyBeginData = GameData<"daily_begin">

export interface GamePracticeSubmitData extends GameData<"practice_submit"> {
    location: LatLonLike
}
export interface GameSubmitData extends GameData<"submit"> {
    location: LatLonLike,
    mapId: string
}
export interface GameLeaderboardData extends GameData<"leaderboard"> {
    mapId: string
}
export interface GamePracticeBeginDataConfig {
    imageTypes: {
        road: boolean,
        road_surface: boolean,
        scenery: boolean,
        broken: boolean
    },
    difficulties: {
        easy: boolean,
        medium: boolean,
        hard: boolean,
    },
    other: {
        blur: boolean
    }
}
export type AnyGameData = GameInitData | GamePracticeBeginData | GamePracticeSubmitData | GameDailyBeginData | GameSubmitData | GameLeaderboardData
export default async function game(state: AnyGameState, data: AnyGameData): Promise<AnyGameState> {
    const db = await createDB()
    const currentUser = await getCurrentUser()
    switch (data.type) {
        case "init":
            switch (data.gameMode) {
                case "practice":
                    return {
                        step: "config_practice",
                        title: "Configure Practice Mode",
                    }
                case "daily":
                    if (!currentUser) return {
                        step: "login",
                        title: "Log in"
                    }
                    const lastGames = await db.select().from(leaderboard)
                        .innerJoin(map, eq(leaderboard.mapId, map.id))
                        .where(and(
                            eq(leaderboard.userId, currentUser.id),
                            eq(map.type, MapType.DAILY_CHALLENGE)
                        )).limit(1).orderBy(desc(map.creationTime))

                    const lastGame = lastGames[0] && { ...lastGames[0].Leaderboard, map: lastGames[0].Map }
                    return {
                        step: "daily_info",
                        title: "Play today's challenge",
                        lastGame: lastGame ? { ...lastGame, map: { ...lastGame.map, type: lastGame.map.type as MapType, visibility: lastGame.map.type as MapVisibility } } : undefined
                    }
            }
        case "daily_begin":
            const dailyMap = await db.query.map.findFirst({
                where: eq(map.type, MapType.DAILY_CHALLENGE),
                with: { createdBy: true, places: { with: { image: { with: { rect: true } } } } },
                orderBy: (map, { desc }) => [desc(map.creationTime)]
            })
            if (!dailyMap || !dailyMap.places[0].image) return {
                step: "daily_info",
                title: state.title,
                errors: {
                    server: ["Failed to query daily challenge"]
                }
            }
            //temp
            const newImage = dailyMap.places[0].image
            return {
                step: "game",
                title: "",
                round: 1,
                points: 0,
                map: { ...dailyMap, places: [], type: dailyMap.type as MapType, visibility: dailyMap.visibility as MapVisibility },
                image: { ...newImage, lat: 0, lon: 0, available: newImage.available == "true", rect: newImage.rect! }
            }
        case "practice_begin":
            const practiceConfigSchema = z.object({
                imageTypes: atLeastOneTrue({
                    road: z.boolean(),
                    road_surface: z.boolean(),
                    scenery: z.boolean(),
                    broken: z.boolean(),
                }, "Please select at least one image type"),
                difficulties: atLeastOneTrue({
                    easy: z.boolean(),
                    medium: z.boolean(),
                    hard: z.boolean(),
                }, "Please select at least one difficulty"),
                other: z.object({
                    blur: z.boolean()
                })
            })
            const result = z.safeParse(practiceConfigSchema, data.config)

            if (!result.success) {
                return {
                    title: state.title,
                    step: state.step,
                    errors: { practiceConfig: result.error.issues.map(i => i.message) }
                } as BasicGameState
            }

            const newPracticeImage = await db.query.image.findFirst({
                where: and(
                    or(...Object.entries(result.data.difficulties).reduce((prev, [key, value]) => value ? [...prev, eq(image.difficulty, key.toUpperCase())] : prev, new Array<SQL>())),
                    or(...Object.entries(result.data.imageTypes).reduce((prev, [key, value]) => value ? [...prev, eq(image.type, key.toUpperCase())] : prev, new Array<SQL>())),
                    eq(image.available, "true"),
                    eq(image.reviewState, "COMPLETE")
                ),
                orderBy: sql`RANDOM()`,
                with: { rect: true }
            })
            if (!newPracticeImage || !newPracticeImage.rect) return {
                step: state.step,
                title: state.title,
                errors: {
                    server: ["Failed to find image matching selected options. Please broaden selection and try again."]
                }
            } as BasicGameState
            return {
                step: "game",
                title: "Practice",
                image: { ...newPracticeImage, lat: 0, lon: 0, available: newPracticeImage.available == "true", rect: newPracticeImage.rect! },
                points: (state as GamePracticePlayState).points || 0,
                round: ((state as GamePracticePlayState).round || 0) + 1
            }

        case "practice_submit":
            if (!(state as GamePracticePlayState).image?.id) return {
                step: state.step,
                title: state.title,
                errors: {
                    image: ["Invalid image data"]
                },
                image: (state as GamePracticePlayState).image
            } as GamePracticePlayState
            const submittedPracticeImage = await db.query.image.findFirst({ where: eq(image.id, (state as GamePracticePlayState).image?.id || ""), with: { rect: true } })
            if (!submittedPracticeImage) return {
                step: state.step,
                title: state.title,
                errors: {
                    image: ["Invalid image data"]
                },
                image: (state as GamePracticePlayState).image
            } as GamePracticePlayState
            return {
                step: "results",
                title: `Practice mode results`,
                round: (state as GamePracticePlayState).round,
                points: ((state as GamePracticePlayState).points || 0) + score(data.location, submittedPracticeImage),
                prevPoints: (state as GamePracticePlayState).points,
                image: { ...submittedPracticeImage, available: submittedPracticeImage.available == "true", rect: submittedPracticeImage.rect! }
            }
        case "submit":
            if (!(state as GamePlayState).image?.id) return {
                step: state.step,
                title: state.title,
                errors: {
                    image: ["Invalid image data"]
                },
                image: (state as GamePlayState).image
            } as GamePlayState
            const submittedImage = await db.query.image.findFirst({ where: eq(image.id, (state as GamePlayState).image?.id || ""), with: { rect: true } })
            if (!submittedImage) return {
                step: state.step,
                title: state.title,
                errors: {
                    image: ["Invalid image data"]
                },
                image: (state as GamePlayState).image
            } as GamePlayState
            const gameScore = score(data.location, submittedImage)
            if (!currentUser) return {
                step: state.step,
                title: state.title,
                errors: {
                    image: ["Invalid user data"]
                },
                image: (state as GamePlayState).image
            } as GamePlayState
            await db.insert(leaderboard).values({
                mapId: data.mapId,
                score: gameScore,
                userId: currentUser.id,
                id: crypto.randomUUID()
            })
            return {
                step: "results",
                title: "Results",
                round: (state as GamePlayState).round,
                points: ((state as GamePlayState).points || 0) + gameScore,
                prevPoints: (state as GamePlayState).points,
                image: { ...submittedImage, available: submittedImage.available == "true", rect: submittedImage.rect! }
            }
        case "leaderboard":
            const top10 = await db.query.leaderboard.findMany({
                limit: 10,
                extras: {
                    position: sql<number>`ROW_NUMBER() OVER (ORDER BY ${leaderboard.score} DESC)`.as("position")
                },
                with: {
                    user: true
                },
                where: and(
                    eq(leaderboard.mapId, data.mapId),
                ),
                orderBy: (leaderboard, { desc, asc }) => [desc(leaderboard.score), asc(leaderboard.timestamp)]
            })
            if (top10.some(e => e.userId == currentUser?.id)) return {
                step: "leaderboard",
                title: "Leaderboard",
                items: top10.map(e => ({...e, user: {...e.user, email: "", admin: e.user.admin == "true"}}))
            }
            if (!currentUser) return {
                step: state.step,
                title: state.title,
                errors: {
                    server: ["Not logged in"]
                }
            } as BasicGameState
            const userScore = await db.query.leaderboard.findMany({
                extras: {
                    position: sql<number>`ROW_NUMBER() OVER (ORDER BY ${leaderboard.score} DESC)`.as("position")
                },
                with: {
                    user: true
                },
                where: and(
                    eq(leaderboard.mapId, data.mapId),
                    eq(leaderboard.userId, currentUser.id)
                ),
                orderBy: (leaderboard, { desc }) => [desc(leaderboard.score)],
                limit: 1
            })
            return {
                step: "leaderboard",
                title: "Leaderboard",
                items: [...top10, ...userScore].sort((a,b) => b.score - a.score).map(e => ({...e, user: {...e.user, email: "", admin: e.user.admin == "true"}}))
            }

    }
}
