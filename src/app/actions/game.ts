import { FormState } from "@/lib/definitions";
import { Image } from "./image";

export interface GameState extends FormState<[]> {
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
export default function game(state: GameState, data: GameInitData): GameState {
    switch (data.type) {
        case "init":
            switch (data.gameMode) {
                case "practice":
                    return {
                        step: "config_prectice",
                        title: "Configure Practice Mode",
                    }
                case "daily":
                    return {
                        step: "wip",
                        title: "WIP"
                    }
            }
    }
}