from pydantic import BaseModel, Field
from pydantic import BaseModel, Field
from typing import List

# Define the structure of the expected JSON using Pydantic
class SaeResult(BaseModel):
    """Details extracted from a single SAE table."""
    table_number: str = Field(description="The table number extracted from the document.")
    table_title: str = Field(description="The title of the table.")
    summary: List[str] = Field(description="List of sentences summarizing the serious adverse events for the table.")

class SaeResultsContainer(BaseModel):
    """Container for multiple SAE table results."""
    results: List[SaeResult] = Field(description="A list of extracted results, one for each relevant table found.")