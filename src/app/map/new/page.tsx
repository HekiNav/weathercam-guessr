"use client"
import { UserContext } from "@/app/user-provider"
import Button from "@/components/button"
import Toggle from "@/components/toggle"
import { distanceBetweenPoints, FINLAND_BOUNDS, getImageTimeOffset, getImageTimePreset, getImageUrl, ImageOrder, ImagePresetHistory, MapPlaceTimePresets, MapVisibility } from "@/lib/definitions"
import { Feature, FeatureCollection, Point } from "geojson"
import { GeoJSONSource } from "maplibre-gl"
import { redirect } from "next/navigation"
import { Dispatch, memo, SetStateAction, startTransition, useActionState, useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Layer, Map, MapRef } from "react-map-gl/maplibre"
import { Image } from "@/app/actions/image"
import Card from "@/components/card"
import Icon from "@/components/icon"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import ImageWithTime from "@/components/imagewithtime"
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { getImages } from "@/lib/public"
import * as NextImage from "next/image"
import { createMap, MapEditingDataType, MapEditingState } from "@/app/actions/map"

export default function MapCreationUi() {
    return <MapEditingUi saveFunc={createMap} />
}

export interface MapEditingUiProps {
    saveFunc: (state: MapEditingState, data: MapEditingDataType) => Promise<MapEditingState>
    images?: (Image & { time?: number })[]
    order?: ImageOrder
    name?: string | null
    id?: string
    visibility?: MapVisibility
    imageGeojsonAvailable?: boolean
    imageLocationBlurred?: boolean
}

