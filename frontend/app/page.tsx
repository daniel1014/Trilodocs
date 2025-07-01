"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, ChevronRight, Sparkles, FileText, Zap, Shield, BarChart, Download, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import ParticleBackground from "@/components/particle-background"
import { motion } from "framer-motion"
import { uploadDocument, type UploadResponse } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function HomePage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [textOutput, setTextOutput] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null)
  const [fileId, setFileId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Reset states
    setError(null)
    setUploadProgress(0)
    setUploadResponse(null)
    setFileId(null)
    setTextOutput("")
    
    // Check file type
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
        file.type === "application/msword" ||
        file.type === "application/pdf") {
      setFile(file)
      processFile(file)
    } else {
      setError("Please upload a Word document (.doc or .docx) or PDF file")
    }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setUploadProgress(0)
    
    try {
      // Upload the file to the backend
      const response = await uploadDocument(file, (progress) => {
        setUploadProgress(progress)
      })
      
      // Store the response
      setUploadResponse(response)
      
      // Extract file ID from the response (assuming it's in the URL or response)
      // In a real implementation, you would extract this from the response
      // For now, we'll generate a mock ID based on the file name
      const mockFileId = btoa(file.name).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)
      setFileId(mockFileId)
      
      // Format the response for display
      const formattedOutput = formatResponseForDisplay(response)
      setTextOutput(formattedOutput)
    } catch (error) {
      console.error("Error processing file:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const formatResponseForDisplay = (response: UploadResponse): string => {
    if (!response.results || response.results.length === 0) {
      return "No results found in the document."
    }
    
    let output = `Successfully processed document!\n\n`;
    
    response.results.forEach((result, index) => {
      output += `Table ${result.table_number}: ${result.table_title}\n`;
      output += `${result.summary.join('\n')}\n\n`;
    });
    
    return output;
  }

  const handleDownloadJSON = () => {
    if (!fileId) {
      setError("No processed file available for download")
      return
    }
    
    try {
      // In a real implementation, you would use the actual file ID from the backend
      // For now, we'll create a JSON file client-side
      const jsonData = uploadResponse || {
        results: [
          {
            table_number: "N/A",
            table_title: "No data available",
            summary: ["No data was processed"]
          }
        ]
      }
      
      // Convert to JSON string
      const jsonString = JSON.stringify(jsonData, null, 2)
      
      // Create a blob with the JSON data
      const blob = new Blob([jsonString], { type: "application/json" })
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob)
      
      // Create a temporary anchor element
      const a = document.createElement("a")
      a.href = url
      a.download = `${file?.name || "document"}-analysis.json`
      
      // Trigger the download
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download the processed file")
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

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
            <div className="relative">
              <Sparkles className="h-6 w-6 text-cyan-400" />
              <div className="absolute inset-0 animate-ping opacity-50">
                <Sparkles className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
              TriloDocs
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-gray-300 hover:text-white transition-colors">
              Documentation
            </Link>
            <Link href="/history" className="text-gray-300 hover:text-white transition-colors">
              History
            </Link>
          </nav>

          <div>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/20">
              Sign Up Free
            </Button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="container mx-auto px-4 mt-4">
          <Alert variant="destructive" className="bg-red-900/50 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 text-transparent bg-clip-text">
              Transform Your Documents with AI-Powered Intelligence
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Upload your Word documents and let our advanced AI extract insights, summarize content, and transform your
              data into actionable intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={triggerFileInput}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 text-lg px-8 py-6 shadow-lg shadow-purple-500/20 group relative overflow-hidden transition-colors duration-500"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Upload Document
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-700"></span>
                <span className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse-slow rounded-md filter blur-md"></span>
                </span>
              </Button>
              <Button
                variant="outline"
                className="bg-purple-500/70 border-purple-500/50 text-white hover:bg-gradient-to-r hover:from-purple-500/50 hover:to-cyan-500/50 text-lg px-8 py-6 group"
              >
                <span className="flex items-center gap-2">
                  Learn More
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upload Section with VFX */}
      <section className="relative z-10 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-10 transition-all duration-300 backdrop-blur-sm relative overflow-hidden",
                isDragging ? "border-cyan-400 bg-cyan-500/10" : "border-gray-700 bg-gray-900/50 hover:border-gray-500",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Background effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-cyan-900/20"></div>
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70"></div>
                <div className="absolute bottom-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-70"></div>
                <div className="absolute left-0 top-1/4 h-1/2 w-1 bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-70"></div>
                <div className="absolute right-0 top-1/4 h-1/2 w-1 bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-70"></div>
              </div>

              <div className="relative z-10 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 mb-4 relative">
                      <FileText className="w-16 h-16 text-cyan-400" />
                      <div className="absolute -inset-1 bg-cyan-500 opacity-20 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">{file.name}</h3>
                    <p className="text-gray-400 mb-4">{(file.size / 1024).toFixed(2)} KB</p>

                    {isProcessing ? (
                      <div className="flex flex-col items-center w-full">
                        <div className="w-full max-w-xs mb-2">
                          <Progress value={uploadProgress} className="h-2 bg-gray-700" />
                        </div>
                        <p className="text-cyan-400 mb-2">Uploading: {uploadProgress}%</p>
                        {uploadProgress === 100 && (
                          <p className="text-purple-400">Processing document...</p>
                        )}
                      </div>
                    ) : (
                      <Button
                        onClick={triggerFileInput}
                        className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                      >
                        Upload Another
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 mb-4 relative">
                      <FileUp className="w-20 h-20 text-gray-500" />
                      <div
                        className={cn(
                          "absolute -inset-4 bg-cyan-500 opacity-0 rounded-full transition-opacity duration-500",
                          isDragging && "opacity-20 animate-pulse",
                        )}
                      ></div>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Upload your document</h3>
                    <p className="text-gray-400 mb-6">Drag and drop your Word or PDF file here or click to browse</p>
                    <Button
                      onClick={triggerFileInput}
                      className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                    >
                      <FileUp className="mr-2 h-4 w-4" /> Select Document
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Text Output Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: textOutput ? 1 : 0, y: textOutput ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "mt-8 p-6 rounded-xl backdrop-blur-sm relative overflow-hidden",
                textOutput ? "border border-gray-700 bg-gray-900/50" : "",
              )}
            >
              {textOutput && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-cyan-900/10"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-70"></div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-medium text-white mb-4 flex items-center">
                      <Sparkles className="mr-2 h-5 w-5 text-cyan-400" />
                      Document Analysis Results
                    </h3>
                    <div className="bg-black/30 p-4 rounded-md border border-gray-800">
                      <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{textOutput}</pre>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={handleDownloadJSON}
                        className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                        disabled={!fileId}
                      >
                        <span className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download JSON
                        </span>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* View History Button */}
      {textOutput && (
        <div className="relative z-10 flex justify-center mb-8">
          <Button
            asChild
            variant="outline"
            className="bg-purple-500/70 border-purple-500/50 text-white hover:bg-gradient-to-r hover:from-purple-500/50 hover:to-cyan-500/50 px-6 py-3"
          >
            <Link href="/history">
              <FileText className="mr-2 h-4 w-4" />
              View Document History
            </Link>
          </Button>
        </div>
      )}

      {/* Features Section */}
      <section className="relative z-10 py-20 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text">
              Powerful Document Processing Features
            </h2>
            <p className="text-xl text-gray-300">Transform your documents with our cutting-edge AI technology</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="h-10 w-10 text-cyan-400" />,
                title: "AI-Powered Analysis",
                description:
                  "Our advanced AI analyzes your documents to extract key insights and identify important patterns.",
              },
              {
                icon: <Zap className="h-10 w-10 text-purple-400" />,
                title: "Instant Processing",
                description: "Get results in seconds with our lightning-fast document processing engine.",
              },
              {
                icon: <Shield className="h-10 w-10 text-cyan-400" />,
                title: "Secure & Private",
                description: "Your documents are encrypted and processed securely. We never store your sensitive data.",
              },
              {
                icon: <BarChart className="h-10 w-10 text-purple-400" />,
                title: "Advanced Analytics",
                description: "Visualize document metrics and gain deeper understanding of your content.",
              },
              {
                icon: <FileText className="h-10 w-10 text-cyan-400" />,
                title: "Multiple Formats",
                description: "Support for various document formats including Word, PDF, and plain text.",
              },
              {
                icon: <Sparkles className="h-10 w-10 text-purple-400" />,
                title: "Custom Insights",
                description: "Tailor the analysis to your specific needs with customizable processing options.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/5 to-cyan-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500 rounded-full filter blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="mb-4 relative">
                    {feature.icon}
                    <div className="absolute inset-0 animate-ping opacity-0 group-hover:opacity-30">{feature.icon}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-10 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-70"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500 rounded-full filter blur-[80px] opacity-10"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500 rounded-full filter blur-[80px] opacity-10"></div>
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-300 to-purple-400 text-transparent bg-clip-text">
                Ready to Transform Your Documents?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are already using TriloDocs to extract insights from their
                documents.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white border-0 text-lg px-8 py-6 shadow-lg shadow-purple-500/20">
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  // className="bg-gradient-to-r from-purple-500/50 to-cyan-500/50 border-purple-500/50 text-white hover:bg-purple-500/20 text-lg px-8 py-6"
                  className="bg-purple-500/70 border-purple-500/50 text-white hover:bg-gradient-to-r hover:from-purple-500/50 hover:to-cyan-500/50 text-lg px-8 py-6"
                >
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-12 backdrop-blur-sm bg-black/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
                  TriloDocs
                </span>
              </div>
              <p className="text-gray-400 text-sm">Transform your documents with AI-powered intelligence.</p>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-medium mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} TriloDocs. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
