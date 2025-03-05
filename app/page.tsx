import type { Metadata } from "next"
import LandingPage from "@/components/landing-page"

export const metadata: Metadata = {
  title: "Twitter AI Self",
  description: "Chat with an AI version of yourself based on your Twitter persona",
}

export default function Home() {
  return <LandingPage />
}

