import { NextResponse } from "next/server"

const WALLY_API_KEY = process.env.WALLY_API_KEY
const WALLY_API_URL = process.env.WALLY_API_URL 

export async function POST(request: Request) {
  try {
    const { messages, systemPrompt } = await request.json()

    console.log("[Chat API] Received request with system prompt and messages")
    console.log(`[Chat API] System prompt length: ${systemPrompt ? systemPrompt.length : 0}`)
    console.log(`[Chat API] Number of messages: ${messages ? messages.length : 0}`)

    // Filter out any system messages that might have been included in the messages array
    const userMessages = messages.filter((message: { role: string; content: string }) => message.role !== "system")
    
    // Log the exact request we're making
    const requestBody = {
      model: "wallify",
      messages: userMessages,
      systemPrompt: systemPrompt
    }

    console.log("[Chat API] Making request to Wally API")
    console.log(`[Chat API] Request URL: ${WALLY_API_URL}`)
    console.log(`[Chat API] Request method: POST`)
    // Avoid logging full API key in production
    console.log(
      `[Chat API] Request headers: Authorization: Bearer ${WALLY_API_KEY.substring(0, 10)}..., Content-Type: application/json`,
    )
    console.log(`[Chat API] Request body: ${JSON.stringify(requestBody).substring(0, 200)}...`)

    try {
      // Make the request to Wally API
      const response = await fetch(WALLY_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WALLY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log(`[Chat API] Wally API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.log(`[Chat API] Wally API error: ${errorText}`)
        throw new Error(`Wally API returned error: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log("[Chat API] Successfully received response from Wally API")
      console.log(`[Chat API] Response data: ${JSON.stringify(data).substring(0, 200)}...`)

      // Transform the response format to match what the frontend expects
      // The Wally API returns {response: "message"} but the frontend expects {role: "assistant", content: "message"}
      const transformedResponse = {
        role: "assistant",
        content: data.response
      }
      
      console.log("[Chat API] Transformed response:", transformedResponse)

      return NextResponse.json(transformedResponse)
    } catch (networkError: unknown) {
      console.error("[Chat API] Network error when calling Wally API:", networkError)
      
      if (networkError instanceof Error) {
        console.error("[Chat API] Error name:", networkError.name)
        console.error("[Chat API] Error message:", networkError.message)
        console.error("[Chat API] Error cause:", networkError.cause)
      } else {
        console.error("[Chat API] Unknown error type:", typeof networkError)
      }
      
      // Re-throw to be caught by the outer try-catch
      throw networkError
    }
  } catch (error) {
    console.error("[Chat API] Error in chat API:", error)
    console.error("[Chat API] Error details:", error instanceof Error ? error.message : String(error))

    return NextResponse.json(
      {
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

