"use server"
import { atLeastOneTrue, FormState, Game, LatLonLike, MapType, MapVisibility, score } from "@/lib/definitions";
import { Image } from "./image";
import { createDB } from "@/lib/db";
import z from "zod";
import { and, eq, or, sql, SQL } from "drizzle-orm";
import { image, leaderboard, map } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export interface GameState<T extends string> extends FormState<["practiceConfig", "server", "image"]> {
    step: T,
    title: string,

}
export type BasicGameState = GameState<"config_practice" | "init" | "login">
export type AnyGameState = GamePlayState | GameDailyInfoState | BasicGameState

export interface GamePlayState extends GameState<"game" | "results"> {
    round: number,
    maxRound?: number,
    points: number,
    prevPoints?: number,
    image: Image,
}
export interface GameDailyInfoState extends GameState<"daily_info"> {
    lastGame?: Game
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
export interface GameDailyBeginData extends GameData<"daily_begin"> {
    game: Game
}
export interface GamePracticeSubmitData extends GameData<"practice_submit"> {
    location: LatLonLike
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
export type AnyGameData = GameInitData | GamePracticeBeginData | GamePracticeSubmitData | GameDailyBeginData
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
                        )).limit(1)
                    
                    const lastGame = lastGames[0] && {...lastGames[0].Leaderboard, map: lastGames[0].Map}
                    return {
                        step: "daily_info",
                        title: "Play today's challenge",
                        lastGame: {...lastGame, map: {...lastGame.map, type: lastGame.map.type as MapType, visibility: lastGame.map.type as MapVisibility}}
                    }
            }
        case "daily_begin":
            //temp
            return {
                step: "init",
                title: ""
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
                points: (state as GamePlayState).points || 0,
                round: ((state as GamePlayState).round || 0) + 1
            }

        case "practice_submit":
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
            return {
                step: "results",
                title: "Practice mode results",
                round: (state as GamePlayState).round,
                points: ((state as GamePlayState).points || 0) + score(data.location, submittedImage),
                prevPoints: (state as GamePlayState).points,
                image: { ...submittedImage, available: submittedImage.available == "true", rect: submittedImage.rect! }
            }
    }
}
