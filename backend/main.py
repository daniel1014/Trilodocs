from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from sae_processor import extract_sae_result_structured
from schemas import SaeResult, SaeResultsContainer
import aiofiles, os, uuid, json
from fastapi.middleware.cors import CORSMiddleware
import datetime # Import datetime module

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",           # for local dev
    "http://127.0.0.1:3000",           # for local dev
    "https://trilodocs-frontend.onrender.com",   # for production on render
    "https://trilodocs.vercel.app"  # for production on vercel
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],
)

UPLOAD_DIR = "data/uploaded"
OUTPUT_DIR = "data/output"

# Ensure upload and output directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/upload", response_model=SaeResultsContainer)
async def upload_file(file: UploadFile = File(...)):
    """
    Uploads a .docx or .pdf file, extracts SAE data using structured output,
    and returns the parsed JSON summary.
    """
    original_filename = file.filename
    file_size = file.size # Get the file size here

    if not (original_filename.endswith(".docx") or original_filename.endswith(".pdf")):
        raise HTTPException(status_code=400, detail="Only .docx and .pdf files allowed")

    # Save input file (optional, but good for debugging/reprocessing)
    file_id = str(uuid.uuid4())
    input_file_path = os.path.join(UPLOAD_DIR, f"SAE_input_{file_id}.docx")
    try:
        # Read content to save and pass to processor
        content = await file.read()
        async with aiofiles.open(input_file_path, 'wb') as out_file:
            await out_file.write(content)
    except Exception as e:
        if os.path.exists(input_file_path):
             os.remove(input_file_path)
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {e}")

    # Extract tables and generate summary using the structured output function
    # Pass the path to the saved file
    sae_data_object = extract_sae_result_structured(input_file_path)

    # Check if extraction was successful (returns None on failure)
    if sae_data_object is None:
         # Clean up input file if extraction fails
         if os.path.exists(input_file_path):
             os.remove(input_file_path)
         raise HTTPException(status_code=500, detail="Failed to extract structured data from the document.")

    # Convert the Pydantic object to a dictionary
    sae_data_dict = sae_data_object.model_dump()

    # Save the extracted data to a JSON file
    output_path = os.path.join(OUTPUT_DIR, f"SAE_result_{file_id}.json")
    metadata_path = os.path.join(OUTPUT_DIR, f"SAE_metadata_{file_id}.json") # Path for metadata file
    processed_at = datetime.datetime.now().isoformat() # Get current timestamp in ISO format

    try:
        # Save the main results JSON
        with open(output_path, "w") as f:
            json.dump(sae_data_dict, f, indent=4)

        # Save metadata for history page
        metadata = {
            "fileId": file_id,
            "originalFilename": original_filename,
            "processedAt": processed_at,
            "size": file_size # Include file size in metadata
        }
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=4)

    except Exception as e:
         print(f"Warning: Failed to save output JSON or metadata for file_id {file_id}: {e}")
         # Decide how to handle save errors - currently, we log and proceed.

    # Return the extracted data dictionary. FastAPI will serialize it to JSON automatically because response_model takes care of it
    return sae_data_dict

@app.get("/download/{file_id}")
async def download_json(file_id: str):
    """
    Downloads the extracted JSON data for a given file_id.
    Note: This endpoint is also used by the frontend to fetch
    document details for the history dialog.
    """
    path = os.path.join(OUTPUT_DIR, f"SAE_result_{file_id}.json")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")

    # For download, return as FileResponse
    # For fetching details (via fetch API), the client handles the JSON parsing
    return FileResponse(path, media_type="application/json", filename=f"SAE_result_{file_id}.json") # Use file_id in filename for clarity

@app.get("/history")
async def get_history():
    """
    Returns a list of processed file metadata.
    """
    history_items = []
    # Iterate through files in the output directory
    for filename in os.listdir(OUTPUT_DIR):
        # Look for metadata files
        if filename.startswith("SAE_metadata_") and filename.endswith(".json"):
            metadata_path = os.path.join(OUTPUT_DIR, filename)
            try:
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)
                    # Validate required fields including the new 'size'
                    if all(k in metadata for k in ["fileId", "originalFilename", "processedAt", "size"]):
                         history_items.append(metadata)
                    else:
                         print(f"Warning: Skipping invalid metadata file: {filename}")
            except json.JSONDecodeError:
                print(f"Warning: Skipping invalid JSON metadata file: {filename}")
            except Exception as e:
                print(f"Warning: Could not read metadata file {filename}: {e}")

    # Sort history items by processedAt timestamp, newest first
    # Use a robust way to handle potential missing timestamps if necessary
    history_items.sort(key=lambda x: x.get("processedAt", ""), reverse=True)


    # Return a list of metadata objects
    return {"historyItems": history_items}