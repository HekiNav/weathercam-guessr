"use server"
import { FormState } from "@/lib/definitions";
import { Image } from "./image";
import { createDB } from "@/lib/db";
import z, { object, ZodBoolean } from "zod";

export interface GameState extends FormState<["practiceConfig"]> {
    image?: Image,
    points?: number,
    title: string
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


            const image = await db.query.image.findFirst()
            return {
                step: "play_practice",
                title: "Practice"
            }
    }
}
const atLeastOneTrue = (shape: Record<string, ZodBoolean>, error: string) => z.object(shape).refine((obj) => !Object.values(obj).every(v => v == false),{error: error});