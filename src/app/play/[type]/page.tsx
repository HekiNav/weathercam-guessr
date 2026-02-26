"use client"
import game, { AnyGameData, GameMode, GamePlayState, GamePracticeBeginDataConfig } from "@/app/actions/game"
import Card from "@/components/card"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import { distanceBetweenPoints, FINLAND_BOUNDS, FIRST_DAILY_GAME, LeaderboardItem, GameModeDef, gameModes, getImageUrl, User } from "@/lib/definitions"
import { Dispatch, SetStateAction, startTransition, use, useActionState, useContext, useEffect, useRef, useState } from "react"
import { redirect } from "next/navigation"
import toast from "react-hot-toast"
import Button from "@/components/button"
import Checkbox from "@/components/checkbox"
import ImageWithBlur from "@/components/blurredimage"
import { Image } from "@/app/actions/image"
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import { Layer, Map, MapRef, Source } from "react-map-gl/maplibre"
import maplibregl, { GeoJSONSource } from "maplibre-gl"
import CountUp from "react-countup"
import Link from "next/link"
import { UserContext } from "@/app/user-provider"
import { FeatureCollection, Point } from "geojson"

type BooleanState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

type ConfigItem<T> = {
  description: string;
  state: BooleanState<T>;
};
type ConfigSection<Keys extends string, T> = {
  description: string;
} & {
  [K in Keys]: ConfigItem<T>;
};

export default function GamePage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = use(params)

  const user = useContext(UserContext)

  const gameMode = gameModes.find(m => m.id == type)

  useEffect(() => {
    if (!gameMode) {
      toast.error(`Invalid game mode: ${type}`)
      redirect("/play")
    }
    else if (!gameMode.available) {
      toast.error(`Not available yet: ${gameMode.name}`)
      redirect("/play")
    }
    else if (gameMode.id != "practice" && !user) {
      toast.error(`Log in to access ${gameMode.name} mode`)
      redirect(`/login?to=/play/${gameMode.id}`)
    }
  })
  if (!gameMode || !gameMode.available) return <div></div>

  return GamePageContent(gameMode, user)

}

