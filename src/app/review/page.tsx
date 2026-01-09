"use client"
import { startTransition, useActionState, useContext } from "react"
import { ImageReviewFormState, reviewImages } from "../actions/image"
import Card from "../../components/card"
import Button from "../../components/button"
import { UserContext } from "../user-provider"
import { redirect } from "next/navigation"
import { toast } from "sonner"

export default function ReviewPage() {
    const user = useContext(UserContext)
    if (!user?.admin) {
        toast.warning("You aren't supposed to be there")
        redirect("/")
    }
    const [{ step, errors, currentImage }, action, pending] = useActionState(reviewImages, { currentImage: null, step: "start" } as ImageReviewFormState)
    console.log(errors, currentImage)
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