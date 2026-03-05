"use server"

import Button from "@/components/button"
import Card from "@/components/card"
import ImageWithTime from "@/components/imagewithtime"
import Toast from "@/components/toast"
import { getImageTimeOffset, getImageUrl, ImagePresetHistory, MapPlace } from "@/lib/definitions"
import { getMap } from "@/lib/public"
import moment from "moment"
import Link from "next/link"

export default async function MapPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const map = await getMap(id)

    if (!map) return (
        <>
            <Toast type="error" message={`Could not access map with id ${id}. It may not exist, or you may not have access to it.`}></Toast>
        </>
    )
    return (
        <div className="h-full w-full flex items-center justify-center">
            <Card className="w-6/10! items-start" cardTitle={map.name || "unnamed map"}>
                <div className="w-full">
                    <div className="px-4">
                        A map by <Link className="text-green-600 underline" href={`/user/${map.createdBy?.id || ""}`}>{map.createdBy?.name}</Link> &middot;
                        Created {moment(new Date(map.creationTime).getTime() - new Date().getTimezoneOffset() * 60_000).fromNow()} &middot;
                        last edited {moment(new Date(map.updateTime).getTime() - new Date().getTimezoneOffset() * 60_000).fromNow()}
                    </div>
                    <Link className="px-4" href={`/play/custom?map=${map.id}`}>
                        <Button className="text-lg my-2">Play</Button>
                    </Link>
                    <br className="mb-2" />
                    <h2 className="text-lg font-medium pl-4">Images ({(map.places?.length || 0)})</h2>
                    <div className="px-2 w-full">
                        <div className="flex flex-row overflow-y-scroll gap-2 w-full p-4 pt-2 pb-6">
                            {...(map.places || []).map((e, i) => (
                                <ImageCard key={i} e={e}></ImageCard>
                            ))}
                        </div>
                    </div>

                </div>
            </Card>
        </div>
    )
}
async function ImageCard({ e }: { e: MapPlace }) {
    if (!e.image) return <div></div>
    const imageHistory = await (await fetch(`https://tie.digitraffic.fi/api/weathercam/v1/stations/${e.image.externalId}/history`)).json() as ImagePresetHistory

    return (
        <Card imageCard className="w-60! min-w-60 h-full item bg-white" cardTitle={`${e.image.source}:${e.image?.externalId}`}>
            <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(e.image?.externalId || "", e.image?.source || "")} alt="" className="opacity-0"></img>
                <ImageWithTime time={getImageTimeOffset(e.time || 0)} presetHistory={imageHistory} image={e.image} alt="" className="absolute left-0 right-0 top-0 active:z-1009 active:transform-[scale(2)] transition ease-in-out"></ImageWithTime>
            </div>
        </Card>
    )
}