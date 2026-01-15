"use client"
import game from "@/app/actions/game"
import Card from "@/components/card"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import { gameModes } from "@/lib/definitions"
import { use, useActionState, useEffect } from "react"
import Cookies from "js-cookie"
import { redirect } from "next/navigation"
import toast from "react-hot-toast"


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

  const [{ errors, image, points, step }, action, pending] = useActionState(game, { step: "init" })

  return (
    <div className="h-full">
      {step == "init" && (
        <div className="h-full w-full flex place-content-center">
          <Card title="Begin" className="h-min">
            Mode:
            <Dropdown initial={gameMode.name} items={gameModes.reduce((p, m) => [...p, { content: m.description, id: m.id }], new Array<DropdownItem<string>>())}></Dropdown>
          </Card>
        </div>
      )}
      <p>{type}</p>
    </div>
  )
}