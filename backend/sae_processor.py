import os
import re
import json
from schemas import SaeResult, SaeResultsContainer
from dotenv import load_dotenv
from unstructured.partition.auto import partition
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.exceptions import OutputParserException

load_dotenv()

required_env_vars = ["GOOGLE_API_KEY"]
for var in required_env_vars:
	if not os.getenv(var):
		raise ValueError(f'{var} is not set. Please add it to your environment variables.')


# Configure the LLM with structured output by binding the SaeResultsContainer Pydantic model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    # model="gemini-2.5-flash-preview-04-17",       # Example of an alternative model
    temperature=0,      # Keep temperature low for consistent output
    timeout=None,
).with_structured_output(SaeResultsContainer)       # it tells the model how to format it (using the Pydantic schema)

# This example helps the model understand the expected summary content format and style.
# Note: The example only shows one table, but the prompt instructions will guide for multiple.
FEW_SHOT_EXAMPLE = """
Example Input Table:
Table 2.1.1 Summary of Serious Adverse Events by Treatment Group
Preferred Term Placebo Compound X Seizure 1 3 Nausea 0 2 Headache 2 4 Total number of participants with SAE 3 9

Expected Summary Content (to fit the schema for Table 2.1.1):
"There were 12 total serious adverse events reported.",
"33.3% of Placebo participants experienced seizure.",
"0% of Placebo participants experienced nausea.",
"66.7% of Placebo participants experienced headache."
"33.3% of Compound X participants experienced seizure.",
"22.2% of Compound X participants experienced nausea.",
"44.4% of Compound X participants experienced headache.",
"""


def extract_sae_result_structured(file_path: str) -> SaeResultsContainer | None:
    """
    Extracts table data from a document, builds a prompt for the LLM,
    invokes the LLM with structured output, and returns the parsed Pydantic object.
    Returns None if LLM fails to return valid structured output.
    """
    elements = partition(filename=file_path)
    # titles = [el for el in elements if el.category == "Title"]        #NOTE: it can be used to breakdown the raw text in categories for other use cases
    # tables = [el for el in elements if el.category == "Table"]

    text = "\n".join([el.text for el in elements])

    # Adjust the prompt for structured output - tell the model its role and what to extract
    prompt = f"""
You are an AI assistant tasked with extracting Serious Adverse Event (SAE) and Adverse Event Leading to Death information from clinical trial tables.
Analyze the following document text which may contain one or more tables.

For EACH table identified in the text:
1. Extract the exact table number (e.g., "2.1.1").
2. Extract the exact table title (e.g., "Summary of Serious Adverse Events by Treatment Group").
3. Generate a list of concise summary sentences based ONLY on the data presented in THAT specific table, following the Summary Rules below.

Collect the results for ALL identified tables into the 'results' list according to the specified JSON schema.

## Summary Rules for EACH Table's Summary:
If any SAEs or Adverse Events Leading to Death exist in the table (i.e., recorded value > 0):
• Create ONE sentence summarising the TOTAL number of events reported in THAT table.
• For sentences reporting percentages, find the total number of participants for the relevant group (Placebo or Compound X) within THAT specific table's data and calculate the percentage accurately based on that total.
• Create ONE sentence per preferred term for the Placebo group with events > 0 in THAT table, including accurate percentages.
• Create ONE sentence per preferred term for the Compound X group with events > 0 in THAT table, including accurate percentages.
If NO SAEs or Adverse Events Leading to Death are present in the table (all recorded values are 0 or table is empty):
Return a summary list containing only the sentence: "No serious adverse events were reported for this table."

{FEW_SHOT_EXAMPLE}

Now, process the following document text containing table(s):

Document Text:
{text}

Provide the extracted information for each table as a list of JSON objects conforming to the schema.
    """

    # Invoke the LLM - LangChain handles the structured output parsing automatically
    try:
        # The result here is not the raw response object, but the parsed Pydantic model instance!
        parsed_data = llm.invoke(input=prompt)
        return parsed_data
    except OutputParserException as e:
        # This exception is raised by LangChain if the LLM fails to return output
        # that conforms to the SaeResultsContainer schema.
        print(f"Warning: LLM failed to return valid structured output.")
        print(f"Error details: {e}")
        return None # Return None if parsing fails


# --- Testing the functions ---

if __name__ == "__main__":
    print("\nTesting extract_sae_result_structured...")
    sae_data_object = extract_sae_result_structured("client1_ae.docx")

    if sae_data_object is not None:
        print("Successfully extracted and parsed SAE data:")
        # Use model_dump() to get the dictionary representation before json.dumps for pretty printing
        print(json.dumps(sae_data_object.model_dump(), indent=4))
        print("\nThis is proper JSON returned by extract_sae_result_structured (as a Pydantic object).")

        # Access and print the parsed data
        if sae_data_object.results:
            print(f"\nAccessing parsed data for each table:")
            for i, result in enumerate(sae_data_object.results):
                print(f"\n--- Table {i+1} ---")
                print(f"Table Number: {result.table_number}")
                print(f"Table Title: {result.table_title}")
                print(f"Summary Sentences:")
                for sentence in result.summary:
                    print(f"- {sentence}")

    else:
        print("Failed to extract and parse SAE data due to invalid LLM output.")