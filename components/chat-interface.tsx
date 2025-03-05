"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Mic, Search, ArrowUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Footer from "@/components/footer"
import { useRouter } from "next/navigation"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  id?: string
}

interface ChatInterfaceProps {
  username: string
}

export default function ChatInterface({ username }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Initialize chat with tweets from session storage
  useEffect(() => {
    let isMounted = true // Add a flag to track component mount status

    const storedUsername = sessionStorage.getItem("twitterUsername")
    const storedTweets = sessionStorage.getItem("userTweets")
    const tweetCount = sessionStorage.getItem("tweetCount") || "0"
    const replyCount = sessionStorage.getItem("replyCount") || "0"

    console.log(`Initializing chat for username: ${username}`)
    console.log(`Stored username: ${storedUsername}`)
    console.log(`Stored tweets available: ${storedTweets ? "Yes" : "No"}`)
    console.log(`Tweet count: ${tweetCount}, Reply count: ${replyCount}`)

    if (!storedTweets || !storedUsername || storedUsername !== username) {
      console.log("No stored tweets or username mismatch, redirecting to home")
      // If no tweets in storage or username mismatch, redirecting to home
      router.push("/")
      return
    }

    try {
      const tweets = JSON.parse(storedTweets)
      console.log(`Parsed ${tweets.length} tweets from storage (${tweetCount} tweets + ${replyCount} replies)`)

      // Create system prompt with tweets
      const prompt = createSystemPrompt(username, tweets)
      setSystemPrompt(prompt)
      console.log("System prompt created")

      // Add initial greeting
      if (isMounted) {
        setMessages([
          {
            role: "assistant",
            content: `Hey there! I'm the AI version of @${username}. What's up?`,
          },
        ])
      }
    } catch (error) {
      console.error("Error initializing chat:", error)
      if (isMounted) {
        setError("Failed to initialize chat. Please try again.")
      }
    }

    return () => {
      isMounted = false // Set the flag to false when the component unmounts
    }
  }, [username, router])

  // Create system prompt from tweets
  const createSystemPrompt = (username: string, tweets: string[]): string => {
    // Use all available tweets instead of limiting to 20
    const tweetCount = parseInt(sessionStorage.getItem("tweetCount") || "0", 10)
    const replyCount = parseInt(sessionStorage.getItem("replyCount") || "0", 10)
    
    return `You are an AI assistant that mimics the Twitter persona of @${username}. 
    Your goal is to respond to messages in a way that sounds EXACTLY like @${username} based on their Twitter history.
    
    Here are @${username}'s ${tweets.length} messages (${tweetCount} tweets and ${replyCount} replies) to help you understand their writing style, interests, and personality:
    
    ${tweets.map((tweet, index) => `Message ${index + 1}: "${tweet}"`).join("\n\n")}
    
    When responding:
    1. Use the EXACT SAME tone, vocabulary, slang, abbreviations, and sentence structure as shown in the messages
    2. Mimic any unusual capitalization patterns, punctuation habits, or spelling quirks
    3. Copy the exact way they type - if they use lowercase, use lowercase; if they use lots of emojis, use emojis similarly
    4. Match their use of internet slang, abbreviations, or unique phrases
    5. Maintain the same writing rhythm, sentence length, and paragraph structure
    6. Reference similar topics and interests that appear in their messages
    7. Be conversational and true to their personality
    
    Remember, your responses should be so similar to @${username}'s writing style that it feels like they are actually typing the messages themselves.`
  }

  // Send message to API
  const sendMessage = async (userMessage: string) => {
    try {
      // Add user message to chat
      const newUserMessage: Message = {
        role: "user",
        content: userMessage,
      }

      setMessages((prev) => [...prev, newUserMessage])
      setInput("")
      setIsTyping(true)
      setError(null) // Clear any previous errors

      // Prepare messages for API
      const apiMessages = messages.filter((msg) => msg.role !== "system").concat(newUserMessage)

      console.log("Sending message to chat API")
      console.log(`Message content: "${userMessage}"`)

      // Call our API endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt,
        }),
      })

      console.log(`Chat API response status: ${response.status}`)

      const data = await response.json()
      console.log("Received response from chat API:", data)

      if (!response.ok) {
        console.error("Error response from API:", data)
        throw new Error(data.error || data.details || "Failed to get response")
      }

      // Add assistant response to chat
      if (data.role === "assistant" && data.content) {
        console.log(`Assistant response: "${data.content}"`)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.content,
          },
        ])
      } else if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        // Handle OpenAI-like response format
        const message = data.choices[0].message
        console.log(`Assistant response (OpenAI format): "${message.content}"`)
        setMessages((prev) => [
          ...prev,
          {
            role: message.role || "assistant",
            content: message.content,
          },
        ])
      } else {
        console.warn("Unexpected response format:", data)
        throw new Error("Unexpected response format from API")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error instanceof Error ? error.message : "Failed to send message. Please try again.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    await sendMessage(input.trim())
  }

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#121212]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#333] bg-[#1e1e1e]">
        <div className="flex items-center">
          <div className="flex items-center">
            <svg viewBox="0 0 24 24" className="h-8 w-8 mr-2 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" />
            </svg>
            <div>
              <span className="text-xl font-semibold">Twitter AI Self</span>
              <p className="text-xs text-[#1d9bf0]">Powered by Wally API</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://unavatar.io/twitter/${username}`} alt={username} />
            <AvatarFallback className="bg-[#1d9bf0] text-white">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        {error && (
          <div className="max-w-3xl mx-auto bg-red-900/20 border border-red-900/50 rounded-lg p-4 text-red-200">
            <p className="font-medium">Error</p>
            <p>{error}</p>
            <p className="text-sm mt-2">
              Note: In the v0 preview environment, external API calls may be blocked. This application would work
              correctly when deployed to a production environment.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`max-w-3xl mx-auto ${message.role === "user" ? "text-right" : ""}`}>
            {message.role === "assistant" && (
              <div className="flex items-start mb-2">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={`https://unavatar.io/twitter/${username}`} alt={username} />
                  <AvatarFallback className="bg-[#1d9bf0] text-white">
                    {username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xl font-medium">@{username} AI</div>
              </div>
            )}
            <div
              className={`text-lg whitespace-pre-line ${
                message.role === "assistant" ? "text-white pl-11" : "text-gray-300"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-start mb-2">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={`https://unavatar.io/twitter/${username}`} alt={username} />
                <AvatarFallback className="bg-[#1d9bf0] text-white">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-xl font-medium">@{username} AI</div>
            </div>
            <div className="pl-11">
              <div className="flex items-center space-x-1">
                <div
                  className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#333] p-4 bg-[#1e1e1e]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What do you want to know?"
              className="w-full bg-[#2a2a2a] border-[#444] text-white rounded-lg py-6 pr-24 pl-4 focus:ring-[#1d9bf0] focus:border-[#1d9bf0] h-14 text-lg"
              disabled={isTyping}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button type="button" size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="text-gray-400 hover:text-white">
                <Search className="h-5 w-5" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white h-10 w-10 rounded-lg"
                disabled={!input.trim() || isTyping}
              >
                <ArrowUp className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

