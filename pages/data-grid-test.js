// components
import { DataGrid, DefaultDataGridContainer } from "../components/data-grid"
import { SortableGrid } from "../components/sortable-grid"

// Vertical span columns
const rawSeqReps = [
  {
    id: "header",
    cells: [
      { id: "attribution", content: "Attribution", columns: 2 },
      { id: "data", content: "Data", columns: 9 },
    ],
  },
  {
    id: "ENCLB025MTA",
    cells: [
      { id: "replicate", content: "1" },
      { id: "library", content: "ENCLB025MTA" },
    ],
    children: [
      {
        id: "ENCFF935LZB",
        cells: [
          {
            id: "file",
            content: <a href="#">ENCFF935LZB</a>,
          },
          {
            id: "file_type",
            content: "fastq",
          },
          { id: "pair", content: "PE151nt" },
          { id: "replicate", content: "1" },
          { id: "output_type", content: "reads" },
          {
            id: "lab",
            content: "Mats Ljungman, UMichigan",
          },
          { id: "date_created", content: "2020-09-30" },
          { id: "file_size", content: "5.45 GB" },
          {
            id: "status",
            content: <div className="font-bold">released</div>,
          },
        ],
      },
      {
        id: "ENCFF740ARM",
        cells: [
          {
            id: "file",
            content: <a href="#">ENCFF740ARM</a>,
          },
          { id: "file_type", content: "fastq" },
          { id: "pair", content: "PE151nt" },
          { id: "replicate", content: "2" },
          { id: "output_type", content: "reads" },
          {
            id: "lab",
            content: "Mats Ljungman, UMichigan",
          },
          { id: "date_created", content: "2020-09-30" },
          { id: "file_size", content: "5.66 GB" },
          { id: "status", content: "released" },
        ],
      },
    ],
  },
  {
    id: "ENCLB374BFP",
    cells: [
      { id: "replicate", content: "2" },
      { id: "library", content: "ENCLB374BFP" },
    ],
    children: [
      {
        id: "ENCLB603PXR",
        cells: [
          {
            id: "file",
            content: <a href="#">ENCFF323HQR</a>,
          },
          {
            id: "file_type",
            content: "fastq",
          },
          { id: "pair", content: "PE151nt" },
          { id: "replicate", content: "1" },
          { id: "output_type", content: "reads" },
          {
            id: "lab",
            content: "Mats Ljungman, UMichigan",
          },
          { id: "date_created", content: "2020-09-30" },
          { id: "file_size", content: "4.39 GB" },
          { id: "status", content: "released" },
        ],
      },
      {
        id: "ENCFF085SJR",
        cells: [
          {
            id: "file",
            content: <a href="#">ENCFF085SJR</a>,
          },
          { id: "file_type", content: "fastq" },
          { id: "pair", content: "PE151nt" },
          { id: "replicate", content: "2" },
          { id: "output_type", content: "reads" },
          {
            id: "lab",
            content: "Mats Ljungman, UMichigan",
          },
          { id: "date_created", content: "2020-09-30" },
          { id: "file_size", content: "4.6 GB" },
          { id: "status", content: "released" },
        ],
      },
    ],
  },
]

const AssayHeaderCells = ({ children }) => {
  return (
    <div className="flex h-full w-full items-center justify-center bg-yellow-300 p-2">
      {children}
    </div>
  )
}

// Horizontal spans.
const assays = [
  {
    id: "titles",
    cells: [
      { id: "shRNA RNA-seq", content: "shRNA RNA-seq", columns: 2 },
      { id: "CRISPR RNA-seq", content: "CRISPR RNA-seq", columns: 2 },
      { id: "eCLIP", content: "eCLIP", columns: 2 },
    ],
    RowComponent: AssayHeaderCells,
  },
  {
    id: "assays",
    cells: [
      { id: "shRNA RNA-seq-1", content: "1" },
      { id: "shRNA RNA-seq-2", content: "2" },
      { id: "shRNA RNA-seq-3", content: "3" },
      { id: "shRNA RNA-seq-4", content: "4" },
      { id: "shRNA RNA-seq-5", content: "5" },
      { id: "shRNA RNA-seq-6", content: "6" },
    ],
  },
]

export const files = [
  {
    accession: "ENCFF885CKX",
    assay_term_name: "microRNA-seq",
    assay_title: "microRNA-seq",
    assembly: "GRCh38",
    award: "U24HG009397",
    biological_replicates: [2],
    biosample_ontology: "/biosample-types/cell_line_EFO_0006711/",
    dataset: "/experiments/ENCSR596ZXX/",
    donors: ["/human-donors/ENCDO351AAA/"],
    file_format: "bigWig",
    file_size: 11903004,
    file_type: "bigWig",
    genome_annotation: "V29",
    href: "/files/ENCFF885CKX/@@download/ENCFF885CKX.bigWig",
    output_type: "minus strand signal of unique reads",
    lab: "/labs/encode-processing-pipeline/",
    processed: true,
    simple_biosample_summary: "",
    status: "released",
    technical_replicates: ["2_1"],
    title: "ENCFF885CKX",
    uuid: "ae1d29e0-e106-423d-9d24-5735be7a710a",
  },
  {
    accession: "ENCFF162DBL",
    assay_term_name: "ChIA-PET",
    assay_title: "ChIA-PET",
    award: "/awards/3UM1HG009409-04S1/",
    biological_replicates: [2],
    biosample_ontology: "/biosample-types/cell_line_EFO_0002824/",
    dataset: "/experiments/ENCSR388DDH/",
    donors: ["/human-donors/ENCDO000ABE/"],
    file_format: "fastq",
    file_size: 35594067382,
    file_type: "fastq",
    href: "/files/ENCFF162DBL/@@download/ENCFF162DBL.fastq.gz",
    lab: "/labs/charles-lee/",
    output_category: "raw data",
    output_type: "reads",
    paired_end: "2",
    paired_with: "/files/ENCFF064PRS/",
    processed: false,
    read_count: 476464527,
    read_length: 150,
    read_length_units: "nt",
    run_type: "paired-ended",
    simple_biosample_summary:
      "treated with 1 \u03bcM 5-Phenyl-1H-indole-3-acetic acid for 6 hours genetically modified (insertion) using CRISPR inserting O. sativa LOC4335696, genetically modified (insertion) using CRISPR targeting H. sapiens CDK7",
    status: "released",
    technical_replicates: ["2_1"],
    title: "ENCFF162DBL",
    uuid: "8be45e7b-b2a4-4976-a290-48d08df07c96",
  },
]

const fileCols = [
  {
    id: "accession",
    title: "Accession",
  },
  {
    id: "dataset",
    title: "Dataset",
  },
  {
    id: "file_format",
    title: "File format",
  },
  {
    id: "output_type",
    title: "Output type",
  },
  {
    id: "assembly",
    title: "Mapping assembly",
  },
  {
    id: "status",
    title: "File status",
  },
]

const ExampleGrid = () => {
  return (
    <>
      <DefaultDataGridContainer>
        <DataGrid data={rawSeqReps} />
      </DefaultDataGridContainer>
      <DefaultDataGridContainer>
        <DataGrid data={assays} />
      </DefaultDataGridContainer>
      <DefaultDataGridContainer className="border-red-600 bg-red-600">
        <SortableGrid data={files} columns={fileCols} keyProp="uuid" />
      </DefaultDataGridContainer>
    </>
  )
}

export default ExampleGrid
