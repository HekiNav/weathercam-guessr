import { rib } from "@/lib/definitions";

export default function PlaceholderImage() {
    return (<div className="h-30" style={{
        backgroundImage: "url(/background-tile-green-inverted.png)",
        backgroundSize: "10em",
        backgroundPosition: `${rib(1, 100)}em ${rib(1, 100)}em`
    }}></div>)
}