import { NextResponse } from "next/server"

// Get environment variables with fallbacks for development
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "55de73d13emshabd1be91b877eeap1a7733jsn201d94c9790b"
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || "twttrapi.p.rapidapi.com"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("username")

  console.log(`[API] Fetching replies for username: ${username}`)

  if (!username) {
    console.log("[API] Error: Username is required")
    return NextResponse.json({ error: "Username is required" }, { status: 400 })
  }

  try {
    console.log(`[API] Making request to RapidAPI for ${username} replies`)
    const response = await fetch(`https://${RAPIDAPI_HOST}/user-replies?username=${username}`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
    })

    console.log(`[API] RapidAPI replies response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.log(`[API] RapidAPI replies error: ${errorText}`)
      return NextResponse.json(
        { error: `Failed to fetch replies: ${response.statusText}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log(`[API] RapidAPI replies response data type: ${typeof data}`)
    console.log(`[API] RapidAPI replies response data structure: ${JSON.stringify(data).substring(0, 200)}...`)

    // Extract full_text from replies with better error handling
    const replies = []

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
      console.log(`[API] Found timeline data structure for replies`)

      // Find the TimelineAddEntries instruction
      const addEntriesInstruction = data.data.user_result.result.timeline_response.timeline.instructions.find(
        (instruction: { __typename: string }) => instruction.__typename === "TimelineAddEntries",
      )

      if (addEntriesInstruction && addEntriesInstruction.entries) {
        console.log(`[API] Found ${addEntriesInstruction.entries.length} timeline reply entries`)

        // Extract replies from the entries
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
              replies.push(tweet.legacy.full_text)
            }
          }
        }

        console.log(`[API] Extracted ${replies.length} replies from timeline entries`)
      }
    }
    // Check various other possible data structures similar to the tweet API
    else if (Array.isArray(data)) {
      console.log(`[API] Replies data is an array with ${data.length} items`)
      for (const reply of data) {
        if (reply.full_text) {
          replies.push(reply.full_text)
        } else if (reply.text) {
          replies.push(reply.text)
        }
      }
    }
    else if (data && data.data && Array.isArray(data.data)) {
      console.log(`[API] Replies data has a data property with ${data.data.length} items`)
      for (const reply of data.data) {
        if (reply.full_text) {
          replies.push(reply.full_text)
        } else if (reply.text) {
          replies.push(reply.text)
        }
      }
    }

    console.log(`[API] Extracted ${replies.length} replies`)

    return NextResponse.json({ replies })
  } catch (error) {
    console.error("[API] Error fetching replies:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch replies from Twitter API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
} 