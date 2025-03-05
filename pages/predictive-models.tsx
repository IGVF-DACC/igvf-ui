// node_modules
import _ from "lodash";
import Link from "next/link";
// components
import { DataCellWithClasses, DataTable } from "../components/data-table";
import PagePreamble from "../components/page-preamble";
import { CellLink } from "../components/static-table";
// lib
import { type DataTableFormat } from "../lib/data-table";

const staticData: DataTableFormat = [
  {
    id: "0",
    isHeaderRow: true,
    cells: [
      { id: "A", content: "Primary category" },
      { id: "B", content: "Secondary categories" },
      { id: "C", content: "Name" },
      { id: "D", content: "Prediction Output" },
      { id: "E", content: "Prediction Input" },
      { id: "F", content: "URL" },
      { id: "G", content: "Labs" },
    ],
  },
  {
    id: "1",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "ChromHMM" },
      {
        id: "D",
        content:
          "Chromatin state annotations, cell type specific or cross-cell type",
      },
      { id: "E", content: "ChIP-seq, ATAC/DNase" },
      {
        id: "F",
        content: (
          <>
            <CellLink className="block">
              https://ernstlab.biolchem.ucla.edu/ChromHMM/
            </CellLink>
            <CellLink className="block">
              https://www.nature.com/articles/nmeth.1906
            </CellLink>
          </>
        ),
      },
      { id: "G", content: "Jason Ernst, UCLA" },
    ],
  },
  {
    id: "2",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (element)",
        component: TargetGeneCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "ABC" },
      {
        id: "D",
        content:
          "Percent effect of DNase peak on gene expression in a given cell type; and whether a given ATAC/DNase peak is predicted to regulate any gene in a given cell type",
      },
      {
        id: "E",
        content:
          "scATAC (minimal).  Ideally can also use H3k27ac ChIP-seq, Hi-C, good TSS annotations",
      },
      {
        id: "F",
        content: (
          <CellLink>
            https://github.com/broadinstitute/ABC-Enhancer-Gene-Prediction
          </CellLink>
        ),
      },
      { id: "G", content: "Jesse Engreitz, Stanford" },
    ],
  },
  {
    id: "3",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "GWAS" },
      { id: "C", content: "PoPS" },
      { id: "D", content: "Causal gene in a GWAS locus" },
      { id: "E", content: "Summary stats, catalog of gene sets" },
      {
        id: "F",
        content: (
          <CellLink>
            https://pmc.ncbi.nlm.nih.gov/articles/PMC10836580/
          </CellLink>
        ),
      },
      { id: "G", content: "Hilary Finucane, Broad & Jesse Engreitz, Stanford" },
    ],
  },
  {
    id: "4",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "GWAS" },
      { id: "C", content: "ABC-Max" },
      {
        id: "D",
        content:
          "Causal gene ( with variant and cell context) in a GWAS locus; cell types enriched for fine-mapped variants for a trait",
      },
      {
        id: "E",
        content: "scATAC-seq/ATAC-seq/H3K27ac + fine-mapped variants",
      },
      {
        id: "F",
        content: <CellLink>https://pubmed.ncbi.nlm.nih.gov/33828297/</CellLink>,
      },
      { id: "G", content: "Jesse Engreitz, Stanford" },
    ],
  },
  {
    id: "5",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "TF binding, regulatory element annotation" },
      { id: "C", content: "BPNet" },
      {
        id: "D",
        content:
          "Effect of a sequence variant on signal counts/shape in various assays e.g. ChIP-seq",
      },
      { id: "E", content: "A single epigenomic dataset (e.g. ChIP-seq)" },
      {
        id: "F",
        content: <CellLink>https://github.com/kundajelab/bpnet</CellLink>,
      },
      { id: "G", content: "Anshul Kundaje, Stanford" },
    ],
  },
  {
    id: "6",
    cells: [
      {
        id: "A",
        content: "Gene Regulatory Networks",
        component: GeneRegulatoryCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "DREM" },
      {
        id: "D",
        content:
          "Dynamic regultory map of gene expression bifurcations and TFs associated with them",
      },
      {
        id: "E",
        content:
          "Time series gene expression and (static) TF-gene associations",
      },
      {
        id: "F",
        content: (
          <>
            <CellLink className="block">
              https://github.com/jernst98/STEM_DREM
            </CellLink>
            <CellLink className="block">http://sb.cs.cmu.edu/drem/</CellLink>
          </>
        ),
      },
      { id: "G", content: "Jason Ernst, UCLA" },
    ],
  },
  {
    id: "7",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "ENCODE cCREs" },
      {
        id: "D",
        content:
          "Annotated promoter, enhancers, and other regulatory elements across hundreds of cell and tissue types",
      },
      { id: "E", content: "DNase/ATAC, H3K4me3, H3K27ac, CTCF" },
      {
        id: "F",
        content: (
          <CellLink href="https://screen.encodeproject.org">
            screen.encodeproject.org
          </CellLink>
        ),
      },
      {
        id: "G",
        content: "Zhiping Weng, UMass & Jill Moore, UMass",
      },
    ],
  },
  {
    id: "8",
    cells: [
      {
        id: "A",
        content: "Gene Regulatory Networks",
        component: GeneRegulatoryCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "cNMF" },
      {
        id: "D",
        content:
          "Sets of genes that are cofunctional/coexpressed in a given cell type",
      },
      { id: "E", content: "single-cell RNA data from tissue or Perturb-seq" },
      { id: "F", content: <CellLink>https://github.com/dylkot/cNMF</CellLink> },
      { id: "G", content: "Jesse Engreitz, Stanford" },
    ],
  },
  {
    id: "9",
    cells: [
      {
        id: "A",
        content: "TF binding/motif discovery",
        component: TFBindingCell,
      },
      { id: "B", content: "Noncoding variant effects" },
      { id: "C", content: "ZMotif" },
      { id: "D", content: "Locations of high confidenceTF motifs" },
      { id: "E", content: "TF ChIP-seq, DNase/ATAC-seq" },
      {
        id: "F",
        content: <CellLink>https://github.com/weng-lab/ZMotif</CellLink>,
      },
      { id: "G", content: "Zhiping Weng, UMass" },
    ],
  },
  {
    id: "10",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "CAPRA" },
      {
        id: "D",
        content:
          "Calculates per element characterization score for WG-STARR-seq data and allow for studying combinatorial effects",
      },
      { id: "E", content: "WG-STARR-seq + element list" },
      {
        id: "F",
        content: <CellLink>https://github.com/Moore-Lab-UMass/CAPRA</CellLink>,
      },
      { id: "G", content: "Jill Moore, UMass" },
    ],
  },
  {
    id: "11",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "TF binding" },
      { id: "C", content: "Qbic" },
      {
        id: "D",
        content:
          "Calculates binding affinity change of a sequence variant (from reference) for a given TF",
      },
      { id: "E", content: "file of variants" },
      { id: "F", content: <CellLink>http://qbic.genome.duke.edu</CellLink> },
      {
        id: "G",
        content: "Andrew Allen, Duke & Raluca Gordan, Duke",
      },
    ],
  },
  {
    id: "12",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content: "Non-coding and coding variant effects/prioritization",
      },
      { id: "C", content: "CADD" },
      { id: "D", content: "Deleteriousness of variants" },
      {
        id: "E",
        content:
          "File of variants, precomputation of complete hg37/38 available",
      },
      {
        id: "F",
        content: <CellLink>https://cadd.kircherlab.bihealth.org/</CellLink>,
      },
      { id: "G", content: "Martin Kircher, BIH" },
    ],
  },
  {
    id: "13",
    cells: [
      {
        id: "A",
        content: "TF binding/motif discovery",
        component: TFBindingCell,
      },
      { id: "B", content: "TF footprinting from ATAC data" },
      { id: "C", content: "PRINT" },
      { id: "D", content: "Predicting TF binding (footprints) from ATAC data" },
      { id: "E", content: "ATAC-seq (bulk or sc)" },
      {
        id: "F",
        content: <CellLink>https://github.com/buenrostrolab/PRINT</CellLink>,
      },
      { id: "G", content: "Jason Buenrostro, Broad" },
    ],
  },
  {
    id: "14",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "ReMM" },
      { id: "D", content: "Deleteriousness of variants" },
      {
        id: "E",
        content:
          "File of variants, precomputation of complete hg37/38 available",
      },
      {
        id: "F",
        content: <CellLink>https://remm.kircherlab.bihealth.org/</CellLink>,
      },
      { id: "G", content: "Martin Kircher, BIH" },
    ],
  },
  {
    id: "15",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (element)",
        component: TargetGeneCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "SCENT" },
      {
        id: "D",
        content: "Enhancer-gene links based on single-cell multimodal data",
      },
      { id: "E", content: "Single-cell multiome (ATAC+RNA) data" },
      {
        id: "F",
        content: (
          <CellLink>
            https://www.medrxiv.org/content/10.1101/2022.10.27.22281574v1
          </CellLink>
        ),
      },
      {
        id: "G",
        content: "Soumya Raychaudhuri, Brigham and Women’s Hospital",
      },
    ],
  },
  {
    id: "16",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "CTMC" },
      {
        id: "D",
        content:
          "disease-specific (and optionally cell type-specific) variant-gene pairs",
      },
      {
        id: "E",
        content:
          "eQTL, GWAS, known variant-gene links, ATAC-seq, variant-TFBSs, GO and expression-based gene-gene similarities",
      },
      {
        id: "F",
        content: (
          <CellLink>
            https://academic.oup.com/bib/article/22/2/2161/5809565
          </CellLink>
        ),
      },
      { id: "G", content: "Maureen Sartor, UMich" },
    ],
  },
  {
    id: "17",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "SURF and TURF" },
      {
        id: "D",
        content: "Variant effect on TF binding in cell specific manner",
      },
      {
        id: "E",
        content:
          "DNase-seq, TF & Histone ChIP-seq, Footprints, PWMs through RegulomeDB",
      },
      {
        id: "F",
        content: <CellLink>https://regulomedb.org/regulome-search/</CellLink>,
      },
      { id: "G", content: "Alan Boyle, UMich" },
    ],
  },
  {
    id: "18",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (variant)",
        component: TargetPredictionCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "cS2G" },
      { id: "D", content: "Target gene for every variant" },
      { id: "E", content: "Genome-wide SNP-gene predictions" },
      {
        id: "F",
        content: (
          <>
            <CellLink className="block">
              https://www.nature.com/articles/s41588-022-01087-y
            </CellLink>{" "}
            and data in{" "}
            <CellLink className="block">
              https://alkesgroup.broadinstitute.org/cS2G/
            </CellLink>
          </>
        ),
      },
      { id: "G", content: "Steven Gazal, USC" },
    ],
  },
  {
    id: "19",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "MACS2" },
      {
        id: "D",
        content:
          "Does a variant overlap a DNase or ATAC peak (e.g., extended to a constant distance threshold)",
      },
      { id: "E", content: "ATAC-seq (bulk or sc), DNase-seq" },
      {
        id: "F",
        content: <CellLink>https://github.com/macs3-project/MACS</CellLink>,
      },
      { id: "G", content: "" },
    ],
  },
  {
    id: "21",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "coding variants and \r\ngene annotations" },
      { id: "C", content: "FAVOR" },
      { id: "D", content: "Functionality of variants" },
      {
        id: "E",
        content:
          "9 billion variants, multi-faceted pre-collected\r\n variant and gene functional annotations",
      },
      { id: "F", content: <CellLink>https://favor.genohub.org/</CellLink> },
      { id: "G", content: "Xihong Lin, HSPH" },
    ],
  },
  {
    id: "24",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "DragoNNFruit" },
      {
        id: "D",
        content:
          "Effect of a sequence variant on signal counts/shape in various single-cell and multimodal assays e.g. scATAC-seq",
      },
      {
        id: "E",
        content:
          "Nucleotide sequence and cell representations from a single-cell/multiome experiment",
      },
      {
        id: "F",
        content: <CellLink>https://github.com/jmschrei/dragonnfruit</CellLink>,
      },
      { id: "G", content: "Anshul Kundaje, Stanford" },
    ],
  },
  {
    id: "25",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content:
          "Impact on functional residues, e.g. protein-protein\r\ninteraction residues, stability, PTM sites, etc.",
      },
      { id: "C", content: "MutPred2" },
      {
        id: "D",
        content:
          "A general score indicative of pathogenicity \r\nand a ranked list of impacted mechanisms\r\n(scores and P-values)",
      },
      {
        id: "E",
        content:
          "Protein sequences in FASTA format\r\nwith amino acid variants in XnY \r\nformat",
      },
      { id: "F", content: <CellLink>http://mutpred.mutdb.org/</CellLink> },
      { id: "G", content: "Predrag Radivojac, Northeastern" },
    ],
  },
  {
    id: "26",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content:
          "Impact on functional residues, e.g. protein-protein\r\ninteraction residues, stability, PTM sites, etc.",
      },
      { id: "C", content: "MutPred-LOF" },
      {
        id: "D",
        content:
          "A general score indicative of pathogenicity \r\nand a ranked list of impacted mechanisms\r\n(scores and P-values)",
      },
      {
        id: "E",
        content:
          "Protein sequences in FASTA format\r\nwith amino acid variants in ANNOVAR \r\nformat",
      },
      {
        id: "F",
        content: <CellLink>http://mutpred2.mutdb.org/mutpredlof/</CellLink>,
      },
      { id: "G", content: "Predrag Radivojac, Northeastern" },
    ],
  },
  {
    id: "27",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content:
          "Impact on functional residues, e.g. protein-protein\r\ninteraction residues, stability, PTM sites, etc.",
      },
      { id: "C", content: "MutPred-Indel" },
      {
        id: "D",
        content:
          "A general score indicative of pathogenicity \r\nand a ranked list of impacted mechanisms\r\n(scores and P-values)",
      },
      {
        id: "E",
        content:
          "Protein sequences in FASTA format\r\nwith amino acid variants in ANNOVAR \r\nformat",
      },
      {
        id: "F",
        content: <CellLink>http://mutpred2.mutdb.org/mutpredindel/</CellLink>,
      },
      { id: "G", content: "Predrag Radivojac, Northeastern" },
    ],
  },
  {
    id: "28",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (element)",
        component: TargetGeneCell,
      },
      { id: "B", content: "" },
      { id: "C", content: "ENCODE-E2G" },
      {
        id: "D",
        content:
          "Enhancer-gene regulatory connections predicted from DNase-seq derived features in 352 ENCODE4 biosamples from a logistic regression model trained on K562 CRISPRi enhancer screen data.",
      },
      { id: "E", content: "DNase-seq, genome annotations/features" },
      {
        id: "F",
        content: (
          <CellLink>https://github.com/karbalayghareh/ENCODE-E2G</CellLink>
        ),
      },
      {
        id: "G",
        content: "Christina Leslie, MSKCC & Jesse Engreitz, Stanford",
      },
    ],
  },
];

function RegulatoryElementCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#de9d9b] dark:bg-[#825c5b]">
      {children}
    </DataCellWithClasses>
  );
}

function TargetGeneCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#f1cda2] dark:bg-[#826f57]">
      {children}
    </DataCellWithClasses>
  );
}

function TargetPredictionCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#67e8f9] dark:bg-[#155e75]">
      {children}
    </DataCellWithClasses>
  );
}

function NoncodingVariantCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#fbe6a2] dark:bg-[#91855e]">
      {children}
    </DataCellWithClasses>
  );
}

function GeneRegulatoryCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#bcd6ac] dark:bg-[#697860]">
      {children}
    </DataCellWithClasses>
  );
}

function TFBindingCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#a9c1f0] dark:bg-[#70809f]">
      {children}
    </DataCellWithClasses>
  );
}

function CodingVariantCell({ children }: { children: React.ReactNode }) {
  return (
    <DataCellWithClasses className="bg-[#b2a7d2] dark:bg-[#78708d]">
      {children}
    </DataCellWithClasses>
  );
}

export default function GenesLoci() {
  const sortedStaticData = _.sortBy(staticData, (row) => row.cells[0].content);

  return (
    <div>
      <PagePreamble pageTitle="Predictive Models" />
      <div role="table" className="overflow-x-auto text-sm">
        <DataTable data={sortedStaticData} />
      </div>
      <div>
        To see more Models, review our{" "}
        <Link href="/search/?type=ModelSet&status!=deleted">
          Model Set collection
        </Link>
      </div>
    </div>
  );
}