function GamePageContent(gameMode: GameModeDef, user: User | null) {
  const practiceConfig: {
    imageTypes: ConfigSection<"road" | "road_surface" | "scenery" | "broken", boolean>;
    difficulties: ConfigSection<"easy" | "medium" | "hard", boolean>;
    other: ConfigSection<"blur" | "geojson", boolean>;
  } = {
    imageTypes: {
      description: "Image types",
      road: { description: "Road", state: useState<boolean>(true) },
      road_surface: { description: "Road surface", state: useState<boolean>(false) },
      scenery: { description: "Scenery", state: useState<boolean>(true) },
      broken: { description: "Broken camera", state: useState<boolean>(false) },
    },
    difficulties: {
      description: "Image difficulties",
      easy: { description: "Easy", state: useState<boolean>(true) },
      medium: { description: "Medium", state: useState<boolean>(true) },
      hard: { description: "Hard", state: useState<boolean>(true) },
    },
    other: {
      description: "Other options",
      blur: {
        description: "Blur Camera Location Watermarks",
        state: useState<boolean>(true)
      },
      geojson: {
        description: "Show available cameras on the map when guessing",
        state: useState<boolean>(false)
      },
    }
  }
  let mapOpen: boolean = false

  const mapRef = useRef<MapRef>(null)

  const [selectedLocation, setSelectedLocation] = useState<GeoJSON.Point | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    (mapRef.current.getSource("data") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: [
        selectedLocation && {
          type: "Feature" as const,
          geometry: selectedLocation,
          properties: { type: "selected_location" }
        }
      ].filter(f => f != null)
    })
  }, [selectedLocation])

  const [state, action, pending] = useActionState(game, { step: "init", title: "Start game" })

  const { errors, step, title } = state

  useEffect(() => {
    if (errors?.server) errors.server.forEach((err) => toast.error(err))
  }, [errors?.server])

  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(gameMode.id)
  return (
    <div className="h-full w-full relative grow">
      {step != "game" && step != "results" && (
        <div className="h-full w-full flex justify-center items-center">
          <Card cardTitle={title} className="h-min w-max">
            {step == "leaderboard" && (
              <>
                <h1 className="text-green-600 text-xl font-mono">Leaderboard</h1>
                <table className="w-100 m-6">
                  <tbody>
                    {...state.items.map((e, i) => (
                      <tr key={i} className="rounded shadow-lg/20">
                        <td className="p-2 w-1 font-medium text-green-600 text-start">{e.position}</td>
                        <td className={`p-2 text-start ${e.user?.id == user?.id && "font-bold"}`}><Link href={`/user/${e.userId}`}>{e.user?.name}</Link></td>
                        <td className="p-2 text-end text-green-600">{e.score}</td>
                      </tr>
                    ))}
                  </tbody>

                </table>
                <div className="flex flex-row justify-around mx-4 mt-4">
                  <Link href="/play"><Button>Play another game</Button></Link>
                </div>
              </>
            )}
            {step == "init" && (

              <>
                Mode:
                <span className="mx-3">
                  <Dropdown onSet={(i) => i.id && setSelectedGameMode(i.id)} initial={GameModeItem(gameMode)} items={gameModes.reduce((p, m) => m.available ? [...p, { content: GameModeItem(m), id: m.id }] : p, new Array<DropdownItem<GameMode>>())}></Dropdown>
                </span>
                <Button className="mt-6" onPress={() => startTransition(() => action({ type: "init", gameMode: selectedGameMode }))}
                  autoFocus disabled={pending}>Begin</Button>
              </>
            )}
            {step == "daily_info" && (
              <>
                <DailyInfo action={action} pending={pending} lastGame={state.lastGame}></DailyInfo>
              </>
            )}
            {step == "config_practice" && (
              <div className="w-full px-4 flex flex-col align-start">
                {Object.values(practiceConfig).map(({ description, ...keys }, i) => (<CheckboxGroup description={description} keys={keys} key={i}></CheckboxGroup>))}
                <div className="text-red-600 text-wrap">{errors?.practiceConfig?.join(", ")}</div>
                <Button className="mt-6 self-center" onPress={() => startTransition(() => action({
                  type: "practice_begin", config: getConfig(practiceConfig)
                }))}
                  autoFocus disabled={pending}>Begin</Button>
              </div>
            )}
          </Card>
        </div>
      )}
      {step == "game" && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <MovableImage
            image={state.image}
            blur={state.config.blur}
          />
          <div className="z-1000 absolute top-4 left-0 text-green-600 font-mono ">
            <div className="texl-lg bg-white p-2 border-2 border-green-600 border-l-0 rounded-tr-lg rounded-br-lg">Round {state.round || 0} {state.maxRound && ` / ${state.maxRound}`} - {gameMode.name}</div>
            <div className="text-sm mt-2 border-2 border-green-600 border-l-0 bg-white p-1 rounded-tr-md rounded-br-md w-fit">{state.points || 0} points</div>
          </div>
          <div hidden={!selectedLocation} onClick={() => {
            if (!selectedLocation) return toast("You haven't selected anything")
            if (gameMode.id == "practice") return startTransition(() => action({ type: "practice_submit", location: (selectedLocation?.coordinates.reverse() as [number, number]) }))
            return startTransition(() => action({ type: "submit", location: (selectedLocation?.coordinates.reverse() as [number, number]), mapId: (state as GamePlayState).map.id }))
          }} className="flex flex-col items-center absolute w-full bottom-5">
            <Button className="font-mono text-white text-xl text-center">Submit</Button>
          </div>
          <div onTransitionStart={(e) => {
            if (!mapRef.current) return

            const rect = (e.target as HTMLDivElement).getBoundingClientRect()
            const mapState = rect.width / window.innerWidth < 0.4
            if (mapState != mapOpen) {
              mapOpen = mapState
              mapRef.current.zoomTo(mapRef.current.getZoom() + (1 * (mapState ? 1 : -1)))
            }
          }} className="overflow-hidden m-5 w-[20vw] h-[30vh] border-2 rounded-lg border-green-600 absolute bottom-0 right-0
          hover:h-[80vh] hover:w-[60vw] transition-all ease-out duration-500 flex flex-col items-center justify-center">
            <div style={{ width: "20vw", height: "30vh" }}>
              <Map onLoad={() => {
                if (!mapRef.current?.hasImage("red-pin")) {
                  const image = document.createElement("img")
                  image.src = "/pin.svg"
                  image.addEventListener("load", () => {
                    mapRef.current?.addImage("red-pin", image)
                  })
                }
                const mapContainer = mapRef.current?.getContainer().parentElement
                if (!mapContainer) return
                mapContainer.style.width = "60vw"
                mapContainer.style.height = "80vh"
                mapRef.current?.resize()
              }} onClick={(e) => {
                const distance = e.target.getZoom() < 9 ? 10000 : 1000;
                (e.target.getSource("images") as GeoJSONSource).getData().then((geojson) => {
                  const selectedFeature = (geojson as FeatureCollection).features.sort((a, b) =>
                    distanceBetweenPoints({ lat: e.lngLat.lng, lon: e.lngLat.lat }, (a.geometry as Point).coordinates as [number, number]) -
                    distanceBetweenPoints({ lat: e.lngLat.lng, lon: e.lngLat.lat }, (b.geometry as Point).coordinates as [number, number])
                  )[0]
                  if (state.config.geojson && selectedFeature?.geometry && distanceBetweenPoints({ lat: e.lngLat.lng, lon: e.lngLat.lat }, (selectedFeature.geometry as Point).coordinates as [number, number]) < distance) {
                    setSelectedLocation(selectedFeature?.geometry as never)
                  }
                  else setSelectedLocation({ type: "Point", coordinates: e.lngLat.toArray() })
                })
              }} initialViewState={{ bounds: FINLAND_BOUNDS, fitBoundsOptions: { padding: 10 } }} ref={mapRef} mapStyle="/map_style.json">
                <Source id="data" type="geojson" data={{
                  type: "FeatureCollection",
                  features: []
                }}></Source>
                <Source id="images" type="geojson" data="/api/map/images.geojson"></Source>

                <Layer id="image_outer" type="circle" layout={{
                  visibility: state.config.geojson ? "visible" : "none"
                }} paint={{
                  "circle-radius": 10,
                  "circle-color": "#166534"
                }} source="images"></Layer>
                <Layer id="image_inner" type="circle" layout={{
                  visibility: state.config.geojson ? "visible" : "none"
                }} paint={{
                  "circle-radius": 7,
                  "circle-color": "#16a34a"
                }} source="images"></Layer>
                <Layer id="map_pin" type="symbol" layout={{
                  "icon-anchor": "bottom",
                  "icon-size": 0.1,
                  "icon-image": "red-pin"
                }} source="data" filter={["==", ["get", "type"], "selected_location"]}></Layer>
              </Map>
            </div>
          </div>
        </div>
      )
      }
      {step == "results" && selectedLocation && (
        <div className="h-full w-full flex justify-center items-center absolute top-0 z-1001">
          <Card cardTitle={title} imageCard className="h-min w-150 opacity-100 bg-white z-1002">
            <div className="flex flex-col w-full">
              <div className="h-80 w-full">
                <Map maplibreLogo={false} attributionControl={false} onLoad={() => {
                  if (!mapRef.current?.hasImage("red-pin")) {
                    const image = document.createElement("img")
                    image.src = "/pin.svg"
                    image.addEventListener("load", () => {
                      mapRef.current?.addImage("red-pin", image)
                    })
                  }
                  if (!mapRef.current?.hasImage("blue-pin")) {
                    const image = document.createElement("img")
                    image.src = "/pin_blue.svg"
                    image.addEventListener("load", () => {
                      mapRef.current?.addImage("blue-pin", image)
                    })
                  }
                  setTimeout(() => {
                    mapRef.current?.fitBounds(
                      new maplibregl.LngLatBounds(
                        [selectedLocation.coordinates[1], selectedLocation.coordinates[0]],
                        [selectedLocation.coordinates[1], selectedLocation.coordinates[0]]
                      ).extend([state.image.lon, state.image.lat]), { padding: 100 })
                  }, 500)

                }} initialViewState={{ latitude: selectedLocation?.coordinates[0], longitude: selectedLocation?.coordinates[1], zoom: 12 }} ref={mapRef} mapStyle="/map_style.json">
                  <Source id="data" type="geojson" data={{
                    type: "FeatureCollection",
                    features: [
                      { "type": "Feature", geometry: { type: "Point", coordinates: [selectedLocation.coordinates[1], selectedLocation.coordinates[0]] }, properties: { type: "selected_location" } },
                      { "type": "Feature", geometry: { type: "Point", coordinates: [state.image.lon, state.image.lat] }, properties: { type: "correct_location" } }
                    ]
                  }}></Source>
                  <Layer id="map_pin" type="symbol" layout={{
                    "icon-anchor": "bottom",
                    "icon-size": 0.1,
                    "icon-image": "red-pin"
                  }} source="data" filter={["==", ["get", "type"], "selected_location"]}></Layer>
                  <Layer id="map_pin_2" type="symbol" layout={{
                    "icon-anchor": "bottom",
                    "icon-size": 0.1,
                    "icon-image": "blue-pin"
                  }} source="data" filter={["==", ["get", "type"], "correct_location"]}></Layer>
                </Map>
              </div>
              <div className="flex flex-row justify-around w-full mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg text-green-600">Points</span>
                  <CountUp className="text-2xl font-mono text-green-600" end={(state.points || 0) - (state.prevPoints || 0)}></CountUp>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg text-green-600">Distance</span>{(() => {
                    const distance = distanceBetweenPoints(selectedLocation.coordinates as [number, number], [state.image.lat, state.image.lon])
                    return (
                      <span className="text-2xl font-mono text-green-600">
                        <CountUp end={distance > 1000 ? Math.round(distance / 1000) : Math.round(distance)} />
                        {distance > 1000 ? "km" : "m"}
                      </span>
                    )
                  })()}
                </div>
              </div>
              <div className="z-1002 flex flex-row justify-around w-full">
                {gameMode.id == "practice" && <>
                  <Button onClick={() => {
                    startTransition(() => action({ type: "practice_begin", config: getConfig(practiceConfig) }))
                    setSelectedLocation(null)
                  }}>Play another round</Button>
                  <Button onClick={() => startTransition(() => action({ type: "init", gameMode: "practice" }))}>Change configuration</Button>
                  <Link href="/play"><Button>Switch modes</Button></Link>
                </>}
                {(state as GamePlayState).map && <>
                  <div className="flex flex-row justify-around mx-4 mt-4 gap-4">
                    <Button onClick={() => startTransition(() => action({ type: "leaderboard", mapId: (state as GamePlayState).map.id }))} disabled={pending}>View leaderboard</Button>
                    <Link href="/play"><Button>Play another mode</Button></Link>
                  </div>
                </>}
              </div>
            </div>
          </Card>
          <div className="w-full h-full bg-white opacity-50 absolute"></div>
        </div>
      )}

    </div >
  )
}


