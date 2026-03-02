import { FormState, MapVisibility } from "@/lib/definitions";
import z from "zod";

export const MapCreationData = z.object({
    name: z.string(),
    visibility: z.enum(MapVisibility)
})
export type MapCreationDataState = z.infer<typeof MapCreationData>
export type MapCreateState = FormState<["name", "visibility", ""]> 
export async function createMap(state: AnyGameState, data: AnyGameData) {

}