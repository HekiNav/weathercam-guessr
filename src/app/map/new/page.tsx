"use client"
import { UserContext } from "@/app/user-provider"
import Button from "@/components/button"
import Toggle from "@/components/toggle"
import { distanceBetweenPoints, FINLAND_BOUNDS, getImageUrl } from "@/lib/definitions"
import { Feature, FeatureCollection, Point } from "geojson"
import { GeoJSONSource } from "maplibre-gl"
import { redirect } from "next/navigation"
import { useContext, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { Layer, Map, MapRef } from "react-map-gl/maplibre"
import { Image } from "@/app/actions/image"
import Card from "@/components/card"
import Icon from "@/components/icon"
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"

export default function MapCreationUi() {
    const user = useContext(UserContext)

    const mapRef = useRef<MapRef>(null)


    const [mapName, setMapName] = useState("")

    useEffect(() => {
        if (!user) {
            toast("Please log in before creating maps")
            redirect("/login")
        }
    })
    const [images, setImages] = useState<Image[]>([])
    const [selectedImages, setSelectedImages] = useState<Image[] | null>(null)

    const [mapType, setMapType] = useState(false)
    const [browserState, setBrowserState] = useState(false)

    useEffect(() => {
        mapRef.current?.resize()
    }, [browserState])

    if (!user) {
        redirect("/login?to/map/new/")
    }
    return <div className="flex flex-col-reverse md:flex-row-reverse h-full w-screen">
        <div className="main flex flex-col h-full w-full relative">
            <div className="browser-mode px-4 py-2 flex flex-row items-center absolute bg-white top-0 right-0 z-1003">
                Map
                <Toggle noColors state={browserState} setState={setBrowserState}></Toggle>
                List
            </div>
            <div className="browser h-4/10 border-b-3 border-green-600 w-full">
                <div hidden={!browserState} className="list">list</div>
                <div hidden={browserState} className="map h-10/10 relative">
                    <div hidden={!selectedImages || !selectedImages.length} className="absolute left-0 z-1001 top-0 bg-white p-4 gap-2 rounded-br-xl flex flex-col max-h-8/10 overflow-scroll">
                        <h3 className="font-medium text-lg text-green-600">Selected images</h3>
                        {...(selectedImages || []).map((e, i) => (
                            <Card key={i} className="w-40!" small title={(<span className="font-bold flex items-center justify-between">{e.externalId}<Button disabled={images.some(i => i.id == e.id)} onClick={() => {
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
            <div className="w-full relative grow">
                <div className="preview px-4 py-4 flex flex-row gap-4 absolute z-1002 top-0 bottom-0 left-0 right-0 overflow-x-scroll overflow-y-none">
                    {...images.map((e, i) => (
                        <Card key={i} imageCard className="w-60! min-w-60 h-full" title={(
                            <div className="">
                                <span className="font-bold h-full grid grid-rows-1 grid-cols-3 items-center">
                                    <span className="justify-self-start">{e.externalId}</span>
                                    <span className="justify-self-center cursor-grab">
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
                            <div className="relative w-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(e.externalId, e.source)} alt="" className="absolute left-0 right-0 top-0 hover:z-1009 hover:transform-[scale(2)] transition ease-in-out"></img>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
         <div className="menu h-min px-4 py-4 pb-4 border-b-3 border-green-600 w-full md:w-fit md:border-0 md:border-r-3 md:h-full min-w-2/10 flex flex-col">
            <input className="font-medium text-2xl w-full text-green-600 rounded p-1 border-2"
                value={mapName} placeholder="New map" maxLength={40} onChange={e => setMapName(e.target.value)}></input>
            <h1 className="font-medium text-xl mt-4">Options</h1>
            <span className="font-bold mr-2 mt-2 text-lg">Map order:</span>
            <div className="browser-mode mb-4 flex flex-row items-center">
                Random
                <Toggle noColors state={mapType} setState={setMapType}></Toggle>
                Ordered
            </div>
            <Button className="justify-self-end">Create</Button>
        </div>
    </div>
}