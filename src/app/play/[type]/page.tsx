"use client"
import game from "@/app/actions/game"
import Card from "@/components/card"
import Dropdown, { DropdownItem } from "@/components/dropdown"
import { gameModes } from "@/lib/definitions"
import { redirect } from "next/navigation"
import { use, useActionState } from "react"
import Map from "react-map-gl/maplibre"
import { toast } from "react-hot-toast"
import { setToastCookie } from "@/app/actions/toast"
import { ToastCookieSetter } from "@/components/toast"

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = use(params)

  const gameMode = gameModes.find(m => m.id == type)

  if (!gameMode) { 
    return (
      <div>
        <ToastCookieSetter message={`Invalid game mode: ${type}`} redirect="/play"/>
      </div>
    )
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