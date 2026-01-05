import { getReviewableImages } from "../actions/image"

export default async function ReviewPage() {
    const images = await getReviewableImages()
    console.log(images)
    return (
        <div>
            review pls
        </div>
    )
}