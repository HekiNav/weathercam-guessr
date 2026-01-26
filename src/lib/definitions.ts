import { GameMode } from '@/app/actions/game';
import { Image } from '@/app/actions/image';
import { ReactNode } from 'react';
import * as z from 'zod'

export const EmailSchema = z.email({ error: 'Please enter a valid email.' }).trim()
export const UsernameSchema = z.string()
  .min(3, { error: "Username must be at least 3 char longs" })
  .max(20, { error: "Username cannot exceed 20 characters" })
  .regex(
    /^[A-Za-z0-9]{3,20}$/,
    "Username must not contain special characters"
  );

export type FormState<E extends readonly string[]> =
  | {
    errors?: {
      [P in E[number]]?: string[]
    }
    step?: string
  }
export type OTPFormState = FormState<["email", "otp", "username"]>

export interface User {
  id: string
  name: string | null
  admin: boolean
  email: string
  createdAt: number
  sessions?: Session[]
}

export interface Map {
  creationTime: number,
  updateTime: number,
  type: MapType, // USER_CREATED | DAILY_CHALLENGE
  id: string,
  createdBy: string | null,
  visibility: MapVisibility,
  places?: MapPlace[]
}
export interface MapPlace {
  image?: Image,
  imageId: string,
  mapId: string,
  map?: Map
}
export interface Game {
  mapId: string,
  userId: string,
  score: number,
  timestamp: number,
  map?: Map
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
}

export interface GameModeDef {
  id: GameMode,
  name: ReactNode,
  description: ReactNode,
  available: boolean
}

export const gameModes: GameModeDef[] = [{
  id: "daily",
  name: "Daily challenge",
  description: "Play a daily challenge map and compete with others!",
  available: true
}, {
  id: "practice",
  name: "Practice",
  description: "Practice your skills with a customizable, endless game",
  available: true
}]

export function rib(a: number, b: number) {
  return Math.floor(Math.random() * (b - a) + a)
}

export const FIRST_DAILY_GAME = 20477

export const FINLAND_BOUNDS: [number, number, number, number] = [20.6455928891, 59.846373196, 31.5160921567, 70.1641930203]

export function score(guess: LatLonLike, correct: LatLonLike) {
  const [east, south, west, north] = FINLAND_BOUNDS
  const size = distanceBetweenPoints([east, south], [west, north])
  const distance = distanceBetweenPoints(guess, correct)
  return Math.round(5000 * Math.pow(Math.E, (-20 * distance / size)))
}
export interface LatLon {
  lat: number
  lon: number
}
export type LatLonArray = [number, number]
export type LatLonLike = LatLon | LatLonArray
export function distanceBetweenPoints(p1: LatLonLike, p2: LatLonLike) {
  const lat1 = Array.isArray(p1) ? p1[0] : p1.lat
  const lon1 = Array.isArray(p1) ? p1[1] : p1.lon
  const lat2 = Array.isArray(p2) ? p2[0] : p2.lat
  const lon2 = Array.isArray(p2) ? p2[1] : p2.lon

  // earths radius (m)
  const earthRadiusMeters = 6371000;

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLatRad = toRadians(lat2 - lat1);
  const deltaLngRad = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLatRad / 2) ** 2 +
    Math.cos(lat1Rad) *
    Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) ** 2;

  const angularDistance =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * angularDistance;


}
function toRadians(deg: number) {
  return deg * Math.PI / 180
}
export const atLeastOneTrue = (shape: Record<string, z.ZodBoolean>, error: string) => z.object(shape).refine((obj) => !Object.values(obj).every(v => v == false), { error: error });

export function getImageUrl(id: string, source: string) {
  switch (source) {
    case "DIGITRAFFIC":
      return `https://weathercam.digitraffic.fi/${id}.jpg`
    default:
      return id
  }
}

export enum MapVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  FRIENDS = "FRIENDS",
  HIDDEN = "HIDDEN"
}

export enum UnclassifiedEnum {
  UNCLASSIFIED = "UNCLASSIFIED",
}

export enum ImageType {
  ROAD_SURFACE = "ROAD_SURFACE",
  SCENERY = "SCENERY",
  ROAD = "ROAD",
  BROKEN = "BROKEN"
}

export enum MapType {
  USER_CREATED = "USER_CREATED",
  DAILY_CHALLENGE = "DAILY_CHALLENGE"
}

export enum ImageDifficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}
export interface BlurRect {
  x: number
  y: number
  width: number
  height: number
}