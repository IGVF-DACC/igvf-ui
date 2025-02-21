// components
import { DataCellWithClasses, DataTable } from "../../components/data-table";
import PagePreamble from "../../components/page-preamble";
import { CellLink } from "../../components/static-table";
// lib
import { type DataTableFormat } from "../../lib/data-table";

const staticData: DataTableFormat = [
  {
    id: "1",
    isHeaderRow: true,
    cells: [
      {
        id: "A",
        content: "Primary category (choose from drop down)",
      },
      {
        id: "B",
        content: "Secondary categories",
      },
      {
        id: "C",
        content: "Tool Name / Concept",
      },
      {
        id: "D",
        content: "Output of model (what will it predict?)",
      },
      {
        id: "E",
        content: "Inputs (ideal or existing)",
      },
      {
        id: "F",
        content: "Other validation datasets",
      },
      {
        id: "G",
        content: "Knowledge Graph Node 1 (see here)",
      },
      {
        id: "H",
        content: "Knowledge Graph Node 2 (if applicable, see here)",
      },
      {
        id: "I",
        content: "URL / Citation / availability",
      },
      {
        id: "J",
        content: "PI Contact(s)",
      },
      {
        id: "K",
        content: "Trainee Contact",
      },
      {
        id: "L",
        content: "Notes",
      },
      {
        id: "M",
        content: "Limitations/Challenges",
      },
      {
        id: "N",
        content:
          "Model sharing (If applicable, how will trained models be shared?  e.g., in Kipoi)",
      },
      {
        id: "O",
        content:
          "Interfacing and Coordination (list interactions with FGs, WGs, collaborative projects, dependencies, etc.)",
      },
    ],
  },
  {
    id: "2",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "ChromHMM",
      },
      {
        id: "D",
        content:
          "chromatin state annotations, cell type specific or cross-cell type",
      },
      {
        id: "E",
        content: "ChIP-seq, ATAC/DNase",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "Cell type/state/context",
      },
      {
        id: "I",
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
      {
        id: "J",
        content: "Jason Ernst (jason.ernst@ucla.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: (
          <>
            We have scaled ChromHMM to do large scale universal chromatin state
            annotations (see{" "}
            <CellLink>
              https://genomebiology.biomedcentral.com/articles/10.1186/s13059-021-02572-z
            </CellLink>
            )
          </>
        ),
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "3",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (element)",
        component: TargetGeneCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "ABC",
      },
      {
        id: "D",
        content:
          "% effect of DNase peak on gene expression in a given cell type; and whether a given ATAC/DNase peak is predicted to regulate any gene in a given cell type",
      },
      {
        id: "E",
        content:
          "scATAC (minimal).  Ideally can also use H3k27ac ChIP-seq, Hi-C, good TSS annotations",
      },
      {
        id: "F",
        content: "CRISPR, eQTL, GWAS",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: (
          <CellLink>
            https://github.com/broadinstitute/ABC-Enhancer-Gene-Prediction
          </CellLink>
        ),
      },
      {
        id: "J",
        content: "Jesse Engreitz (engreitz@stanford.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content:
          "Various versions of the pipeline are in development (e.g. for different genome builds, single-cell data, etc.).  We have run this on all ENCODE4 biosamples with DNase data",
      },
      {
        id: "M",
        content:
          "Only predicts effects of elements that act as enhancers; does not work for CTCF sites, silencers, etc.  Need more well-powered enhancer perturbation data across different cell types, and ideally expanding beyond CRISPRI to include genetic deletions",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
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
      {
        id: "B",
        content: "GWAS",
      },
      {
        id: "C",
        content: "PoPS",
      },
      {
        id: "D",
        content: "Causal gene in a GWAS locus",
      },
      {
        id: "E",
        content: "Summary stats, catalog of gene sets",
      },
      {
        id: "F",
        content:
          "For causal genes, there are several sources of positive controls—perhaps the largest sets now available are cases where there are common or rare coding variants in the same locus as a nearby noncoding variant.  Can also use drug targets, metabolite GWAS, Mendelian/common disease intersection, etc. (e.g. see Eric Fauman, Brent Richards, and others)",
      },
      {
        id: "G",
        content: "Gene",
      },
      {
        id: "H",
        content: "Phenotype/Disease",
      },
      {
        id: "I",
        content: "Weeks et al. medRxiv 2021",
      },
      {
        id: "J",
        content: "Hilary Finucane, Jesse Engreitz",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
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
      {
        id: "B",
        content: "GWAS",
      },
      {
        id: "C",
        content: "ABC-Max",
      },
      {
        id: "D",
        content:
          "Causal gene (+variant, cell context) in a GWAS locus; cell types enriched for fine-mapped variants for a trait",
      },
      {
        id: "E",
        content: "scATAC-seq/ATAC-seq/H3K27ac + fine-mapped variants",
      },
      {
        id: "F",
        content:
          "For causal genes, there are several sources of positive controls—perhaps the largest sets now available are cases where there are common or rare coding variants in the same locus as a nearby noncoding variant.  Can also use drug targets, metabolite GWAS, Mendelian/common disease intersection, etc. (e.g. see Eric Fauman, Brent Richards, and others)",
      },
      {
        id: "G",
        content: "Gene",
      },
      {
        id: "H",
        content: "Phenotype/Disease",
      },
      {
        id: "I",
        content: "Nasser et al. Nature 2021",
      },
      {
        id: "J",
        content: "Jesse Engreitz (engreitz@stanford.edu)",
      },
      {
        id: "K",
        content: "Rosa Ma",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "6",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      {
        id: "B",
        content: "TF binding, regulatory element annotation",
      },
      {
        id: "C",
        content: "BPNet",
      },
      {
        id: "D",
        content:
          "Effect of a sequence variant on signal counts/shape in various assays e.g. ChIP-seq",
      },
      {
        id: "E",
        content: "A single epigenomic dataset (e.g. ChIP-seq)",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Regulatory element",
      },
      {
        id: "I",
        content: <CellLink>https://github.com/kundajelab/bpnet</CellLink>,
      },
      {
        id: "J",
        content: "Anshul Kundaje (akundaje@stanford.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "Avsec et al. Nature Genetics 2021",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "7",
    cells: [
      {
        id: "A",
        content: "Gene Regulatory Networks",
        component: GeneRegulatoryCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "DREM",
      },
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
        content: "",
      },
      {
        id: "G",
        content: "TF",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: (
          <>
            <CellLink className="block">
              https://github.com/jernst98/STEM_DREM
            </CellLink>
            <CellLink className="block">http://sb.cs.cmu.edu/drem/</CellLink>
          </>
        ),
      },
      {
        id: "J",
        content: "Jason Ernst (jason.ernst@ucla.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content:
          "This was originally designed in the context of bulk data for one individual. We will be adapting/applying in the context of single cell data across multiple individuals",
      },
      {
        id: "M",
        content: "See notes",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "8",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "ENCODE cCREs",
      },
      {
        id: "D",
        content:
          "Annotated promoter, enhancers, and other regulatory elements across hundreds of cell and tissue types",
      },
      {
        id: "E",
        content: "DNase/ATAC, H3K4me3, H3K27ac, CTCF",
      },
      {
        id: "F",
        content: "CRISPR, STARR-seq/MPRA, Mouse transgenic assays",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "Cell type/state/context",
      },
      {
        id: "I",
        content: <CellLink>https://screen.encodeproject.org</CellLink>,
      },
      {
        id: "J",
        content:
          "Zhiping Weng (zhipingweng@gmail.com) & Jill Moore (Jill.Moore@umassmed.edu)",
      },
      {
        id: "K",
        content: "---",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "9",
    cells: [
      {
        id: "A",
        content: "Gene Regulatory Networks",
        component: GeneRegulatoryCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "cNMF",
      },
      {
        id: "D",
        content:
          "Sets of genes that are cofunctional/coexpressed in a given cell type",
      },
      {
        id: "E",
        content: "single-cell RNA data from tissue or Perturb-seq",
      },
      {
        id: "F",
        content: "Perturb-seq",
      },
      {
        id: "G",
        content: "Gene expression program",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: <CellLink>https://github.com/dylkot/cNMF</CellLink>,
      },
      {
        id: "J",
        content: "Jesse Engreitz (engreitz@stanford.edu)",
      },
      {
        id: "K",
        content: "Helen Kang",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "10",
    cells: [
      {
        id: "A",
        content: "TF binding/motif discovery",
        component: TFBindingCell,
      },
      {
        id: "B",
        content: "Noncoding variant effects",
      },
      {
        id: "C",
        content: "ZMotif",
      },
      {
        id: "D",
        content: "Locations of high confidenceTF motifs",
      },
      {
        id: "E",
        content: "TF ChIP-seq, DNase/ATAC-seq",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "TFBS",
      },
      {
        id: "H",
        content: "Cell type/state/context",
      },
      {
        id: "I",
        content: <CellLink>https://github.com/weng-lab/ZMotif</CellLink>,
      },
      {
        id: "J",
        content: "Zhiping Weng (zhipingweng@gmail.com)",
      },
      {
        id: "K",
        content: "Greg Andrews",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "11",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "CAPRA",
      },
      {
        id: "D",
        content:
          "Calculates per element characterization score for WG-STARR-seq data and allow for studying combinatorial effects",
      },
      {
        id: "E",
        content: "WG-STARR-seq + element list",
      },
      {
        id: "F",
        content: "Orthogonal characterization data",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "Cell type/state/context",
      },
      {
        id: "I",
        content: <CellLink>https://github.com/Moore-Lab-UMass/CAPRA</CellLink>,
      },
      {
        id: "J",
        content: "Jill Moore (Jill.Moore@umassmed.edu)",
      },
      {
        id: "K",
        content: "---",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "12",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      {
        id: "B",
        content: "TF binding",
      },
      {
        id: "C",
        content: "Qbic",
      },
      {
        id: "D",
        content:
          "Calculates binding affinity change of a sequence variant (from reference) for a given TF",
      },
      {
        id: "E",
        content: "file of variants",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "TFBS",
      },
      {
        id: "I",
        content: <CellLink>http://qbic.genome.duke.edu</CellLink>,
      },
      {
        id: "J",
        content:
          "Andrew Allen (asallen@duke.edu) & Raluca Gordan (raluca.gordan@duke.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "13",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content: "Non-/coding variant effects/prioritization",
      },
      {
        id: "C",
        content: "CADD",
      },
      {
        id: "D",
        content: "Deleteriousness of variants",
      },
      {
        id: "E",
        content:
          "File of variants, precomputation of complete hg37/38 available",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: <CellLink>https://cadd.kircherlab.bihealth.org/</CellLink>,
      },
      {
        id: "J",
        content: "Martin Kircher (martin.kircher@bih-charite.de)",
      },
      {
        id: "K",
        content: "Max Schubach",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "14",
    cells: [
      {
        id: "A",
        content: "TF binding/motif discovery",
        component: TFBindingCell,
      },
      {
        id: "B",
        content: "TF footprinting from ATAC data",
      },
      {
        id: "C",
        content: "PRINT",
      },
      {
        id: "D",
        content: "Predicting TF binding (footprints) from ATAC data",
      },
      {
        id: "E",
        content: "ATAC-seq (bulk or sc)",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "TFBS",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "Unpublished",
      },
      {
        id: "J",
        content: "Jason Buenrostro",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "15",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "ReMM",
      },
      {
        id: "D",
        content: "Deleteriousness of variants",
      },
      {
        id: "E",
        content:
          "File of variants, precomputation of complete hg37/38 available",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: <CellLink>https://remm.kircherlab.bihealth.org/</CellLink>,
      },
      {
        id: "J",
        content: "Martin Kircher (martin.kircher@bih-charite.de)",
      },
      {
        id: "K",
        content: "Max Schubach",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "16",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (element)",
        component: TargetGeneCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "SCENT",
      },
      {
        id: "D",
        content: "Enhancer-gene links based on single-cell multimodal data",
      },
      {
        id: "E",
        content: "Single-cell multiome (ATAC+RNA) data",
      },
      {
        id: "F",
        content: "eQTL, GWAS, CRISPR, Hi-C",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: (
          <CellLink>
            https://www.medrxiv.org/content/10.1101/2022.10.27.22281574v1
          </CellLink>
        ),
      },
      {
        id: "J",
        content: "Soumya Raychaudhuri (soumya@broadinstitute.org)",
      },
      {
        id: "K",
        content: "Saori Sakaue (ssakaue@broadinstitute.org)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
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
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "CTMC",
      },
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
        content: "Need positive controls for causal variant-gene associations",
      },
      {
        id: "G",
        content: "Gene",
      },
      {
        id: "H",
        content: "Phenotype/Disease",
      },
      {
        id: "I",
        content: "Unpublished, in early development",
      },
      {
        id: "J",
        content: "Maureen Sartor (sartorma@umich.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "18",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "SURF and TURF",
      },
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
        content: "MPRA, GWAS",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "TFBS",
      },
      {
        id: "I",
        content: <CellLink>https://regulomedb.org/regulome-search/</CellLink>,
      },
      {
        id: "J",
        content: "Alan Boyle (apboyle@umich.edu)",
      },
      {
        id: "K",
        content: "Nanxiang Zhao (Sam) (samzhao@umich.edu)",
      },
      {
        id: "L",
        content: "RegulomeDB backend scoring models",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "19",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (variant)",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "cS2G",
      },
      {
        id: "D",
        content: "Target gene for every variant",
      },
      {
        id: "E",
        content: "Genome-wide SNP-gene predictions",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: (
          <>
            <CellLink>
              https://www.nature.com/articles/s41588-022-01087-y
            </CellLink>{" "}
            and data in{" "}
            <CellLink>https://alkesgroup.broadinstitute.org/cS2G/</CellLink>
          </>
        ),
      },
      {
        id: "J",
        content: "Steven Gazal (gazal@usc.edu)",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "20",
    cells: [
      {
        id: "A",
        content: "Regulatory element annotation",
        component: RegulatoryElementCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "MACS2 peaks",
      },
      {
        id: "D",
        content:
          "Does a variant overlap a DNase or ATAC peak (e.g., extended to a constant distance threshold)",
      },
      {
        id: "E",
        content: "ATAC-seq (bulk or sc), DNase-seq",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "21",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (variant)",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "FastGxC",
      },
      {
        id: "D",
        content:
          "Does a variant affect the expression / accesibility of a gene in a context-dependent way (context-dependent eQTLs / caQTL)",
      },
      {
        id: "E",
        content:
          "RNA-seq or ATAC-seq (bulk or sc) across multiple contexts (e.g., cells, tissues, time points) + genotypes",
      },
      {
        id: "F",
        content: "ATAC-seq in similar contexts",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: <CellLink>https://github.com/BrunildaBalliu/FastGxC</CellLink>,
      },
      {
        id: "J",
        content: "Brunilda Balliu (bballiu@ucla.edu",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "Need population-level data (at least 30 individuals)",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "22",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      {
        id: "B",
        content: "coding variants and \ngene annotations",
      },
      {
        id: "C",
        content: "FAVOR",
      },
      {
        id: "D",
        content: "Functionality of variants",
      },
      {
        id: "E",
        content:
          "9 billion variants, multi-faceted pre-collected\n variant and gene functional annotations",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: <CellLink>https://favor.genohub.org/</CellLink>,
      },
      {
        id: "J",
        content: "Xihong Lin (xlin@hsph.harvard.edu)",
      },
      {
        id: "K",
        content: "Eric Van Buren (evb@hsph.harvard.edu)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "23",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (variant)",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "Enformer",
      },
      {
        id: "D",
        content: "Impact of variant on gene expression or chromatin state",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: "",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "24",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (variant)",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "SEI",
      },
      {
        id: "D",
        content: "",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: "",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "25",
    cells: [
      {
        id: "A",
        content: "Noncoding variant effects/prioritization",
        component: NoncodingVariantCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "DragoNNFruit",
      },
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
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Regulatory element",
      },
      {
        id: "I",
        content: (
          <>
            Still in early development:{" "}
            <CellLink>https://github.com/jmschrei/dragonnfruit</CellLink>
          </>
        ),
      },
      {
        id: "J",
        content: "Anshul Kundaje (akundaje@stanford.edu)",
      },
      {
        id: "K",
        content: "Jacob Schreiber (jmschr@stanford.edu)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
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
          "Impact on functional residues, e.g. protein-protein\ninteraction residues, stability, PTM sites, etc.",
      },
      {
        id: "C",
        content: "MutPred2",
      },
      {
        id: "D",
        content:
          "A general score indicative of pathogenicity \nand a ranked list of impacted mechanisms\n(scores and P-values)",
      },
      {
        id: "E",
        content:
          "Protein sequences in FASTA format\nwith amino acid variants in XnY \nformat",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Protein",
      },
      {
        id: "I",
        content: <CellLink>http://mutpred.mutdb.org/</CellLink>,
      },
      {
        id: "J",
        content: "Predrag Radivojac (predrag@northeastern.edu)",
      },
      {
        id: "K",
        content:
          "Shantanu Jain (sh.jain@northeastern.edu)\nDaniel Zeiberg (zeiberg.d@northeastern.edu)\nYile Chen (yilechen@uw.edu)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
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
          "Impact on functional residues, e.g. protein-protein\ninteraction residues, stability, PTM sites, etc.",
      },
      {
        id: "C",
        content: "MutPred-LOF",
      },
      {
        id: "D",
        content:
          "A general score indicative of pathogenicity \nand a ranked list of impacted mechanisms\n(scores and P-values)",
      },
      {
        id: "E",
        content:
          "Protein sequences in FASTA format\nwith amino acid variants in ANNOVAR \nformat",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Protein",
      },
      {
        id: "I",
        content: <CellLink>http://mutpred2.mutdb.org/mutpredlof/</CellLink>,
      },
      {
        id: "J",
        content: "Predrag Radivojac (predrag@northeastern.edu)",
      },
      {
        id: "K",
        content:
          "Shantanu Jain (sh.jain@northeastern.edu)\nDaniel Zeiberg (zeiberg.d@northeastern.edu)\nYile Chen (yilechen@uw.edu)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "28",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content:
          "Impact on functional residues, e.g. protein-protein\ninteraction residues, stability, PTM sites, etc.",
      },
      {
        id: "C",
        content: "MutPred-Indel",
      },
      {
        id: "D",
        content:
          "A general score indicative of pathogenicity \nand a ranked list of impacted mechanisms\n(scores and P-values)",
      },
      {
        id: "E",
        content:
          "Protein sequences in FASTA format\nwith amino acid variants in ANNOVAR \nformat",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Protein",
      },
      {
        id: "I",
        content: <CellLink>http://mutpred2.mutdb.org/mutpredindel/</CellLink>,
      },
      {
        id: "J",
        content: "Predrag Radivojac (predrag@northeastern.edu)",
      },
      {
        id: "K",
        content:
          "Shantanu Jain (sh.jain@northeastern.edu)\nDaniel Zeiberg (zeiberg.d@northeastern.edu)\nYile Chen (yilechen@uw.edu)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "29",
    cells: [
      {
        id: "A",
        content: "Target gene prediction (element)",
        component: TargetGeneCell,
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "ENCODE-E2G",
      },
      {
        id: "D",
        content:
          "Enhancer-gene reguatory connections predicted from DNase-seq derived features in 352 ENCODE4 biosamples from a logistic regression model trained on K562 CRISPRi enhancer screen data.",
      },
      {
        id: "E",
        content: "DNase-seq, genome annotations/features",
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "Regulatory element",
      },
      {
        id: "H",
        content: "Gene",
      },
      {
        id: "I",
        content: "",
      },
      {
        id: "J",
        content:
          "Christina Leslie (cleslie@cbio.mskcc.org), Jesse Engreitz (engreitz@stanford.edu)",
      },
      {
        id: "K",
        content:
          "Alireza Karbalayghareh (karbalayghareh@gmail.com), Andreas Gschwind (andreas.gschwind@stanford.edu)",
      },
      {
        id: "L",
        content:
          "We have generated E-G predictions from DNase-seq derived features in 352 ENCODE4 biosamples. Model framework is flexible produce version using other available features as well.",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
      },
    ],
  },
  {
    id: "30",
    cells: [
      {
        id: "A",
        content: "Coding variant effects/prioritization",
        component: CodingVariantCell,
      },
      {
        id: "B",
        content:
          "Effects of measured/predicted changes in gene expression on changes in cell morphology",
      },
      {
        id: "C",
        content: "Effect on cell morphology prediction (in development)",
      },
      {
        id: "D",
        content: "Effect on cell morphology (using broad effect categories)",
      },
      {
        id: "E",
        content:
          "Prediction or measurement of variant effect on protein function, abundance, or interactions",
      },
      {
        id: "F",
        content: (
          <>
            JUMP Cell Painting{" "}
            <CellLink>
              https://jump-cellpainting.broadinstitute.org/cell-painting
            </CellLink>{" "}
            and data from the collaborative project &ldquo;Cross-platform, deep
            phenotyping for protein coding variants&rdquo;
          </>
        ),
      },
      {
        id: "G",
        content: "Variant",
      },
      {
        id: "H",
        content: "Protein",
      },
      {
        id: "I",
        content: "Unpublished, early development",
      },
      {
        id: "J",
        content: "Mark Craven (craven@biostat.wisc.edu)",
      },
      {
        id: "K",
        content: "Yuriy Sverchkov (sverchkov@wisc.edu)",
      },
      {
        id: "L",
        content: "",
      },
      {
        id: "M",
        content: "",
      },
      {
        id: "N",
        content: "",
      },
      {
        id: "O",
        content: "",
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
  return (
    <div>
      <PagePreamble />
      <div role="table" className="overflow-x-auto text-sm">
        <DataTable data={staticData} />
      </div>
    </div>
  );
}