export function MapEditingUi(props: MapEditingUiProps) {
    const user = useContext(UserContext)

    const mapRef = useRef<MapRef>(null)


    const [mapName, setMapName] = useState(props.name || "")

    useEffect(() => {
        if (!user) {
            toast("Please log in before creating maps")
            redirect("/login")
        }
    })
    const [images, setImages] = useState<(Image & { time?: number })[]>(props.images || [])
    const [selectedImages, setSelectedImages] = useState<Image[] | null>(null)

    const [mapType, setMapType] = useState<boolean>(props.order == ImageOrder.ORDERED || false)
    const [mapRoundLimit, setMapRoundLimit] = useState(5)
    const [mapVisibility, setMapVisibility] = useState<MapVisibility>(MapVisibility.PRIVATE)
    const [imageBlur, setImageBlur] = useState<boolean>(props.imageLocationBlurred !== undefined ? props.imageLocationBlurred :true)
    const [showGeojson, setShowGeojson] = useState<boolean>(props.imageGeojsonAvailable !== undefined ? props.imageGeojsonAvailable : true)
    const [browserState, setBrowserState] = useState<boolean>(false)


    const [imageList, setImageList] = useState<Image[] | null>(null)
    useEffect(() => {
        if (!imageList) getImages().then((data) => {
            setImageList(data?.features.map(f => f.properties) || [])
        })
    })

    const [state, action, pending] = useActionState(props.saveFunc, {})

    useEffect(() => {
        if (state.step == "success" && state.mapId) {
            redirect(`/map/${state.mapId}`)
        }
    }, [state])

    useEffect(() => {
        mapRef.current?.resize()
    }, [browserState])

    useEffect(() => {
        state.errors?.server?.forEach(m => toast.error(m))
    }, [state.errors?.server])

    if (!user) {
        redirect("/login?to/map/new/")
    }
    // handle sorting
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (!over || active.id === over.id) return

        setImages((prev) => {
            const oldIndex = prev.findIndex(img => img.id === active.id)
            const newIndex = prev.findIndex(img => img.id === over.id)

            return arrayMove(prev, oldIndex, newIndex)
        })
    }

    return <div className="flex flex-col-reverse md:flex-row-reverse h-full w-screen">
        <div className="main flex flex-col h-full w-full relative">
            <div className="browser-mode px-4 py-2 flex flex-row items-center absolute bg-white top-0 right-0 z-1003 rounded-bl-xl">
                Map
                <Toggle noColors state={browserState} setState={setBrowserState}></Toggle>
                List
            </div>
            <div className="browser grow border-b-3 border-green-600 w-full">

                <ImageList
                    browserState={browserState}
                    imageList={imageList || []}
                    images={images}
                    selectedImages={selectedImages}
                    setImages={setImages}
                    setSelectedImages={setSelectedImages}
                />

                <div hidden={browserState} className="map h-10/10 relative">
                    <div hidden={!selectedImages || !selectedImages.length} className="absolute left-0 z-1001 top-0 bg-white p-4 gap-2 rounded-br-xl flex flex-col max-h-8/10 overflow-scroll">
                        <h3 className="font-medium text-lg text-green-600">Selected images</h3>
                        {...(selectedImages || []).map((e, i) => (
                            <Card key={i} className="w-40!" small cardTitle={(<span className="font-bold flex items-center justify-between">{e.externalId}<Button disabled={images.some(i => i.id == e.id)} onClick={() => {
                                setImages([...images, e])
                                setSelectedImages(selectedImages?.reduce((p, c) => c.id != e.id ? [...p, c] : p, new Array<Image>()) || null)
                            }} className={`w-5 h-5 p-0! flex items-center align-center justify-center ${images.some(i => i.id == e.id) ? "" : "bg-white"}`}><Icon icon={faPlus}></Icon></Button></span>)}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(e.externalId, e.source) + "?thumbnail=true"} alt="" className="w-full"></img>
                            </Card>
                        ))}
                    </div>
                    <div className="absolute right-0 left-0 z-1000 bottom-0 top-0">
                        <Map attributionControl={false} onLoad={() => {
                            if (!mapRef.current?.getSource("images")) mapRef.current?.getMap().addSource("images", { type: "geojson", data: "/api/map/images.geojson" });
                            if (!mapRef.current?.hasImage("red-pin")) {
                                const image = document.createElement("img")
                                image.src = "/pin.svg"
                                image.addEventListener("load", () => {
                                    mapRef.current?.addImage("red-pin", image)
                                })
                            }
                        }} onClick={async (e) => {
                            const maxDistance = e.target.getZoom() < 9 ? 10000 : 1000;
                            const geojson = await (e.target.getSource("images") as GeoJSONSource).getData()

                            const selectedFeatures = ((geojson as FeatureCollection).features as Feature<Point, Image & { distance: number }>[]).reduce((prev, curr) => {
                                const distance = distanceBetweenPoints({ lat: e.lngLat.lng, lon: e.lngLat.lat }, (curr.geometry as Point).coordinates as [number, number])
                                if (distance < maxDistance) return [...prev, { ...curr, geometry: curr.geometry as Point, properties: { ...curr.properties, distance: distance } }]
                                else return prev
                            }, new Array<Feature<Point, Image & { distance: number }>>()).sort((a, b) =>
                                a.properties.distance - b.properties.distance
                            )
                            if (selectedImages?.every((e, i) => e.id == selectedFeatures[i].properties.id) && selectedImages.length) return
                            setSelectedImages(selectedFeatures.map(f => f.properties))

                        }} initialViewState={{ bounds: FINLAND_BOUNDS, fitBoundsOptions: { padding: 1 } }} ref={mapRef} mapStyle="/map_style.json">
                            <Layer id="image_outer" type="circle" paint={{
                                "circle-radius": 10,
                                "circle-color": "#166534"
                            }} source="images"></Layer>
                            <Layer id="image_inner" type="circle" paint={{
                                "circle-radius": 7,
                                "circle-color": "#16a34a"
                            }} source="images"></Layer>
                        </Map>
                    </div>

                </div>
            </div>
            <div className="w-full relative h-80">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={images.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                        <ul className="list preview px-4 py-4 flex flex-row gap-4 absolute z-1002 top-0 bottom-0 left-0 right-0 overflow-x-scroll overflow-y-none">
                            {...images.map((e, i) => (
                                <ImageCard
                                    draggable={mapType}
                                    error={state.errors?.images && state.errors.images[i]}
                                    key={e.id}
                                    e={e}
                                    i={i}
                                    images={images}
                                    mapType={mapType}
                                    setImages={setImages}
                                />

                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
        <div className="menu h-min px-4 py-4 pb-4 border-b-3 border-green-600 w-full md:w-fit md:border-0 md:border-r-3 md:h-full min-w-2/10 flex flex-col md: overflow-scroll">
            <input className="font-medium text-2xl w-full text-green-600 rounded p-1 border-2"
                value={mapName} placeholder="New map" maxLength={40} onChange={e => setMapName(e.target.value)}></input>
            <div className="text-red-600">{state.errors?.name?.join(", ")}</div>
            <h1 className="font-medium text-xl mt-4">Options</h1>
            <span className="font-bold mr-2 mt-2 text-lg">Map order:</span>
            <div className="browser-mode flex flex-row items-center">
                Random
                <Toggle noColors state={mapType} setState={setMapType}></Toggle>
                Ordered
            </div>
            <div className="text-red-600">{state.errors?.order?.join(", ")}</div>

            <RangeInput
                images={images}
                mapRoundLimit={mapRoundLimit}
                setMapRoundLimit={setMapRoundLimit}
            />

            <span className="font-bold mr-2 mt-2 text-lg">Visibility:</span>
            <Dropdown<MapVisibility> onSet={({ id }) => id && setMapVisibility(id)} items={
                [
                    { content: "Hidden (only accessible with link)", id: MapVisibility.HIDDEN },
                    { content: "Friends only", id: MapVisibility.FRIENDS },
                    { content: "Private", id: MapVisibility.PRIVATE },
                    { content: "Public", id: MapVisibility.PUBLIC }
                ]
            } initial={"Private"}></Dropdown>
            <div className="text-red-600">{state.errors?.visibility?.join(", ")}</div>
            <span className="font-bold mr-2 mt-2 text-lg">Other:</span>
            <div className="browser-mode flex flex-row items-center">
                Blur image location info
                <Toggle state={imageBlur} setState={setImageBlur}></Toggle>
                <div className="text-red-600">{state.errors?.blur?.join(", ")}</div>
            </div>
            <div className="browser-mode flex flex-row items-center">
                Show available <br></br>locations on map
                <Toggle state={showGeojson} setState={setShowGeojson}></Toggle>
                <div className="text-red-600">{state.errors?.geojson?.join(", ")}</div>

            </div>
            <Button disabled={pending} onClick={() => startTransition(() => action({
                id: props.id,
                blur: imageBlur,
                geojson: showGeojson,
                images: images.map((e, i) => ({ time: e.time || -1, index: i, image: e.id })),
                visibility: mapVisibility,
                name: mapName,
                order: mapType ? ImageOrder.ORDERED : ImageOrder.RANDOM
            }))} className="justify-self-end mt-4">Save</Button>
        </div>
    </div>
}



interface ImageCardProps {
    e: (Image & { time?: number });
    i: number;
    error?: {
        index?: string[],
        id?: string[],
        time?: string[]
    }
    images: (Image & { time?: number })[];
    mapType: boolean;
    draggable: boolean;
    setImages: Dispatch<SetStateAction<(Image & { time?: number })[]>>;
}


function ImageCard({ e,
    images,
    mapType,
    draggable,
    error,
    setImages }: ImageCardProps) {
    const [imageTimeMode, setImageTimeMode] = useState(e.time && getImageTimePreset(e.time) || -2)

    const { attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition } = useSortable({ id: e.id, disabled: !draggable })


    const IMAGE_CUSTOM_TIME_INTERVAL_MINUTES = 30
    const imageCustomItems: DropdownItem<number>[] = []
    const tzOffset = getOffset("Europe/Helsinki") * 60_000

    for (let i = 0; i < 24 * 3600 * 1000; i += IMAGE_CUSTOM_TIME_INTERVAL_MINUTES * 60_000) {
        imageCustomItems.push({
            content: `${Math.floor(i / 3600 / 1000).toString().padStart(2, "0")}:${Math.floor((i % 3600_000) / 60_000).toString().padStart(2, "0")}`,
            id: (i - tzOffset + 24 * 3600 * 1000) % (24 * 3600 * 1000)
        })

    }
    imageCustomItems.sort()

    useEffect(() => {
        setImages((prev) => {
            const index = prev.findIndex(i => i.id == e.id)
            prev[index].time = getImageTimeOffset(imageTimeMode == -4 ? imageCustomTime : imageTimeMode)
            return prev
        })
    })

    const dayModes = [
        { content: "Current", id: -1 },
        { content: "Day", id: -2 },
        { content: "Night", id: -3 },
        { content: "Custom", id: -4 }
    ]

    const [imageCustomTime, setImageCustomTime] = useState((e.time && imageTimeMode == -4 && imageCustomItems.find(i => i.id == e.time)?.id) || 0)

    const [imageHistory, setImageHistory] = useState<ImagePresetHistory | null>(null)
    if (!imageHistory) fetch(`https://tie.digitraffic.fi/api/weathercam/v1/stations/${e.externalId}/history`).then(res => res.json()).then(data => {
        setImageHistory(data as ImagePresetHistory)
    })
    return (
        <Card style={{
            transform: CSS.Transform.toString(transform),
            transition: transition
        }} ref={setNodeRef} imageCard className="w-60! min-w-60 h-full item bg-white" cardTitle={(
            <div className="">
                <span className="font-bold h-full grid grid-rows-1 grid-cols-3 items-center">
                    <span className="justify-self-start">{e.externalId}</span>
                    <span ref={setActivatorNodeRef} {...listeners} {...attributes} className="justify-self-center cursor-grab">
                        <span hidden={!mapType} className="h-4 flex items-center justify-center w-min gap-1">
                            <div className="w-0.5 bg-green-800 h-full rounded"></div>
                            <div className="w-0.5 bg-green-800 h-full rounded"></div>
                            <div className="w-0.5 bg-green-800 h-full rounded"></div>
                        </span>
                    </span>
                    <span className="justify-self-end">
                        <Button onClick={() => {
                            setImages(images.reduce((p, c) => c.id != e.id ? [...p, c] : p, new Array<Image>()) || null)
                        }} className={`w-5 h-5 p-0! flex items-center align-center justify-center bg-white`}>
                            <Icon icon={faMinus}></Icon>
                        </Button>
                    </span>
                </span>
            </div>)}>
            <div className="text-red-600">{error?.id?.join(", ")}</div>
            <div className="text-red-600">{error?.index?.join(", ")}</div>
            <div className="relative w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getImageUrl(e.externalId, e.source)} alt="" className="opacity-0"></img>
                <ImageWithTime time={getImageTimeOffset(imageTimeMode == -4 ? imageCustomTime : imageTimeMode)} presetHistory={imageHistory} image={e} alt="" className="absolute left-0 right-0 top-0 active:z-1009 active:transform-[scale(2)] transition ease-in-out"></ImageWithTime>
            </div>
            <div className="mt-2 text-green-600 font-medium">Image time</div>
            <div className="text-red-600">{error?.time?.join(", ")}</div>
            <div className="mt-1 flex flex-row gap-2">
                <Dropdown<number> top small onSet={({ id }) => id && setImageTimeMode(id)} items={
                    dayModes
                } initial={dayModes.find(m => m.id == imageTimeMode)?.content}></Dropdown>
                <Dropdown<number> hidden={imageTimeMode != -4} top small onSet={({ id }) => id && setImageCustomTime(id)} items={imageCustomItems} initial={e.time && imageCustomItems.find(i => i.id == imageCustomTime)?.content||"Unset"}></Dropdown>
            </div>
        </Card>
    );
}

function getOffset(timeZone = 'UTC', date = new Date()) {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4;
}




interface RangeInputProps {
    images: Image[];
    mapRoundLimit: number;
    setMapRoundLimit: Dispatch<SetStateAction<number>>;
}


function RangeInput({ images,
    mapRoundLimit,
    setMapRoundLimit }: RangeInputProps) {
    return (
        <>
            <span className="font-bold mr-2 mt-2 text-md">Round limit: <output>{mapRoundLimit}</output></span>
            <input value={mapRoundLimit} onChange={e => setMapRoundLimit(Number(e.target.value) || 0)} type="range" className="accent-green-600" min={0} max={images.length} />

        </>
    );
}




interface ImageListProps {
    browserState: boolean;
    imageList: Image[];
    images: Image[];
    selectedImages: Image[] | null;
    setImages: Dispatch<SetStateAction<Image[]>>;
    setSelectedImages: Dispatch<SetStateAction<Image[] | null>>;
}


const ImageList = memo(function ImageList({ browserState,
    imageList,
    images,
    selectedImages,
    setImages,
    setSelectedImages }: ImageListProps) {
    return (
        <div hidden={!browserState} className="list justify-center flex flex-row overflow-y-scroll flex-wrap h-full gap-2 p-2">
            {...(imageList ? imageList.map((e, i) => (
                <Card key={i} className="w-40!" small cardTitle={(<span className="font-bold flex items-center justify-between">{e.externalId}<Button disabled={images.some(i => i.id == e.id)} onClick={() => {
                    setImages([...images, e])
                    setSelectedImages(selectedImages?.reduce((p, c) => c.id != e.id ? [...p, c] : p, new Array<Image>()) || null)
                }} className={`w-5 h-5 p-0! flex items-center align-center justify-center ${images.some(i => i.id == e.id) ? "" : "bg-white"}`}><Icon icon={faPlus}></Icon></Button></span>)}>
                    <div className="relative h-25 w-full">
                        <NextImage.default className="relative" objectFit="contain" fill loading="lazy" src={getImageUrl(e.externalId, e.source) + "?thumbnail=true"} alt=""></NextImage.default>
                    </div>
                </Card>
            )) : [
                (
                    <>
                        Loading...
                    </>
                )
            ])}
        </div>
    );
})
