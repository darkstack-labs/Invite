import { Timestamp } from "firebase/firestore";

export interface RSVP {
  id: string
  name: string
  attendance: "yes" | "no"
  mealPreference: "veg" | "nonveg"
  timestamp?: Timestamp
}

export interface SongRequest {
  id: string
  name: string
  entryId: string
  songName: string
  artist: string
  timestamp?: Timestamp
}

export interface Suggestion {
  id: string
  name: string
  entryId: string
  suggestion: string
  timestamp?: Timestamp
}

export interface AdminStatsData {
  total: number
  attending: number
  veg: number
  nonVeg: number
}

export interface SidebarItemProps {
  text: "Dashboard" | "RSVP Manager" | "Song Requests" | "Suggestions"
  isActive: boolean
}