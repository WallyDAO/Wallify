"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LoadingState from "@/components/loading-state"
import SuccessState from "@/components/success-state"
import Footer from "@/components/footer"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [username, setUsername] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle")
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username) return

    setStatus("loading")
    setError(null)
    setDebugInfo(null)

    try {
      console.log(`Fetching tweets and replies for username: ${username}`)

      // Fetch tweets from our API endpoint
      const tweetsResponse = await fetch(`/api/fetch-tweets?username=${username}`)
      console.log(`Tweets API response status: ${tweetsResponse.status}`)

      const tweetsData = await tweetsResponse.json()
      console.log(`Tweets API response data:`, tweetsData)

      if (!tweetsResponse.ok) {
        throw new Error(tweetsData.error || "Failed to fetch tweets")
      }

      if (tweetsData.warning) {
        setDebugInfo(tweetsData.warning)
      }

      if (!tweetsData.tweets || tweetsData.tweets.length === 0) {
        throw new Error("No tweets found for this username")
      }

      // Fetch replies from our API endpoint
      const repliesResponse = await fetch(`/api/fetch-replies?username=${username}`)
      console.log(`Replies API response status: ${repliesResponse.status}`)

      let repliesData = await repliesResponse.json()
      console.log(`Replies API response data:`, repliesData)

      // If replies fetch failed, just continue with tweets
      if (!repliesResponse.ok) {
        console.warn(`Failed to fetch replies: ${repliesData.error || "Unknown error"}`)
        repliesData = { replies: [] }
      }

      // Combine tweets and replies, ensuring we have at least the tweets
      const allContent = [...tweetsData.tweets, ...(repliesData.replies || [])]
      console.log(`Collected ${tweetsData.tweets.length} tweets and ${repliesData.replies ? repliesData.replies.length : 0} replies`)

      // Store in session storage
      sessionStorage.setItem("twitterUsername", username)
      sessionStorage.setItem("userTweets", JSON.stringify(allContent))
      sessionStorage.setItem("tweetCount", String(tweetsData.tweets.length))
      sessionStorage.setItem("replyCount", String(repliesData.replies ? repliesData.replies.length : 0))

      setStatus("success")
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setStatus("idle")
    }
  }

  const startChat = () => {
    router.push(`/chat/${username}`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#121212] text-white">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full mx-auto text-center">
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-6">Talk to your Twitter self</h1>
            <p className="text-xl text-gray-400 max-w-xl mx-auto mb-2">
              Enter your Twitter username and chat with an AI version of yourself based on your tweets.
            </p>
            <p className="text-md text-[#1d9bf0]">Powered by Wally API</p>
          </div>

          {status === "idle" && (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit} className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-gray-400">@</span>
                  </div>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Twitter username"
                    className="pl-8 pr-4 py-6 bg-[#1e1e1e] border-[#333] text-white rounded-l-lg w-full focus:ring-[#1d9bf0] focus:border-[#1d9bf0] h-14 text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  className="px-5 py-6 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-medium rounded-r-lg h-14"
                >
                  <ArrowRight className="h-6 w-6" />
                </Button>
              </form>
              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-200">
                  <p className="font-medium">Error: {error}</p>
                  <p className="text-sm mt-1">Please try again or try a different username.</p>
                </div>
              )}
            </div>
          )}

          {status === "loading" && <LoadingState />}
          {status === "success" && (
            <>
              {debugInfo && (
                <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-lg text-yellow-200 max-w-md mx-auto">
                  <p className="text-sm">{debugInfo}</p>
                </div>
              )}
              <SuccessState username={username} onStart={startChat} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

