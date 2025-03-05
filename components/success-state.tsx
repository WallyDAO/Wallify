import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface SuccessStateProps {
  username: string
  onStart: () => void
}

export default function SuccessState({ username, onStart }: SuccessStateProps) {
  const [tweetCount, setTweetCount] = useState<number>(0)
  const [replyCount, setReplyCount] = useState<number>(0)
  
  useEffect(() => {
    const storedTweetCount = sessionStorage.getItem("tweetCount")
    const storedReplyCount = sessionStorage.getItem("replyCount")
    
    if (storedTweetCount) setTweetCount(parseInt(storedTweetCount, 10))
    if (storedReplyCount) setReplyCount(parseInt(storedReplyCount, 10))
  }, [])
  
  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center h-20 w-20 mb-4 bg-green-500 rounded-full">
        <Check className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Your AI self is ready!</h2>
      <p className="text-gray-400 mb-2 text-center">
        We've analyzed @{username}'s Twitter profile and created a custom AI agent that mimics their online persona
        using the{" "}
        <Link
          href="https://meetwally.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1d9bf0] hover:underline"
        >
          Wally API
        </Link>
        .
      </p>
      <p className="text-gray-400 mb-2 text-center">
        Analyzed {tweetCount + replyCount} messages ({tweetCount} tweets + {replyCount} replies) to build your AI persona.
      </p>
      <p className="text-gray-400 mb-6 text-center text-sm">
        Follow{" "}
        <Link
          href="https://twitter.com/Meet_Wally"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1d9bf0] hover:underline"
        >
          @Meet_Wally
        </Link>{" "}
        on Twitter for updates.
      </p>
      <Button onClick={onStart} className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg">
        Start chatting with your AI self
      </Button>
    </div>
  )
}

