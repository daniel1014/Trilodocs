// Update the mock data to match the backend response format
export const mockDocuments = [
  {
    id: "doc-1",
    name: "clinical-trial-report.docx",
    size: 1245000,
    processedAt: "2025-05-10T14:32:11Z",
    fileId: "f8d72b3a9c",
    results: [
      {
        table_number: "2.1.1",
        table_title: "Summary of Serious Adverse Events by Treatment Group",
        summary: [
          "There were 12 total serious adverse events reported.",
          "33.3% of Placebo participants experienced seizure.",
          "0% of Placebo participants experienced nausea.",
          "66.7% of Placebo participants experienced headache.",
          "33.3% of Compound X participants experienced seizure.",
          "22.2% of Compound X participants experienced nausea.",
          "44.4% of Compound X participants experienced headache.",
        ],
      },
      {
        table_number: "2.1.2",
        table_title: "Summary of Adverse Events Leading to Death",
        summary: ["No serious adverse events were reported for this table."],
      },
    ],
    type: "DOCX",
  },
  {
    id: "doc-2",
    name: "safety-report-q1.docx",
    size: 2356000,
    processedAt: "2025-05-09T09:15:43Z",
    fileId: "a1b2c3d4e5",
    results: [
      {
        table_number: "3.2.1",
        table_title: "Summary of Serious Adverse Events by System Organ Class",
        summary: [
          "There were 8 total serious adverse events reported.",
          "25% of events were in the Nervous System category.",
          "37.5% of events were in the Gastrointestinal category.",
          "37.5% of events were in the Cardiovascular category.",
        ],
      },
    ],
    type: "DOCX",
  },
  {
    id: "doc-3",
    name: "clinical-study-phase2.pdf",
    size: 1876000,
    processedAt: "2025-05-08T16:45:22Z",
    fileId: "5e4d3c2b1a",
    results: [
      {
        table_number: "4.1.1",
        table_title: "Summary of Adverse Events by Severity",
        summary: [
          "There were 24 total adverse events reported.",
          "12.5% of events were classified as Mild.",
          "45.8% of events were classified as Moderate.",
          "41.7% of events were classified as Severe.",
        ],
      },
      {
        table_number: "4.1.2",
        table_title: "Summary of Adverse Events Leading to Discontinuation",
        summary: [
          "There were 5 adverse events leading to discontinuation.",
          "60% of discontinuations were due to Severe Headache.",
          "20% of discontinuations were due to Allergic Reaction.",
          "20% of discontinuations were due to Liver Enzyme Elevation.",
        ],
      },
    ],
    type: "PDF",
  },
]
