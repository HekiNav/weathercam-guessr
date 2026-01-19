"use client"
import { startTransition, useActionState, useContext, useEffect, useState } from "react"
import { ImageReviewFormState, reviewImages } from "../actions/image"
import Card from "../../components/card"
import Button from "../../components/button"
import { UserContext } from "../user-provider"
import { redirect } from "next/navigation"
import { toast } from "react-hot-toast"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import ImageWithBlur from "@/components/blurredimage"

export enum UnclassifiedEnum {
    UNCLASSIFIED = "UNCLASSIFIED",
}

export enum ImageType {
    ROAD_SURFACE = "ROAD_SURFACE",
    SCENERY = "SCENERY",
    ROAD = "ROAD",
}

export enum ImageDifficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
}
export interface BlurRect {
    x: number
    y: number
    width: number
    height: number
}

export default function ReviewPage() {
    const user = useContext(UserContext)


    if (!user?.admin) {
        useEffect(() => {
            toast.error("You aren't supposed to be there")
            redirect("/")
        })
        return <div></div>

    }
    const [{ step, errors, currentImage }, action, pending] = useActionState(reviewImages, { currentImage: null, step: "start" } as ImageReviewFormState)

    const [difficulty, setDifficulty] = useState<ImageDifficulty | UnclassifiedEnum>((currentImage?.difficulty as ImageDifficulty) || UnclassifiedEnum.UNCLASSIFIED)
    const [type, setType] = useState<ImageType | UnclassifiedEnum>((currentImage?.type as ImageType) || UnclassifiedEnum.UNCLASSIFIED)
    const [blurRect, setBlurRect] = useState<BlurRect | null>((currentImage?.rect as BlurRect | undefined) || null)
    const [tempBlurRect, setTempBlurRect] = useState<BlurRect>((currentImage?.rect as BlurRect | undefined) || {
        x: 0,
        y: 0,
        width: 100,
        height: 100
    })

    const difficultyItems: DropdownItem<ImageDifficulty>[] = [
        {
            id: ImageDifficulty.EASY,
            content: "Easy"
        },
        {
            id: ImageDifficulty.MEDIUM,
            content: "Medium"
        },
        {
            id: ImageDifficulty.HARD,
            content: "Hard"
        }
    ]
    const typeItems: DropdownItem<ImageType>[] = [
        {
            id: ImageType.ROAD,
            content: "Road"
        },
        {
            id: ImageType.ROAD_SURFACE,
            content: "Surface of road only (closeup)"
        },
        {
            id: ImageType.SCENERY,
            content: "Mostly scenery, not along road"
        }
    ]
    return (
        <div className="w-full h-full flex items-center grow justify-center flex-row">
            <Card className={`capitalize font-sans ${step == "review" ? "grow h-full m-5" : ""}`} title={step || "unknown step"}>
                {step == "start" && (
                    <div>
                        <Button disabled={pending}
                            autoFocus onPress={() => startTransition(() => action({ type: "begin" }))}>
                            Begin reviewing images
                        </Button>
                    </div>
                )}
                {(step == "review" && currentImage) && (
                    <div className="w-full flex flex-row divide-x-2 divide-green-600 p-4">
                        {/* Sidebar */}
                        <div className="flex flex-col w-full pb-2 shrink w-min pr-2 text-nowrap">
                            <span>Reason for review:</span>
                            <span className={`capitalize shadow-lg/20 p-1 rounded ${currentImage.reviewState == "REPORTED" ? "bg-red-600" : "bg-yellow-600"}`}>{currentImage.reviewState}</span>
                            <span className="mt-2">Difficulty</span>
                            <Dropdown onSet={(item) => item.id && setDifficulty(item.id)} items={difficultyItems} initial={difficultyItems.find(i => i.id == difficulty)?.content || "Unclassified"}></Dropdown>
                            <div className="text-red-600">{errors?.imageDifficulty?.join(", ")}</div>
                            <span className="mt-2">Type</span>
                            <Dropdown onSet={(item) => item.id && setType(item.id)} items={typeItems} initial={typeItems.find(i => i.id == type)?.content || "Unclassified"}></Dropdown>
                            <div className="text-red-600">{errors?.imageType?.join(", ")}</div>
                            <span className="mt-2">Blur rect</span>
                            <div className="p-1 rounded border-2 border-green-600 shadow-lg/20">
                                {(blurRect) ? (<>Left: {blurRect.x}<br /> Top: {blurRect.y}<br /> Right: {blurRect.width}<br /> Bottom: {blurRect.height}</>) : (<>Unset</>)}
                            </div>
                            <div className="text-red-600">{errors?.blurRect?.join(", ")}</div>
                            <Button disabled={pending} className="mt-2" onClick={() => { startTransition(() => action({ type: "submit", imageDifficulty: difficulty, imageType: type, blurRect: blurRect })) }}>Submit</Button>
                        </div>

                        <ImageWithBlur src={getImageUrl(currentImage?.externalId, currentImage?.source)} className="w-full h-full grow ml-2" alt="image" blur={tempBlurRect} onMouseMove={(e) => {
                            const el = (e.target as HTMLImageElement).classList.contains("image") ? (e.target as HTMLImageElement) : (e.target as HTMLImageElement).parentElement?.querySelector(".image")
                            const rect = el?.getBoundingClientRect()
                            if (!rect) return
                            let x = e.clientX - rect.left
                            let y = e.clientY - rect.top
                            if (y < rect.height * 0.5)
                                setTempBlurRect({ x: 0, y: 0, width: Math.round(x / rect.width * 100), height: Math.round(y / rect.height * 100) })
                            else setTempBlurRect({ x: Math.round(x / rect.width * 100), y: Math.round(y / rect.height * 100), width: 100, height: 100 })
                        }} onClick={() => setBlurRect(tempBlurRect)} onMouseOut={() => blurRect && setTempBlurRect(blurRect)} />
                    </div>
                )}
                {step == "complete" && (
                    <>
                        All done!
                        <br />
                        <Button className="mt-2" disabled={pending}
                            autoFocus onPress={() => redirect("/")}>
                            Go to home
                        </Button>
                    </>
                )}
            </Card>
        </div>
    )
}
export function getImageUrl(id: string, source: string) {
    switch (source) {
        case "DIGITRAFFIC":
            return `https://weathercam.digitraffic.fi/${id}.jpg`
        default:
            return id
    }
}