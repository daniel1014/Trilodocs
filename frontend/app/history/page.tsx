"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, Search, ChevronLeft, ArrowUpDown, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import ParticleBackground from "@/components/particle-background"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import DocumentCard from "@/components/document-card"
import { fetchHistory, fetchDocumentDetails, downloadProcessedDocument, type UploadResponse, type HistoryItem as BackendHistoryItem } from "@/lib/api"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

// Define the structure for a history item used in the list view
// This should match the data returned by the backend /history endpoint
interface HistoryItem extends BackendHistoryItem {
    // Add any frontend-specific properties needed for the list view
    displayDate: string; // Formatted date string
}

// Define the structure for the selected document with full details for the dialog
// This combines HistoryItem data with the full results fetched from /download/{file_id}
interface SelectedDocumentDetails extends HistoryItem, UploadResponse {
     // No additional fields are needed here based on current backend structure.
}

export default function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]) // Use the new HistoryItem type for the list
  const [loading, setLoading] = useState(true) // Loading state for the main history list
  const [error, setError] = useState<string | null>(null) // Error state for the main history list
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date") // Added size sort back
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedDocumentDetails, setSelectedDocumentDetails] = useState<SelectedDocumentDetails | null>(null) // Store full details for dialog
  const [showDetails, setShowDetails] = useState(false) // State for dialog visibility
  const [loadingDetails, setLoadingDetails] = useState(false) // Loading state for fetching dialog details

  // Fetch history data on component mount
  useEffect(() => {
    const getHistory = async () => {
      setLoading(true)
      setError(null) // Clear previous errors
      try {
        const items = await fetchHistory() // Fetch history items from the backend

        // Add frontend-specific data like formatted date
        const formattedItems = items.map(item => ({
            ...item,
            displayDate: new Date(item.processedAt).toLocaleString(), // Format date for display
        }));

        setHistoryItems(formattedItems)
      } catch (err) {
        console.error("Failed to fetch history:", err)
        setError("Failed to load document history. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    getHistory()
  }, []) // Empty dependency array means this effect runs only once after the initial render

  // Filter documents based on search query
  const filteredDocuments = historyItems.filter(
    (item) =>
      // Search by original filename
      item.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
      // Add other fields to search if they are in HistoryItem and relevant for the list view
  )

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === "date") {
      // Compare date strings by converting to Date objects
      return sortOrder === "asc"
        ? new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime()
        : new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
    } else if (sortBy === "name") {
      // Compare original filenames alphabetically
      return sortOrder === "asc" ? a.originalFilename.localeCompare(b.originalFilename) : b.originalFilename.localeCompare(a.originalFilename)
    }
     else if (sortBy === "size") { // Add size sorting logic
       return sortOrder === "asc" ? a.size - b.size : b.size - a.size;
     }
    return 0; // Default return value for sort
  })

  // Handle sort button clicks
  const handleSort = (type: "date" | "name" | "size") => { // Update allowed sort types
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(type)
      setSortOrder("desc") // Default to descending for new sort type
    }
  }

  // Handle viewing details - fetches full details when dialog is opened
  const handleViewDetails = async (item: HistoryItem) => {
      setSelectedDocumentDetails(null); // Clear previous details
      setShowDetails(true); // Open the dialog immediately
      setLoadingDetails(true); // Start loading state for details
      setError(null); // Clear main error, maybe need a separate dialog error state

      try {
          const details = await fetchDocumentDetails(item.fileId);
          // Combine the history item info with the full details fetched
          // HistoryItem already has fileId, originalFilename, processedAt, and size.
          // UploadResponse has results.
          // We combine them into SelectedDocumentDetails.
          setSelectedDocumentDetails({
              ...item, // Includes fileId, originalFilename, processedAt, size
              ...details // Includes results
          });
      } catch (err) {
          console.error(`Failed to fetch details for ${item.fileId}:`, err);
          setError("Failed to load document details. Please try again later.");
          setShowDetails(false);
      } finally {
          setLoadingDetails(false);
      }
  }

  // Handle document deletion (optional - requires backend endpoint)
  const handleDelete = (fileId: string) => {
    // Implement backend call to delete the document by fileId
    // For now, just remove from local state (will reappear on refresh unless backend deletes)
    setHistoryItems(historyItems.filter((item) => item.fileId !== fileId))
    console.log(`Attempting to delete document with fileId: ${fileId}`);
    // In a real app: call backend API to delete and then refetch history or update state based on backend success
    // Example: deleteDocumentApi(fileId).then(() => setHistoryItems(...)).catch(...)
  }

  // Handle downloading JSON - uses the backend endpoint
  const handleDownloadJSON = async (item: HistoryItem | SelectedDocumentDetails) => {
    if (!item.fileId) {
      console.error("No file ID available for download")
      setError("Cannot download: File ID is missing.")
      return
    }

    try {
      await downloadProcessedDocument(item.fileId);
    } catch (error) {
      console.error(`Download error for fileId ${item.fileId}:`, error)
      setError("Failed to initiate document download.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Glow effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500 rounded-full filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500 rounded-full filter blur-[100px] opacity-20"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 backdrop-blur-sm bg-black/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ChevronLeft className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400">Back to Home</span>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              Document History
            </h1>
          </div>

          <div>{/* Placeholder for balance */}</div>
        </div>
      </header>

      {/* Error Alert for main page */}
       {error && (
        <div className="container mx-auto px-4 mt-4">
          <Alert variant="destructive" className="bg-red-900/50 border-red-800">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Input
                  type="text"
                  placeholder="Search documents by filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                )}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("date")}
                  className={cn(
                    "border-gray-700 text-gray-300",
                    sortBy === "date" && "border-cyan-500/50 text-cyan-400",
                  )}
                >
                  Date
                  <ArrowUpDown
                    className={cn("ml-2 h-3 w-3", sortBy === "date" && sortOrder === "asc" && "rotate-180")}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("name")}
                  className={cn(
                    "border-gray-700 text-gray-300",
                    sortBy === "name" && "border-cyan-500/50 text-cyan-400",
                  )}
                >
                  Name
                  <ArrowUpDown
                    className={cn("ml-2 h-3 w-3", sortBy === "name" && sortOrder === "asc" && "rotate-180")}
                  />
                </Button>
                 <Button // Add size sort button back
                  variant="outline"
                  size="sm"
                  onClick={() => handleSort("size")}
                  className={cn(
                    "border-gray-700 text-gray-300",
                    sortBy === "size" && "border-cyan-500/50 text-cyan-400",
                  )}
                >
                  Size
                  <ArrowUpDown
                    className={cn("ml-2 h-3 w-3", sortBy === "size" && sortOrder === "asc" && "rotate-180")}
                  />
                </Button>
              </div>
            </div>
          </motion.div>

          {loading ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-center py-16">
                 <p className="text-gray-400">Loading document history...</p>
             </motion.div>
          ) : sortedDocuments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No documents found</h3>
              <p className="text-gray-400 mb-6">
                {searchQuery
                  ? `No documents match your search "${searchQuery}"`
                  : "You haven't processed any documents yet"}
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                <Link href="/">Process a Document</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {sortedDocuments.map((item, index) => (
                  <motion.div
                    key={item.fileId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <DocumentCard
                      document={{
                         id: item.fileId,
                         name: item.originalFilename,
                         processedAt: item.processedAt,
                         fileId: item.fileId,
                         size: item.size, // Pass the size from the history item
                         type: item.originalFilename.split('.').pop()?.toUpperCase() || 'N/A',
                         results: [], // Still pass empty array for list view performance
                      }}
                      onView={() => handleViewDetails(item)}
                      onDelete={() => handleDelete(item.fileId)}
                      onDownload={() => handleDownloadJSON(item)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Document Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-gray-900 border border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-400" />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                {selectedDocumentDetails?.originalFilename}
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Processed on {selectedDocumentDetails ? new Date(selectedDocumentDetails.processedAt).toLocaleString() : 'N/A'}
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
              <div className="flex justify-center items-center h-40">
                <p className="text-gray-400">Loading details...</p>
              </div>
          ) : selectedDocumentDetails ? (
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="space-y-6">
                {selectedDocumentDetails.results && selectedDocumentDetails.results.length > 0 ? (
                    selectedDocumentDetails.results.map((result, index) => (
                    <div key={index} className="bg-black/30 p-4 rounded-md border border-gray-800">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">
                        Table {result.table_number}: {result.table_title}
                        </h3>
                        <ul className="text-gray-300 list-disc pl-5 space-y-1">
                        {result.summary.map((sentence, i) => (
                            <li key={i} className="text-sm">
                            {sentence}
                            </li>
                        ))}
                        </ul>
                    </div>
                    ))
                ) : (
                    <p className="text-gray-400">No analysis results found for this document.</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Document Size</h3>
                    {/* Display size from selectedDocumentDetails (which comes from initial history item + fetch details) */}
                    <p className="text-white">{selectedDocumentDetails.size ? (selectedDocumentDetails.size / 1024).toFixed(2) + " KB" : "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">File ID</h3>
                    <p className="text-white break-all">{selectedDocumentDetails.fileId || "N/A"}</p>
                  </div>
                   <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Document Type</h3>
                     <p className="text-white">{selectedDocumentDetails.originalFilename.split('.').pop()?.toUpperCase() || 'N/A'}</p>
                  </div>
                   <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Tables Found</h3>
                    <p className="text-white">{selectedDocumentDetails.results ? selectedDocumentDetails.results.length : 0}</p>
                  </div>
                </div>
              </div>
            </div>
           ) : (
             <div className="flex justify-center items-center h-40">
                <p className="text-gray-400">Select a document to view details.</p>
             </div>
           )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={() => setShowDetails(false)}
              disabled={loadingDetails}
            >
              Close
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
              onClick={() => selectedDocumentDetails && handleDownloadJSON(selectedDocumentDetails)}
              disabled={!selectedDocumentDetails || loadingDetails}
            >
              <Download className="mr-2 h-4 w-4" />
              Download JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