function DailyInfo({ lastGame, action, pending }: { lastGame?: LeaderboardItem, action: (payload: AnyGameData) => void, pending: boolean }) {
  const today = Math.floor(Date.now() / 1000 / 3600 / 24) - FIRST_DAILY_GAME
  const lastGameDay = Math.round(new Date(lastGame?.map?.creationTime || Date.now()).getTime() / 1000 / 3600 / 24) - FIRST_DAILY_GAME
  // not played today
  if (today > lastGameDay || !lastGame || !lastGame.map) return <>
    <h1 className="font-medium text-green-600 mx-4 mb-4 text-lg">You haven&apos;t played today</h1>
    <p className="mx-2 max-w-80 text-wrap">
      Why not give it a shot?
    </p>
    <div className="flex flex-row justify-around mx-4 mt-4">
      <Button disabled={pending} onClick={() => startTransition(() => action({ type: "daily_begin" }))}>Play</Button>
    </div>
  </>
  // Already played today
  return <>
    <h1 className="font-medium text-green-600 mx-4 mb-4 text-lg">You have already played today</h1>
    <p className="mx-2 max-w-80 text-wrap">You got <span className="text-green-600">{lastGame.score} </span>points.
      {lastGame.score <= 100 && " Did you even try?"}
      {lastGame.score > 100 && lastGame.score <= 1000 && " Better luck next time!"}
      {lastGame.score > 1000 && lastGame.score <= 2000 && " Not the best."}
      {lastGame.score > 2000 && lastGame.score <= 3000 && " Getting there."}
      {lastGame.score > 3000 && lastGame.score <= 4000 && " You are getting really good!"}
      {lastGame.score > 4000 && lastGame.score <= 4950 && " Awesome!"}
      {lastGame.score > 4950 && " Truly Rainbolt!"}
      {String(lastGame.score).includes("67") && " 67!!!"}
    </p>
    <div className="flex flex-row justify-around mx-4 mt-4">
      <Button onClick={() => startTransition(() => action({ type: "leaderboard", mapId: lastGame.mapId }))} disabled={pending}>View leaderboard</Button>
    </div>
  </>
}

