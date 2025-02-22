// components
import { DataCellWithClasses, DataTable } from "../components/data-table";
import PagePreamble from "../components/page-preamble";
import { CellLink } from "../components/static-table";

const dataGrid = [
  {
    id: "0",
    isHeaderRow: true,
    cells: [
      {
        id: "A",
        content: "Category",
      },
      {
        id: "B",
        content: "Tool Type",
      },
      {
        id: "C",
        content: "Tool",
      },
      {
        id: "D",
        content: "Purpose",
      },
      {
        id: "E",
        content: "References",
      },
    ],
  },
  {
    id: "1",
    cells: [
      {
        id: "A",
        content: "CRISPR Screens",
        component: CrisprScreenCell,
      },
      {
        id: "B",
        content: "design",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/broadinstitute/CRISPRiTilingDesign">
            CRISPRi Tiling Design
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Design gRNA pools for CRISPRi tiling screens (including selecting elements/promoters, scoring and selecting gRNAs, adding ctrl gRNAs)",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "2",
    cells: [
      {
        id: "A",
        content: "",
        component: CrisprScreenCell,
      },
      {
        id: "B",
        content: "design",
      },
      {
        id: "C",
        content: (
          <CellLink href="http://bioconductor.org/packages/release/bioc/html/TAPseq.html">
            TAPseq (R package)
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Design TAP-seq primers for a set of target genes for targeted scRNA-seq",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "3",
    cells: [
      {
        id: "A",
        content: "",
        component: CrisprScreenCell,
      },
      {
        id: "B",
        content: "design",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/pinellolab/CRISPR-SURF">
            CRISPR-SURF
          </CellLink>
        ),
      },
      {
        id: "D",
        content: "Design and analyses of tiling screens",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://www.nature.com/articles/s41592-018-0225-6">
            30504875
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "4",
    cells: [
      {
        id: "A",
        content: "",
        component: CrisprScreenCell,
      },
      {
        id: "B",
        content: "design",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://crispresso.pinellolab.partners.org/submission">
            CRISPResso2
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Quantification of genome editing from targeted or WGS sequencing data",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://www.nature.com/articles/s41587-019-0032-3">
            30809026
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "5",
    cells: [
      {
        id: "A",
        content: "",
        component: CrisprScreenCell,
      },
      {
        id: "B",
        content: "processing",
      },
      {
        id: "C",
        content: (
          <CellLink href="http://crisprme.di.univr.it/">CRISPRme</CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Enumeration of potential off-target sites taking into account genetic variant",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "6",
    cells: [
      {
        id: "A",
        content: "",
        component: CrisprScreenCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/argschwind/CRISPRiScreen">
            CRISPRiScreen
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Map enhancer-gene connections from TAP-seq/Perturb-seq experiments differential expression testing",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "7",
    cells: [
      {
        id: "A",
        content: "Reporter Assays (MPRA/ STARR-seq)",
        component: ReporterAssaysCell,
      },
      {
        id: "B",
        content: "processing",
      },
      {
        id: "C",
        content: (
          <>
            <CellLink
              href="https://github.com/shendurelab/MPRAflow"
              className="block"
            >
              MPRAflow
            </CellLink>
            <CellLink
              href="https://github.com/kircherlab/MPRAsnakeflow"
              className="block"
            >
              MPRAsnakeflow
            </CellLink>
          </>
        ),
      },
      {
        id: "D",
        content:
          "Process, manipulate, filter MPRA data (assignment+counts) to create count tables and statistics",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://www.nature.com/articles/s41596-020-0333-5">
            32641802
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "8",
    cells: [
      {
        id: "A",
        content: "",
        component: ReporterAssaysCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/YosefLab/MPRAnalyze">
            MPRAanalyze
          </CellLink>
        ),
      },
      {
        id: "D",
        content: "Analysis framework designed for data generated from MPRA",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "9",
    cells: [
      {
        id: "A",
        content: "",
        component: ReporterAssaysCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://ernstlab.biolchem.ucla.edu/SHARPR/">
            SHARPR
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Systematic High-resolution Activation and Repression Profiling with Reporter-tiling (SHARPR). High resolution inference of activing and repressive bases from MPRA tiling designs",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://pubmed.ncbi.nlm.nih.gov/27701403/">
            27701403
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "10",
    cells: [
      {
        id: "A",
        content: "",
        component: ReporterAssaysCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="http://www.geneprediction.org/bird/">BIRD</CellLink>
        ),
      },
      {
        id: "D",
        content: "Estimate variant effects from STARR-seq/MPRA data",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://pubmed.ncbi.nlm.nih.gov/27701403/">
            31368479
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "11",
    cells: [
      {
        id: "A",
        content: "",
        component: ReporterAssaysCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/hansenlab/mpra">
            mpra (Bioconductor)
          </CellLink>
        ),
      },
      {
        id: "D",
        content: "Differential analysis and visualization",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "12",
    cells: [
      {
        id: "A",
        content: "Single Cell Multiome (RNA-seq / ATAC-seq)",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://kzhang.org/SnapATAC2/">snapATAC2</CellLink>
        ),
      },
      {
        id: "D",
        content: "scATAC analysis + clustering",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "13",
    cells: [
      {
        id: "A",
        content: "",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://simba-bio.readthedocs.io/en/latest/">
            SIMBA
          </CellLink>
        ),
      },
      {
        id: "D",
        content: "MultiOme integration",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "14",
    cells: [
      {
        id: "A",
        content: "",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: "CellSpace",
      },
      {
        id: "D",
        content: "scATAC batch integration + analysis",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "15",
    cells: [
      {
        id: "A",
        content: "",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://www.archrproject.com/bookdown/index.html">
            ArchR
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Robust and scaleable analysis of single-cell chromatin accessibility data",
      },
      {
        id: "E",
        content: "",
      },
    ],
  },
  {
    id: "16",
    cells: [
      {
        id: "A",
        content: "",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/BrunildaBalliu/FastGxC">
            FastGxC
          </CellLink>
        ),
      },
      {
        id: "D",
        content:
          "Fast and powerful cell-type specific xQTL mapping from single-cell RNA-Seq, ATAC-Seq etc data",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://www.biorxiv.org/content/10.1101/2021.06.17.448889v1">
            BioRXiv
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "17",
    cells: [
      {
        id: "A",
        content: "",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <CellLink href="https://github.com/cozygene/CONTENT">
            CONTENT
          </CellLink>
        ),
      },
      {
        id: "D",
        content: "Fast and powerful TWAS in single-cell RNA-Seq experiments",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://pubmed.ncbi.nlm.nih.gov/36171194/">
            36171194
          </CellLink>
        ),
      },
    ],
  },
  {
    id: "18",
    cells: [
      {
        id: "A",
        content: "",
        component: SingleCellMultiomeCell,
      },
      {
        id: "B",
        content: "analysis",
      },
      {
        id: "C",
        content: (
          <>
            <CellLink href="https://github.com/karthikj89/scgenetics">
              sclinker
            </CellLink>{" "}
            / <CellLink href="https://github.com/kkdey/GSSG">GSSG</CellLink>
          </>
        ),
      },
      {
        id: "D",
        content:
          "GWAS analysis identifying tissue-level processes and cell types and cellular process for complex diseases and traits",
      },
      {
        id: "E",
        content: (
          <CellLink href="https://pubmed.ncbi.nlm.nih.gov/34845454/">
            34845454
          </CellLink>
        ),
      },
    ],
  },
];

function CrisprScreenCell({ children }) {
  return (
    <DataCellWithClasses className="bg-[#edcdcd] dark:bg-[#442a2a]">
      {children}
    </DataCellWithClasses>
  );
}

function ReporterAssaysCell({ children }) {
  return (
    <DataCellWithClasses className="bg-[#f8e6d0] dark:bg-[#4e4538]">
      {children}
    </DataCellWithClasses>
  );
}

function SingleCellMultiomeCell({ children }) {
  return (
    <DataCellWithClasses className="bg-[#dce9d5] dark:bg-[#333d2e]">
      {children}
    </DataCellWithClasses>
  );
}

export default function ComputationalTools() {
  return (
    <div>
      <PagePreamble pageTitle="Computational Tools" />
      <div role="table" className="overflow-x-auto text-sm">
        <DataTable data={dataGrid} />
      </div>
    </div>
  );
}
