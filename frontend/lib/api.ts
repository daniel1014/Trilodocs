/**
 * API client for interacting with the backend services
 */

// Base API URL - uses environment variables for different environments
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

// Type for the response from the /upload endpoint and document details
export interface UploadResponse {
  results: Array<{
    table_number: string
    table_title: string
    summary: string[]
  }>
  // Add other potential fields from backend response if needed for details view
  // If backend adds size here in the future, it will be automatically picked up
  // by the SelectedDocumentDetails type extending this.
}

// Type for a history item received from the backend's /history endpoint
export interface HistoryItem {
  fileId: string;
  originalFilename: string;
  processedAt: string; // ISO 8601 timestamp string
  size: number;
}

/**
 * Uploads a document file to the backend for processing
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress updates
 * @returns The processed data from the backend
 */
export async function uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
  // Create a FormData object to send the file
  const formData = new FormData()
  formData.append("file", file)

  try {
    // Use XMLHttpRequest to track upload progress
    return await new Promise<UploadResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      })

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (error) {
            reject(new Error("Failed to parse server response"))
          }
        } else {
          try {
            // Attempt to parse error detail from backend
            const errorData = JSON.parse(xhr.responseText);
             // Check if errorData is an object and has a 'detail' property which is a string
            if (typeof errorData === 'object' && errorData !== null && typeof errorData.detail === 'string') {
                 reject(new Error(errorData.detail));
            } else {
                 // Fallback for unexpected error response format
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          } catch {
             // Handle cases where responseText is not valid JSON
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      })

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error occurred during upload"))
      })

      xhr.addEventListener("abort", () => {
        reject(new Error("Upload was aborted"))
      })

      // Send the request
      xhr.open("POST", `${API_BASE_URL}/upload`)
      xhr.send(formData)
    })
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}

/**
 * Fetches the list of processed document metadata from the backend.
 * @returns A promise that resolves to an array of HistoryItem objects.
 */
export async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Assuming the backend returns { "historyItems": [...] }
    // Ensure data.historyItems is an array, default to empty array if not
    return Array.isArray(data.historyItems) ? data.historyItems : [];
  } catch (error) {
    console.error("Error fetching history:", error);
    throw error; // Re-throw the error so the calling component can handle it
  }
}

/**
 * Fetches the full processed document details (including results) for a given file ID.
 * @param fileId The ID of the file to fetch details for.
 * @returns A promise that resolves to the UploadResponse object containing detailed results.
 */
export async function fetchDocumentDetails(fileId: string): Promise<UploadResponse> {
  try {
    // We can reuse the download endpoint to get the JSON data
    const response = await fetch(`${API_BASE_URL}/download/${fileId}`);
     if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // The backend's FileResponse for JSON should be parseable directly as JSON on the client
    const data: UploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching document details for ${fileId}:`, error);
    throw error; // Re-throw the error
  }
}

/**
 * Triggers a browser download of the processed JSON data for a given file ID.
 * This uses the backend's /download endpoint.
 * @param fileId The ID of the file to download.
 */
export async function downloadProcessedDocument(fileId: string): Promise<void> {
  try {
    // Create a link element to trigger the download from the backend endpoint
    const link = document.createElement("a");
    link.href = `${API_BASE_URL}/download/${fileId}`;
    link.download = `SAE_result_${fileId}.json`; // Optional: suggest a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the element
  } catch (error) {
    console.error("Download error:", error)
    throw error
  }
}
