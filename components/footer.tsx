import Link from "next/link"
import { Twitter, Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full py-4 px-4 bg-[#1e1e1e] border-t border-[#333]">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <Link
            href="https://meetwally.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1d9bf0] hover:underline"
          >
            Powered by Wally
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="https://twitter.com/Meet_Wally"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1d9bf0] hover:text-[#1a8cd8] transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          <Link
            href="https://github.com/SerPepe/wallify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300 transition-colors"
          >
            <Github className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

