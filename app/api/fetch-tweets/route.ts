import { NextResponse } from "next/server"

// Get environment variables with fallbacks for development
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "55de73d13emshabd1be91b877eeap1a7733jsn201d94c9790b"
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "twttrapi.p.rapidapi.com"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  console.log(`[API] Fetching tweets for username: ${username}`)

  if (!username) {
    console.log("[API] Error: Username is required")
    return NextResponse.json({ error: "Username is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Making request to RapidAPI for ${username}`)
    const response = await fetch(`https://${RAPIDAPI_HOST}/user-tweets?username=${username}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    })

    console.log(`[API] RapidAPI response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`[API] RapidAPI error: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch tweets: ${response.statusText}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[API] RapidAPI response data type: ${typeof data}`)
    console.log(`[API] RapidAPI response data structure: ${JSON.stringify(data).substring(0, 200)}...`)

    // Extract full_text from tweets with better error handling
    const tweets = []

    // Check if data has a data property with user_result and timeline
    if (
      data &&
      data.data &&
      data.data.user_result &&
      data.data.user_result.result &&
      data.data.user_result.result.timeline_response &&
      data.data.user_result.result.timeline_response.timeline &&
      data.data.user_result.result.timeline_response.timeline.instructions
    ) {
      console.log(`[API] Found timeline data structure`)

      // Find the TimelineAddEntries instruction
      const addEntriesInstruction = data.data.user_result.result.timeline_response.timeline.instructions.find(
        (instruction: { __typename: string }) => instruction.__typename === "TimelineAddEntries",
      )

      if (addEntriesInstruction && addEntriesInstruction.entries) {
        console.log(`[API] Found ${addEntriesInstruction.entries.length} timeline entries`)

        // Extract tweets from the entries
        for (const entry of addEntriesInstruction.entries) {
          if (
            entry.content &&
            entry.content.__typename === "TimelineTimelineItem" &&
            entry.content.content &&
            entry.content.content.__typename === "TimelineTweet" &&
            entry.content.content.tweetResult &&
            entry.content.content.tweetResult.result
          ) {
            const tweet = entry.content.content.tweetResult.result

            // Extract the tweet text
            if (tweet.legacy && tweet.legacy.full_text) {
              tweets.push(tweet.legacy.full_text)
            }
          }
        }

        console.log(`[API] Extracted ${tweets.length} tweets from timeline entries`)
      }
    }
    // Check if data is an array (direct tweets array)
    else if (Array.isArray(data)) {
      console.log(`[API] Data is an array with ${data.length} items`)
      for (const tweet of data) {
        if (tweet.full_text) {
          tweets.push(tweet.full_text)
        } else if (tweet.text) {
          tweets.push(tweet.text)
        }
      }
    }
    // Check if data has a data property that's an array
    else if (data && data.data && Array.isArray(data.data)) {
      console.log(`[API] Data has a data property with ${data.data.length} items`)
      for (const tweet of data.data) {
        if (tweet.full_text) {
          tweets.push(tweet.full_text)
        } else if (tweet.text) {
          tweets.push(tweet.text)
        }
      }
    }
    // Check if data has a tweets property that's an array
    else if (data && data.tweets && Array.isArray(data.tweets)) {
      console.log(`[API] Data has a tweets property with ${data.tweets.length} items`)
      for (const tweet of data.tweets) {
        if (tweet.full_text) {
          tweets.push(tweet.full_text)
        } else if (tweet.text) {
          tweets.push(tweet.text)
        }
      }
    }
    // Check if data has a statuses property that's an array (Twitter API v1.1 format)
    else if (data && data.statuses && Array.isArray(data.statuses)) {
      console.log(`[API] Data has a statuses property with ${data.statuses.length} items`)
      for (const tweet of data.statuses) {
        if (tweet.full_text) {
          tweets.push(tweet.full_text)
        } else if (tweet.text) {
          tweets.push(tweet.text)
        }
      }
    }

    console.log(`[API] Extracted ${tweets.length} tweets`)

    // If no tweets were found, try to use mock data for testing
    if (tweets.length === 0) {
      console.log("[API] No tweets found, using mock data for testing")

      // Use mock data for testing purposes
      const mockTweets = [
        "Just had an amazing coffee at my favorite cafe! ☕ #MorningVibes",
        "Working on a new project. Can't wait to share it with you all! 🚀 #Excited",
        "The sunset today was absolutely breathtaking. Nature's beauty never fails to amaze me. 🌅",
        "Reading this fascinating book about AI and the future of technology. Highly recommend! 📚",
        "Had a great workout session today. Feeling energized! 💪 #FitnessGoals",
        "Thinking about the impact of social media on our daily lives. What are your thoughts?",
        "Just watched an incredible movie that left me speechless. Cinema at its finest! 🎬",
        "Grateful for all the support from my amazing followers. You all rock! ❤️",
        "Exploring new music genres today. Any recommendations? 🎵",
        "Sometimes the simplest moments bring the greatest joy. Appreciate the little things! ✨",
      ]

      return NextResponse.json({
        tweets: mockTweets,
        warning: "Using mock data because no tweets were found. This is for testing purposes only.",
      })
    }

    return NextResponse.json({ tweets })
  } catch (error) {
    console.error("[API] Error fetching tweets:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch tweets from Twitter API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

