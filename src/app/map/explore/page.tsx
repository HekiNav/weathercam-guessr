"use server"

import Card from "@/components/card"
import ImageWithTime from "@/components/imagewithtime"
import PlaceholderImage from "@/components/placeholderimage"
import Toast from "@/components/toast"
import { getCurrentUser } from "@/lib/auth"
import { getImageUrl, getImageTimeOffset, ImagePresetHistory, MapVisibility } from "@/lib/definitions"
import { getMaps } from "@/lib/public"
import moment from "moment"
import Link from "next/link"

export default async function MapExplorePage() {
    const maps = await getMaps()
    const currentUser = await getCurrentUser(true)
    if (!maps) return <>
        <Toast message="Failed to load maps" type="error" />
    </>
    return (
        <div className="w-full h-full flex flex-row justify-center flex-wrap p-4 gap-4">
            {...maps.filter(m => m.visibility == MapVisibility.PUBLIC || currentUser?.id == m.createdById || (m.visibility == MapVisibility.FRIENDS && currentUser?.friends?.some(f => f.user1id == m.createdById || f.user2id == m.createdById))).map(async (m, i) => {
                const { image, time } = m.places && m.places[0] || {}
                const imageHistory = image && await (await fetch(`https://tie.digitraffic.fi/api/weathercam/v1/stations/${image.externalId}/history`)).json() as ImagePresetHistory

                return (
                    <Link key={i} href={`/map/${m.id}`}>
                        <Card imageCard className="h-min item bg-white" cardTitle={`${m.name} by ${m.createdBy?.name}`}>
                            <div className="relative w-full">
                                {image && (
                                    <>
                                        <ImageWithTime
                                            time={getImageTimeOffset(time || 0)}
                                            presetHistory={imageHistory || null}
                                            image={image} alt=""
                                            className="absolute left-0 right-0 top-0">
                                        </ImageWithTime>
                                    </>
                                )}
                                {!image && (
                                    <PlaceholderImage className="h-30!"></PlaceholderImage>
                                )}
                                <h2 className="text-md font-medium pl-4 mt-2">{(m.places?.length || 0)} images</h2>
                                <div className="px-4">
                                    Created {moment(new Date(m.creationTime).getTime() - new Date().getTimezoneOffset() * 60_000).fromNow()} &middot;
                                    last edit {moment(new Date(m.updateTime).getTime() - new Date().getTimezoneOffset() * 60_000).fromNow()}
                                </div>
                            </div>
                        </Card>
                    </Link>
                )
            })}
        </div >
    )
}