function getConfig(practiceConfig: { imageTypes: ConfigSection<"road" | "road_surface" | "scenery", boolean>; difficulties: ConfigSection<"easy" | "medium" | "hard", boolean>; other: ConfigSection<"blur", boolean> }): GamePracticeBeginDataConfig {
  return typedEntries<typeof practiceConfig>(practiceConfig).reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: typedEntries<typeof value>(value).reduce(
        (prev, [key, value]) => {
          return key == "description" || typeof value != "object" ?
            prev :
            { ...prev, [key]: (value as { state: [...never] }).state[0] }
        },
        {})
    }),
    {}) as GamePracticeBeginDataConfig
}

function typedEntries<T extends object>(obj: T) {
  return Object.entries(obj) as {
    [K in keyof T]: [K, T[K]]
  }[keyof T][]
}


function CheckboxGroup({ description, keys }: { description: string, keys: { [key: string]: { description: string, state: [boolean, Dispatch<SetStateAction<boolean>>] } } }) {
  const [all, setAll] = useState(true)
  const states = Object.values(keys).map(e => e.state)
  useEffect(() => {
    if (states.every(s => s[0] == all)) return
    setAll(states.every(s => s[0]))
  }, [all, states])
  return (<div className="mb-2">
    <span className="font-medium text-lg">{description}</span>
    <div className="flex flex-row flex-wrap gap-2">
      {states.length > 1 && <Checkbox containerClass="font-medium" onChange={(e) => states.forEach(([, setter]) => setter(((e.target as HTMLInputElement).checked)))} checked={all} setChecked={setAll}>All</Checkbox>}
      {Object.values(keys).map(({ description, state }, i) => (
        <Checkbox key={i} checked={state[0]} setChecked={state[1]}>{description}</Checkbox>
      ))}
    </div>
  </div>)
}

