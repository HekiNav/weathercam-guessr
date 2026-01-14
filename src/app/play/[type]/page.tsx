"use client"
import { use } from "react"
import Map from "react-map-gl/maplibre"

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = use(params)
  return (

    <div className="h-full">
      <p>{type}</p>
    </div>
  )
}