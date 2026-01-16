"use client"
import game, { GameMode } from "@/app/actions/game"
import Card from "@/components/card"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import { GameModeDef, gameModes } from "@/lib/definitions"
import { Dispatch, SetStateAction, startTransition, use, useActionState, useEffect, useState } from "react"
import { redirect } from "next/navigation"
import toast from "react-hot-toast"
import Button from "@/components/button"
import Checkbox from "@/components/checkbox"


export default function BlogPostPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = use(params)

  const gameMode = gameModes.find(m => m.id == type)

  if (!gameMode) {
    useEffect(() => {
      toast.error(`Invalid game mode: ${type}`)
      redirect("/play")
    })
    return <div></div>
  }
  if (!gameMode.available) {
    useEffect(() => {
      toast.error(`Not available yet: ${gameMode.name}`)
      redirect("/play")
    })
    return <div></div>
  }

  const practiceConfig = {
    imageTypes: {
      description: "Image types",
      road: { description: "Road", state: useState<boolean>(true) },
      road_surface: { description: "Road surface", state: useState<boolean>(false) },
      scenery: { description: "Scenery", state: useState<boolean>(true) },
    }
  }

  const [{ errors, image, points, step, title }, action, pending] = useActionState(game, { step: "init", title: "Start game" })
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(gameMode.id)
  return (
    <div className="h-full">
      {step != "game" && (
        <div className="h-full w-full flex justify-center items-center">
          <Card title={title} className="h-min">
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
              <div className="w-full px-4">
                {Object.values(practiceConfig).map(({ description, ...keys }, i) => (<Option description={description} keys={keys} key={i}></Option>))}
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  )
}

function Option({ description, keys }: { description: string, keys: { [key: string]: { description: string, state: [boolean, Dispatch<SetStateAction<boolean>>] } } }) {
  const [all, setAll] = useState(true)
  const states = Object.values(keys).map(e => e.state)
  useEffect(() => {
    if (states.every(s => s[0] == all)) return
    setAll(states.every(s => s[0]))
  }, [...states])
  return (<div>
    <span className="font-medium text-lg">{description}</span>
    <div className="flex flex-row flex-wrap gap-2">
      <Checkbox onChange={(e) => states.forEach(([value, setter]) => setter(((e.target as HTMLInputElement).checked)))} checked={all} setChecked={setAll}>All</Checkbox>
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