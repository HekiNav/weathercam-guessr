import { getBucket } from "@/lib/db"

export async function GET() {
    const foobucket = await getBucket()
    return Response.json(await (await foobucket.get("weathercam-guessr-images.geojson"))?.json())
}