function GameModeItem(m: GameModeDef) {
  return <div className="flex flex-col">
    <div className="text-md">{m.name}</div>
    <div className="text-xs text-gray-600">{m.description}</div>
  </div>
}



interface MovableImageProps {
  image: Image,
  blur: boolean
}


function MovableImage({ image, blur }: MovableImageProps) {
  const ref = useRef<ReactZoomPanPinchRef>(null)
  const [resetButtonHidden, setResetButtonHidden] = useState(true)

  return (
    <div className="w-full h-full">
      <div hidden={resetButtonHidden} onClick={() => ref.current?.resetTransform(500)} className="cursor-pointer absolute z-1001 texl-lg bg-white p-2 border-2 border-green-600 border-r-0 top-10 rounded-tl-lg rounded-bl-lg right-0">Reset view</div>
      <TransformWrapper ref={ref} onTransformed={() => {
        if (!ref.current) return
        const { positionX, positionY, scale } = ref.current?.instance.transformState
        setResetButtonHidden(positionX == 0 && positionY == 0 && scale == 1)
      }}>
        <TransformComponent>
          <div className="w-full h-full flex items-center justify-center">
            <ImageWithBlur className="noselect" onTransitionEnd={() => {
              document.body.style.overflow = "auto"
            }} style={{
              zIndex: -10,
              transition: "0.5s ease-in-out",
            }} alt="" blur={blur ? image.rect : { height: 0, width: 0, x: 0, y: 0 }} src={getImageUrl(image?.externalId, image?.source)}></ImageWithBlur>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
