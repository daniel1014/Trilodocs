"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Trash2, MoreVertical, Eye, Calendar, FileType } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DocumentCardProps {
  document: {
    id: string
    name: string
    size: number
    processedAt: string
    fileId?: string
    results: Array<{
      table_number: string
      table_title: string
      summary: string[]
    }>
    type: string
  }
  onView: () => void
  onDelete: () => void
  onDownload: () => void
}

export default function DocumentCard({ document, onView, onDelete, onDownload }: DocumentCardProps) {
  const [isHovering, setIsHovering] = useState(false)

  // Format the date
  const formattedDate = new Date(document.processedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  // Format the time
  const formattedTime = new Date(document.processedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  // Get a summary preview from the first table's summary
  const summaryPreview = document.results[0]?.summary[0] || "No summary available"

  // Get topics from table titles
  const topics = document.results.map((result) => result.table_title).slice(0, 3)

  return (
    <div
      className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors group relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow effect on hover */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 transition-opacity duration-300",
          isHovering && "opacity-100",
        )}
      ></div>

      {/* Document icon and type indicator */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg">
              <FileText className="h-5 w-5 text-cyan-400" />
            </div>
            <div
              className={cn(
                "absolute -inset-0.5 bg-cyan-500 opacity-0 rounded-lg transition-opacity duration-300 blur-sm",
                isHovering && "opacity-20",
              )}
            ></div>
          </div>
          <div>
            <h3 className="font-medium text-white truncate max-w-[180px]">{document.name}</h3>
            <div className="flex items-center text-xs text-gray-400 gap-1">
              <FileType className="h-3 w-3" />
              <span>{document.type}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-gray-900 border-gray-800 text-white">
            <DropdownMenuItem onClick={onView} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800">
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDownload} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800">
              <Download className="h-4 w-4" />
              <span>Download JSON</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-gray-800 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Document details */}
      <div className="p-4 relative">
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Analysis Preview</h4>
          <p className="text-gray-300 text-sm line-clamp-2">{summaryPreview}</p>
        </div>

        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-400 mb-1">Tables</h4>
          <div className="flex flex-wrap gap-1">
            {topics.map((topic, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-300 truncate max-w-[150px]"
              >
                {topic}
              </span>
            ))}
            {document.results.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400">
                +{document.results.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{`${formattedDate} ${formattedTime}`}</span>
          </div>
          <span>{(document.size / 1024).toFixed(2)} KB</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-3 border-t border-gray-800 flex justify-between gap-2 relative">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800 flex-1"
          onClick={onView}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800 flex-1"
          onClick={onDownload}
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20 flex-1"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}
