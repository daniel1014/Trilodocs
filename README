# TriloDocs - AI Document Processing

TriloDocs is a web application that allows users to upload Word (.docx) and PDF (.pdf) documents and process them using a backend AI service (GEMINI LLM) to extract structured data and summaries. The application provides a history page to view previously processed documents and download the results.

## Features

*   Upload .docx and .pdf documents.
*   AI-powered extraction and summarization of document content.
*   View a history of processed documents.
*   Download processed results as JSON files.

## Prerequisites

Before running this project, you need to have the following installed on your system:

*   **Python 3.8+:** For the backend server.
*   **Node.js (LTS version recommended):** For the frontend development server and build tools. This includes `npm`.
*   **Make:** A command-line utility for executing the Makefile commands (usually pre-installed on macOS/Linux, may require separate installation on Windows).

## Setup and Installation

Follow these steps to set up and install the project dependencies:

1.  **Unzip the file:**

2.  **Use the Makefile for setup:**
    From the root directory of the project, run the following command to set up both the backend and frontend:
    ```bash
    make setup-all
    ```
    *   This command will:
        *   Navigate to the `backend` directory.
        *   Create a Python virtual environment (`.venv`).
        *   Activate the virtual environment and install backend dependencies from `backend/requirements.txt`.
        *   Navigate to the `frontend` directory.
        *   Install frontend dependencies using `npm install --legacy-peer-deps` (the `--legacy-peer-deps` flag is needed to resolve potential dependency conflicts with specific library versions).

    Alternatively, you can set up the backend and frontend separately:
    ```bash
    # Setup Backend
    make setup-backend

    # Setup Frontend
    make setup-frontend
    ```

## Running the Project

You can run the backend and frontend servers using the Makefile. You will typically need two separate terminal windows for this.

1.  **Run the backend server:**
    Open a terminal in the root project directory and run:
    ```bash
    make run-backend
    ```
    This will activate the backend virtual environment and start the FastAPI server, typically at `http://127.0.0.1:8000`.

2.  **Run the frontend server:**
    Open a **new** terminal window in the root project directory and run:
    ```bash
    make run-frontend
    ```
    This will navigate to the `frontend` directory and start the Next.js development server, typically at `http://localhost:3000`.

3.  **Access the application:**
    Once both servers are running, open your web browser and go to `http://localhost:3000` to access the TriloDocs application.

You can also attempt to run both concurrently with `make run-all`, but be aware that managing output in a single terminal may be difficult:
```bash
make run-all
```

## Project Structure

The project is divided into two main directories:

*   `backend/`: Contains the Python FastAPI backend application, including the document processing logic (`sae_processor.py`), API endpoints (`main.py`), and data models (`schemas.py`).
*   `frontend/`: Contains the Next.js frontend application, including pages (`app/`), components (`components/`), and API interaction logic (`lib/api.ts`).

## Notes

### Technology Stack Highlights

*   **Backend Document Processing:** The backend utilizes **Langchain** with **Structured Output** to extract summaries from uploaded documents. This approach is chosen as theortically it could handle various scenarios and data format with a good prompt enginnering technique, which avoids the need of tailor-made hardcode and enables higher flexibility.  
*   **Text Extraction:** **Unstructured** open-source library is used for handling text extraction from various document types. Unstructured is chosen for its scalability and flexibility, capable of processing over 30 file types without requiring different libraries like `python-docx`.

### Frontend Visual Features

The frontend integrates several visually appealing features:

*   **Particle Background:** Interactive particles that respond to mouse movement with glowing connections.
*   **Gradient Effects:** Beautiful cyan-to-purple gradients used throughout the design elements.
*   **Glow Effects:** Subtle glowing effects applied around important UI elements and buttons.
*   **Visual Upload Experience:** An engaging document upload area featuring visual feedback and smooth animations.
*   **Text Output Display:** A dedicated section for displaying processed document results with a distinct stylized border.
*   **Animated Elements:** Smooth animations for various UI elements as they appear on the screen, enhancing the user experience.
*   **Interactive Hover Effects:** Subtle animations and transitions applied to buttons and cards on hover.

### Assumptions

*   Users have Python 3 and Node.js/npm installed and accessible in their PATH.
*   The `make` utility is available.
*   The backend is expected to run on port 8000 and the frontend on port 3000. The current CORS configuration in the backend's `main.py` is set up to allow requests from `http://localhost:3000` and `http://127.0.0.1:3000`.
*   The backend's document processing logic (`sae_processor.py`) and its dependencies specified in `requirements.txt` are assumed to function correctly within the Python environment created by the setup process.

### Limitations

*   **Hardcoded API URL:** The backend API URL (`http://127.0.0.1:8000`) is hardcoded in `frontend/lib/api.ts`. This should be configured using environment variables for different environments (development, production).
*   **Permissive CORS:** The current CORS configuration in the backend (`allow_methods=["*"]`, `allow_headers=["*"]`) is very permissive for ease of development. It might not be ideal for a production environment, especially if it comes to the API exposure of Ngrok in the future. 
*   **Basic Error Handling:** Error handling in both the frontend and backend can be further improved to provide more specific and user-friendly feedback for various failure scenarios (e.g., invalid file content, processing errors).
*   **No User Authentication:** The application currently lacks user authentication and authorization, meaning anyone can access the history and potentially download any processed file if they know the file ID.
*   **Local File Storage:** Processed documents and metadata are stored directly in the `data/` directory on the backend server's local filesystem. This is not scalable or suitable for a multi-user or production deployment.
*   **Frontend-only Delete:** The delete functionality on the history page currently only removes the item from the frontend's state. It does not delete the actual files from the backend's `data` directory.
*   **Size Display in History List:** The size displayed in the history list is the size of the *uploaded* file, stored in the metadata. It does not necessarily represent the size of the final processed JSON output file.

### Additional Improvements

*   **Environment Variables:** Implement environment variables for configuring the backend API URL in the frontend and potentially other settings.
*   **Stricter CORS:** Refine the backend's CORS policy for production.
*   **Enhanced Error Reporting:** Implement more detailed error logging in the backend and better error messages/notifications in the frontend.
*   **User Authentication and Authorization:** Add a system for user accounts and secure access to documents.
*   **Cloud Storage Integration:** Integrate with a cloud storage solution (e.g., Supabase, AWS S3, Google Cloud Storage) for storing processed documents and metadata.
*   **Database for Metadata:** Use a database to store document metadata (file ID, original filename, processed timestamp, size, etc.) instead of separate JSON files, especially for managing a large history.
*   **Pagination/Infinite Scrolling:** For a large number of processed documents, implement pagination or infinite scrolling on the history page to improve performance.
*   **Document Preview:** Implement a way to view a formatted preview of the document content or extracted data directly on the history page or in the details dialog, without needing to download the JSON.
*   **Backend Delete Endpoint:** Add a backend endpoint to handle the deletion of processed files and their metadata.
*   **Dockerization:** Create Dockerfiles for the backend and frontend to containerize the application, making deployment more consistent and easier.
*   **Improve `sae_processor.py`:** Continuously improve the document processing logic for better accuracy and handling of different document structures.
