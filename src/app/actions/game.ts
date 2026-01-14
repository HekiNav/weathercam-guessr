import { FormState } from "@/lib/definitions";
import { Image } from "./image";

export interface GameState extends FormState<[]> {
    image: Image,
    points: number
}
export default function game(state: GameState) {
    
}