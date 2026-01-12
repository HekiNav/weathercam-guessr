"use client"
import { startTransition, useActionState, useContext, useState } from "react"
import { ImageReviewFormState, reviewImages } from "../actions/image"
import Card from "../../components/card"
import Button from "../../components/button"
import { UserContext } from "../user-provider"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import ImageWithBlur from "@/components/blurredimage"

export enum ImageType {
    ROAD_SURFACE = "ROAD_SURFACE",
    SCENERY = "SCENERY",
    ROAD = "ROAD",
    UNCLASSIFIED = "UNCLASSIFIED",
}

export enum ImageDifficulty {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
    UNCLASSIFIED = "UNCLASSIFIED"
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
        toast.warning("You aren't supposed to be there")
        redirect("/")
    }
    const [{ step, errors, currentImage }, action, pending] = useActionState(reviewImages, { currentImage: null, step: "start" } as ImageReviewFormState)

    const [difficulty, setDifficulty] = useState<ImageDifficulty>((currentImage?.difficulty as ImageDifficulty) || ImageDifficulty.UNCLASSIFIED)
    const [type, setType] = useState<ImageType>((currentImage?.type as ImageType) || ImageType.UNCLASSIFIED)
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
                        <Button disabled={pending} onClick={() => startTransition(() => action({ type: "begin" }))}>
                            Begin reviewing images
                        </Button>
                    </div>
                )}
                {(step == "review" && currentImage) && (
                    <div className="w-full flex flex-row divide-x-2 divide-green-600 p-4">
                        <div className="flex flex-col w-full pb-2 shrink w-min pr-2">
                            <span>Difficulty</span>
                            <Dropdown onSet={(item) => item.id && setDifficulty(item.id)} items={difficultyItems} initial={difficultyItems.find(i => i.id == difficulty)?.content || "Unclassified"}></Dropdown>
                            <span className="mt-2">Type</span>
                            <Dropdown onSet={(item) => item.id && setType(item.id)} items={typeItems} initial={typeItems.find(i => i.id == type)?.content || "Unclassified"}></Dropdown>
                        </div>
                        <ImageWithBlur src={getImageUrl(currentImage?.externalId, currentImage?.source)} className="w-full h-full grow ml-2" alt="image" blur={tempBlurRect} onMouseMove={(e) => {
                            const el = (e.target as HTMLDivElement)
                            const rect = el.getBoundingClientRect()
                            if (!rect) return
                            const x = e.clientX - rect.left
                            const y = e.clientY - rect.top
                            if (Math.pow(x, 2) + Math.pow(y, 2) < Math.pow(rect.width * 0.6, 2) + Math.pow(rect.height * 0.6, 2))
                                setTempBlurRect({ x: 0, y: 0, width: Math.round(x / rect.width * 100), height: Math.round(y / rect.height * 100) })
                            else setTempBlurRect({ x: Math.round(x / rect.width * 100), y: Math.round(y / rect.height * 100), width: 100, height: 100})
                        }} onClick={() => setBlurRect(tempBlurRect)} />
                    </div>
                )}
                {step == "complete" && (
                    <>
                        All done!
                        <br />
                        <Button className="mt-2" disabled={pending} onClick={() => redirect("/")}>
                            Go to home
                        </Button>
                    </>
                )}
            </Card>
        </div>
    )
}
function getImageUrl(id: string, source: string) {
    switch (source) {
        case "DIGITRAFFIC":
            return `https://weathercam.digitraffic.fi/${id}.jpg`
        default:
            return id
    }
}