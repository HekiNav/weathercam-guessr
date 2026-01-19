"use client"
import game, { GameMode, GamePracticeBeginDataConfig } from "@/app/actions/game"
import Card from "@/components/card"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import { FINLAND_BOUNDS, GameModeDef, gameModes } from "@/lib/definitions"
import { Dispatch, SetStateAction, startTransition, use, useActionState, useEffect, useRef, useState } from "react"
import { redirect } from "next/navigation"
import toast from "react-hot-toast"
import Button from "@/components/button"
import Checkbox from "@/components/checkbox"
import ImageWithBlur from "@/components/blurredimage"
import { getImageUrl } from "@/app/review/page"
import { Image } from "@/app/actions/image"
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch"
import { Map, MapRef } from "react-map-gl/maplibre"
import { map } from "zod"

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

  const gameMode = gameModes.find(m => m.id == type)

  useEffect(() => {
    if (!gameMode) {
      toast.error(`Invalid game mode: ${type}`)
      redirect("/play")
    }
    if (!gameMode.available) {
      toast.error(`Not available yet: ${gameMode.name}`)
      redirect("/play")
    }
  })
  if (!gameMode || !gameMode.available) return <div></div>


  const practiceConfig: {
    imageTypes: ConfigSection<"road" | "road_surface" | "scenery", boolean>;
    difficulties: ConfigSection<"easy" | "medium" | "hard", boolean>;
    other: ConfigSection<"blur", boolean>;
  } = {
    imageTypes: {
      description: "Image types",
      road: { description: "Road", state: useState<boolean>(true) },
      road_surface: { description: "Road surface", state: useState<boolean>(false) },
      scenery: { description: "Scenery", state: useState<boolean>(true) },
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
      }
    }
  }
  let mapOpen: boolean = false
  const [mapWidth, setMapWidth] = useState<number>(20)
  const [mapHeight, setMapHeight] = useState<number>(30)

  const mapRef = useRef<MapRef>(null)

  const [{ errors, image, points, step, title, maxRound, round }, action, pending] = useActionState(game, { step: "init", title: "Start game" })

  useEffect(() => {
    if (errors?.server) errors.server.forEach((err) => toast.error(err))
  }, [errors?.server])

  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(gameMode.id)
  return (
    <div className="h-full w-full">
      {step != "game" && (
        <div className="h-full w-full flex justify-center items-center">
          <Card title={title} className="h-min w-max">
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
            {step == "config_practice" && (
              <div className="w-full px-4 flex flex-col align-start">
                {Object.values(practiceConfig).map(({ description, ...keys }, i) => (<CheckboxGroup description={description} keys={keys} key={i}></CheckboxGroup>))}
                <div className="text-red-600 text-wrap">{errors?.practiceConfig?.join(", ")}</div>
                <Button className="mt-6 self-center" onPress={() => startTransition(() => action({
                  type: "practice_begin", config: typedEntries<typeof practiceConfig>(practiceConfig).reduce(
                    (prev, [key, value]) =>
                    ({
                      ...prev,
                      [key]: typedEntries<typeof value>(value).reduce(
                        (prev, [key, value]) => {
                          return key == "description" || typeof value != "object" ?
                            prev :
                            { ...prev, [key]: (value as { state: [...any] }).state[0] }
                        }
                        , {})
                    })
                    , {}) as GamePracticeBeginDataConfig
                }))}
                  autoFocus disabled={pending}>Begin</Button>
              </div>
            )}
          </Card>
        </div>
      )}
      {step == "game" && image && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <MovableImage
            image={image}
          />
          <div className="z-1000 absolute top-4 left-0 text-green-600 font-mono ">
            <div className="texl-lg bg-white p-2 border-2 border-green-600 border-l-0 rounded-tr-lg rounded-br-lg">Round {round || 0} {maxRound && ` / ${maxRound}`} - {gameMode.name}</div>
            <div className="text-sm mt-2 border-2 border-green-600 border-l-0 bg-white p-1 rounded-tr-md rounded-br-md w-fit">{points} points</div>
          </div>
          <div onTransitionStart={(e) => {
            if (!mapRef.current) return

            const rect = (e.target as HTMLDivElement).getBoundingClientRect()
            const mapState = rect.width / window.innerWidth < 0.4
            if (mapState != mapOpen) {

              setMapWidth(mapState ? 20 : 60)
              setMapHeight(mapState ? 30 : 80)
              mapRef.current?.resize()

              mapOpen = mapState
              mapRef.current.zoomTo(mapRef.current.getZoom() + (1 * (mapState ? 1 : -1)))
            }
          }} className="overflow-hidden m-5 w-[20vw] h-[30vh] border-2 rounded-lg border-green-600 absolute bottom-0 right-0
          hover:h-[80vh] hover:w-[60vw] transition-all ease-in-out duration-500 flex items-center justify-center">
            <div style={{
              width: `${mapWidth}vw`,
              height: `${mapHeight}vh`,
            }}>
              <Map initialViewState={{ bounds: FINLAND_BOUNDS, fitBoundsOptions: { padding: 10 } }} ref={mapRef} mapStyle="/map_style.json">
              </Map>
            </div>

          </div>


        </div>
      )
      }

    </div >
  )
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
  }, [...states])
  return (<div className="mb-2">
    <span className="font-medium text-lg">{description}</span>
    <div className="flex flex-row flex-wrap gap-2">
      {states.length > 1 && <Checkbox containerClass="font-medium" onChange={(e) => states.forEach(([_value, setter]) => setter(((e.target as HTMLInputElement).checked)))} checked={all} setChecked={setAll}>All</Checkbox>}
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
  image: Image
}


function MovableImage({ image }: MovableImageProps) {
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
            }} alt="" blur={image.rect} src={getImageUrl(image?.externalId, image?.source)}></ImageWithBlur>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
