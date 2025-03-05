"use client"

import { useState, useEffect } from "react"

export default function LoadingState() {
  const [message, setMessage] = useState("Searching for Twitter profile...")

  useEffect(() => {
    const messages = [
      "Searching for Twitter profile...",
      "Analyzing tweets...",
      "Processing writing style...",
      "Understanding interests...",
      "Creating AI personality...",
      "Finalizing your AI self...",
    ]

    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length
      setMessage(messages[currentIndex])
    }, 1800)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-md mx-auto">
      <div className="relative flex items-center justify-center h-20 w-20 mb-4">
        <div className="absolute h-16 w-16 rounded-full border-4 border-t-[#1d9bf0] border-r-[#1d9bf0] border-b-[#1d9bf0] border-l-transparent animate-spin"></div>
      </div>
      <p className="text-lg text-gray-300 text-center animate-pulse">{message}</p>
    </div>
  )
}

