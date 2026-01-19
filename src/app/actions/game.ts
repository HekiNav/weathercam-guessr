"use server"
import { FormState } from "@/lib/definitions";
import { Image } from "./image";
import { createDB } from "@/lib/db";
import z, { ZodBoolean } from "zod";
import { and, eq, or, sql, SQL } from "drizzle-orm";
import { image } from "@/db/schema";

export interface GameState extends FormState<["practiceConfig", "server"]> {
    image?: Image,
    points?: number,
    title: string,
    round?: number,
    maxRound?: number
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
export interface GamePracticeBeginDataConfig {
    imageTypes: {
        road: boolean,
        road_surface: boolean,
        scenery: boolean,
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
export default async function game(state: GameState, data: GameInitData | GamePracticeBeginData): Promise<GameState> {
    switch (data.type) {
        case "init":
            switch (data.gameMode) {
                case "practice":
                    return {
                        step: "config_practice",
                        title: "Configure Practice Mode",
                    }
                case "daily":
                    return {
                        step: "wip",
                        title: "WIP"
                    }
            }
        case "practice_begin":
            const practiceConfigSchema = z.object({
                imageTypes: atLeastOneTrue({
                    road: z.boolean(),
                    road_surface: z.boolean(),
                    scenery: z.boolean(),
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
                console.log()
                return {
                    title: state.title,
                    step: state.step,
                    errors: { practiceConfig: result.error.issues.map(i => i.message) }
                }
            }
            const db = await createDB()

            const newPracticeImage = await db.query.image.findFirst({
                where: and(
                    or(...Object.entries(result.data.difficulties).reduce((prev ,[key, value]) => value ? [...prev, eq(image.difficulty, key.toUpperCase())] : prev, new Array<SQL>())),
                    or(...Object.entries(result.data.imageTypes).reduce((prev ,[key, value]) => value ? [...prev, eq(image.type, key.toUpperCase())] : prev, new Array<SQL>())),
                    eq(image.available, "true"),
                    eq(image.reviewState, "COMPLETE")
                ),
                orderBy: sql`RANDOM()`,
                with: {rect: true}
                })
            if (!newPracticeImage || !newPracticeImage.rect) return {
                step: state.step,
                title: state.title,
                errors: {
                    server: ["Failed to find image matching selected options. Please broaden selection and try again."]
                }
            }
            return {
                step: "game",
                title: "Practice",
                image: {...newPracticeImage, available: newPracticeImage.available == "true", rect: newPracticeImage.rect!},
                points: 0,
                round: 0
            }
    }
}
const atLeastOneTrue = (shape: Record<string, ZodBoolean>, error: string) => z.object(shape).refine((obj) => !Object.values(obj).every(v => v == false),{error: error});