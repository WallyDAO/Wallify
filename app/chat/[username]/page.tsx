import type { Metadata } from "next"
import ChatInterface from "@/components/chat-interface"

interface ChatPageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  return {
    title: `Chatting with @${params.username}`,
    description: `Chat with an AI version of @${params.username} based on their Twitter persona`,
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  return <ChatInterface username={params.username} />
}

