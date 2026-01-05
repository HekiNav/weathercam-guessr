"use client"
import { startTransition, useActionState } from "react"
import { ImageReviewFormState, reviewImages } from "../actions/image"
import Card from "../ui/card"
import Button from "../ui/button"

export default function ReviewPage() {
    const [{ step, errors, currentImage }, action, pending] = useActionState(reviewImages, { currentImage: null, step: "start" } as ImageReviewFormState)

    return (
        <div className="w-full h-full flex items-center grow justify-center">
            <Card className="capitalize font-sans" title={step || "unknown step"}>
                {step == "start" && (
                    <div>
                        <Button disabled={pending} onClick={() => startTransition(() => action({type: "begin"}))}>
                            Begin reviewing images
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}