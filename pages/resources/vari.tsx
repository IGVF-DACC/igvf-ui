// components
import { DataCellWithClasses, DataTable } from "../../components/data-table";
import PagePreamble from "../../components/page-preamble";
import { CellLink } from "../../components/static-table";
// lib
import { type DataTableFormat } from "../../lib/data-table";

const dataGrid: DataTableFormat = [
  {
    id: "2",
    isHeaderRow: true,
    cells: [
      {
        id: "A",
        content: "Variant Set",
      },
      {
        id: "B",
        content:
          "Category (e.g., negative controls, positive controls, biological question, resource)",
      },
      {
        id: "C",
        content: "Biological Systems/Cell types/Assays",
      },
      {
        id: "D",
        content:
          "Purpose and Criteria for Selection (Explain to others why they might want to use this set of variants).  Also include a link to a more detailed writeup for variant interpretation [Example]",
      },
      {
        id: "E",
        content: "Link (Google Drive or Synapse)",
      },
      {
        id: "F",
        content: "Center / Lab",
      },
      {
        id: "G",
        content: "Contact",
      },
      {
        id: "H",
        content: "Citations",
      },
      {
        id: "I",
        content: "Comments",
      },
      {
        id: "J",
        content: "Add your name here if you use this list in a new experiment",
      },
      {
        id: "K",
        content: "Added to Y2AVE Synapse Table? (JME 230807)",
      },
      {
        id: "L",
        content: "Notes",
      },
    ],
  },
  {
    id: "3",
    cells: [
      {
        id: "A",
        content: "Stanford FCC TBD",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Cardiovascular disease",
      },
      {
        id: "D",
        content:
          "Variants in enhancers in cardiovascular disease GWAS loci (coronary artery disease, congenital heart disease, pulmonary hypertension, etc.) that act in smooth muscle cells, endothelial cells, cardiomyocytes, or macrophages.  Our variant-editing assays are focused on deep editing / mutagenesis of a small set of enhancers that contain high-confidence GWAS variants.  An initial short list of variants/genes we are considering for these assays in endothelial cells are listed to the right",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52262057</CellLink>
        ),
      },
      {
        id: "F",
        content: "Stanford FCC",
      },
      {
        id: "G",
        content: "engreitz@stanford.edu tomq1@stanford.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "should be subset of the full list of CAD variants",
      },
    ],
  },
  {
    id: "4",
    cells: [
      {
        id: "A",
        content: "Idea",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Development",
      },
      {
        id: "D",
        content:
          "Pick highly active germ layer specific elements (e.g. neuroectoderm, cardiac mesoderm, etc.). Pick variants (not necessarily standing variants) predicted to have large effects within these.",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "UW/UCSF/Lubeck",
      },
      {
        id: "G",
        content: "",
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
        content: "No",
      },
      {
        id: "L",
        content: "no list provided",
      },
    ],
  },
  {
    id: "5",
    cells: [
      {
        id: "A",
        content: "Duke STARR-seq",
      },
      {
        id: "B",
        content: "Resource",
      },
      {
        id: "C",
        content: "STARR-seq",
      },
      {
        id: "D",
        content:
          "Genome-wide STARR-seq assays using genomes from hundreds of individuals. We expect to represent nearly all common variants in the human population and millions of rare and personal variants. We are happy to distribute excess plasmid libaries for others to use.",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Duke Charactization Center",
      },
      {
        id: "G",
        content: "tim.reddy@duke.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "no list provided",
      },
    ],
  },
  {
    id: "6",
    cells: [
      {
        id: "A",
        content: "All European 1000G SNPs",
        component: DataCellWithClasses,
        componentProps: { className: "bg-[#bfe0ce] dark:bg-[#404b45]" },
      },
      {
        id: "B",
        content: "Resource",
      },
      {
        id: "C",
        content: "MPRA, Variant editing",
      },
      {
        id: "D",
        content:
          "Background set of variants / Negative control variants.  e.g., as controls for GWAS variants, select a random set of frequency-matched 1000G SNPs",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://storage.googleapis.com/broad-alkesgroup-public/Variant_effects/1000_Genomes_common_LF_variants_LDSC_GRCh38.txt
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "Kushal Dey generated updated version",
      },
    ],
  },
  {
    id: "7",
    cells: [
      {
        id: "A",
        content: "Mendelian Non-Coding SNV",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "MPRA, Variant editing",
      },
      {
        id: "D",
        content:
          "Spreadsheet from supplemental table S6; each variant annotated for OMIIM, PMID, gene, chr, position, ref and variant; tabs for enhancer, promoter, 5'UTR, 3'UTR, RNA genes, Imprinting Control Regions, miRNA; I added a tab with a non-redundant gene list",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://docs.google.com/spreadsheets/d/1c8afZD8OpMWqfY6P86K_qOQdTIl47T8a/edit?usp=sharing&ouid=113585314970533144724&rtpof=true&sd=true
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "",
      },
      {
        id: "G",
        content: "michael.pazin@nih.gov",
      },
      {
        id: "H",
        content: <CellLink>https://pubmed.ncbi.nlm.nih.gov/27569544/</CellLink>,
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
        content: "-",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "8",
    cells: [
      {
        id: "A",
        content: "Liver GWAS variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Common diseases",
      },
      {
        id: "D",
        content:
          "For selected traits relevant to liver identify lead GWAS variants and their ancestry-relevant LD proxies (r2>.8) for MPRA. At most signals, we aim to test all LD proxy variants, as feasible, to enable predictions of noncoding regulatory variants. We are annotating variants with ENCODE cCREs and other regulatory info so can share full sets or annotated subsets.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52047235</CellLink>
        ),
      },
      {
        id: "F",
        content: "Won",
      },
      {
        id: "G",
        content:
          "mohlke@med.unc.edu, michaelisaiahlove@gmail.com, jdrosen@email.unc.edu",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "9",
    cells: [
      {
        id: "A",
        content:
          "GWAS variants associated with LDL-C, HDL-C, CAD, BP, neutrophil counts, red blood cell traits",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Common diseases",
      },
      {
        id: "D",
        content:
          "Variants are selected from largest available trans-ancestry meta-analyses. For each sentinel variants, we retrieve variants in strong LD (r2>0.8) using the 4 ancestral populations from TOPMed. We also had additional variants based on fine-mapping (PIP>0.1). Depending on locus, we subset variants based on functional annotations.",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Pinello",
      },
      {
        id: "G",
        content:
          "guillaume.lettre@umontreal.ca ; estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "10",
    cells: [
      {
        id: "A",
        content:
          "GWAS variants associated with coronary artery disease in smooth muscle cell",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "CAD, smooth muscle cells",
      },
      {
        id: "D",
        content:
          "CAD GWAS lead SNPs were LD-expanded and genes within +/- 500kb were interscted with gene expresssion and HiC data sets for smooth muscle cell type",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://docs.google.com/spreadsheets/d/1ZhmFJ9JrwBs_0K_7IfGlYV6Mb0gppsO3/edit#gid=1836144568
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "Stanford FCC/ Quertermous",
      },
      {
        id: "G",
        content: "tomq1@stanford.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "Should be subset of the full list of CAD variants",
      },
    ],
  },
  {
    id: "11",
    cells: [
      {
        id: "A",
        content: "Allele Specific Binding/RegulomeDB",
      },
      {
        id: "B",
        content: "Resource",
      },
      {
        id: "C",
        content: "GM12878, K562, HepG2, A549, MCV-7, H1hESC",
      },
      {
        id: "D",
        content: "Allele-specific TF binding (ASB) SNVs Called with AlleleDB",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://drive.google.com/drive/folders/1_N1qn6RP_9O2fmxHpT4u2-JgM1nbDyQf
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "Boyle",
      },
      {
        id: "G",
        content: "apboyle@umich.edu",
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
        content: "No",
      },
      {
        id: "L",
        content:
          "Boyle lab will provide updated predictions after final variant list is generated",
      },
    ],
  },
  {
    id: "12",
    cells: [
      {
        id: "A",
        content:
          "Genomic analyses implicate noncoding de novo variants in congenital heart disease",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "congenital heart disease",
      },
      {
        id: "D",
        content:
          "De novo variants in congenital heart disease (genome sequences from 749 CHD probands and their parents with those from 1,611 unaffected trios)",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.nature.com/articles/s41588-020-0652-z</CellLink>
        ),
      },
      {
        id: "F",
        content: "Hon Lab",
      },
      {
        id: "G",
        content: "Nikhil.Munshi@utsouthwestern.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "No list of variants provided",
      },
    ],
  },
  {
    id: "13",
    cells: [
      {
        id: "A",
        content:
          "Analysis of recent shared ancestry in a familial cohort identifies coding and noncoding autism spectrum disorder variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "autism",
      },
      {
        id: "D",
        content:
          "Whole genome sequencing (WGS) in an ASD cohort of 68 individuals from 22 families enriched for recent shared ancestry.",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://www.nature.com/articles/s41525-022-00284-2
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "Hon Lab",
      },
      {
        id: "G",
        content: "Maria.Chahrour@utsouthwestern.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "No list of variants provided",
      },
    ],
  },
  {
    id: "14",
    cells: [
      {
        id: "A",
        content: "iPSC/Fibroblast eQTLs",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSCs",
      },
      {
        id: "D",
        content: "eQTLs selected from scRNA studies in fibroblasts and iPSCs",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://docs.google.com/spreadsheets/d/19A5W5yzztfGC_qKrpWyBrrlaJaMqvaj9V9dC9q-DynM/edit?usp=sharing
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "Luo Lab",
      },
      {
        id: "G",
        content: "terencewtli@g.ucla.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "eQTL FG will work on updating file format",
      },
    ],
  },
  {
    id: "15",
    cells: [
      {
        id: "A",
        content: "Variants relevant to lipid levels",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Hepatocytes / Lipid levels",
      },
      {
        id: "D",
        content: (
          <>
            Comprehensive set of ~2500 variants in GWAS loci associated with
            lipid levels and that affect lipid handling in hepatocytes/HepG2{" "}
            <CellLink>
              https://docs.google.com/document/d/1c218Xq4hKBPsOivngMf4-qpUN_7w60LD1zTqnkhbU8U/edit
            </CellLink>
          </>
        ),
      },
      {
        id: "E",
        content: (
          <>
            Comprehensive set of ~2500 variants in GWAS loci associated with
            lipid levels and that affect lipid handling in hepatocytes/HepG2{" "}
            <CellLink>
              https://docs.google.com/document/d/1c218Xq4hKBPsOivngMf4-qpUN_7w60LD1zTqnkhbU8U/edit
            </CellLink>
            ,
          </>
        ),
      },
      {
        id: "F",
        content: "Sherwood, Pinello, others",
      },
      {
        id: "G",
        content: "",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "16",
    cells: [
      {
        id: "A",
        content: "Functional variants in GM12878",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "GM12878",
      },
      {
        id: "D",
        content:
          "A set of 100 variants within 5 genomic regions in GM12878 that are predicted to be functional",
      },
      {
        id: "E",
        content: (
          <>
            <CellLink>
              https://docs.google.com/spreadsheets/d/1sVvX3N0syVSp1SvqG4b12OeP2qOjRxaWwHixWIPQIVg/edit#gid=0\r\nlink
            </CellLink>{" "}
            to Synapse:{" "}
            <CellLink>https://www.synapse.org/#!Synapse:syn51616855</CellLink>
          </>
        ),
      },
      {
        id: "F",
        content: "Liu Lab",
      },
      {
        id: "G",
        content: "drjieliu@umich.edu,lhjiang@umich.edu",
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
        content: "No",
      },
      {
        id: "L",
        content: "emailed to request file in updated format",
      },
    ],
  },
  {
    id: "17",
    cells: [
      {
        id: "A",
        content:
          "Saturation mutagenesis of twenty disease-associated regulatory elements at single base-pair resolution",
      },
      {
        id: "B",
        content: "resource",
      },
      {
        id: "C",
        content:
          "HepG2,HeLa,HEL92.1.7,HEK293T,K562,SF7996,SK-MEL-28,HaCaT,LNCaP,Neuro-2a,MIN6,NIH/3T3",
      },
      {
        id: "D",
        content:
          "Dense readout of variant effects of multiple disease related loci. Good resource for benchmarking tools or find positive/negative variant controls.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn30614866</CellLink>
        ),
      },
      {
        id: "F",
        content: "Kircher Lab",
      },
      {
        id: "G",
        content: "max.schubach@bih-charite.de",
      },
      {
        id: "H",
        content: (
          <CellLink>https://doi.org/10.1038/s41467-019-11526-w</CellLink>
        ),
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
        content: "No",
      },
      {
        id: "L",
        content: "emailed to request file in updated format",
      },
    ],
  },
  {
    id: "18",
    cells: [
      {
        id: "A",
        content: "Proximal promoter variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "HepG2, K562, HEK293T",
      },
      {
        id: "D",
        content:
          'Over 170K variants in 60K different promoter regions (excluding core promoter) across the genome. Variants where selcted via in-silico mutagenesis o a sequence based model (positive/negative and neutral prediction). Library will be tested in multile cell-lines. Nice resource of "random" selected variants across genome. Good benchmaing dataset.',
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51227153</CellLink>
        ),
      },
      {
        id: "F",
        content: "Kircher Lab",
      },
      {
        id: "G",
        content: "max.schubach@bih-charite.de",
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
        content: "No",
      },
      {
        id: "L",
        content: "emailed to request file in updated format",
      },
    ],
  },
  {
    id: "19",
    cells: [
      {
        id: "A",
        content:
          "gnomAD variantions in CREs of neuro/heart disease associated genes (+ actionable genes)",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "WTC11, WTC11 derived neurons/cardiomyocytes",
      },
      {
        id: "D",
        content:
          "Might be good to have a comprehensive annotation of all GnomAD variants in the designed regions. On rare variants we made a pre-seclection using Enformer to reduce the number. But other selections might be possible using other annotations. This can be included in further designs.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51173693</CellLink>
        ),
      },
      {
        id: "F",
        content: "Kircher Lab",
      },
      {
        id: "G",
        content: "max.schubach@bih-charite.de",
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
        content: "No",
      },
      {
        id: "L",
        content: "emailed to request file in updated format",
      },
    ],
  },
  {
    id: "20",
    cells: [
      {
        id: "A",
        content: "CAD related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Coronary artery disease related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756097</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "21",
    cells: [
      {
        id: "A",
        content: "DBP related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Diastolic blood pressure related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756098</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "22",
    cells: [
      {
        id: "A",
        content: "HCT related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Hematocrit related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756099</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "23",
    cells: [
      {
        id: "A",
        content: "HDL related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "High density lipoprotein related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756083</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "24",
    cells: [
      {
        id: "A",
        content: "HGB related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Hemoglobin concentration related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756084</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "25",
    cells: [
      {
        id: "A",
        content: "LDL related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Low density lipoprotein related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756085</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "26",
    cells: [
      {
        id: "A",
        content: "MCHC related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Mean corpuscular hemoglobin concentration related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756087</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "27",
    cells: [
      {
        id: "A",
        content: "MCH related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Mean corpuscular hemoglobin related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756086</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "28",
    cells: [
      {
        id: "A",
        content: "MCV related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Mean corpuscular volume related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756088</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "29",
    cells: [
      {
        id: "A",
        content: "NEUTnum related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Neutrophil numeration related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756089</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "30",
    cells: [
      {
        id: "A",
        content: "NEUTprc related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Neutrophil pourcentage related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756090</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "31",
    cells: [
      {
        id: "A",
        content: "PP related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Pulse pressure related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756091</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "32",
    cells: [
      {
        id: "A",
        content: "RBCnum related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Red blood cell count related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756092</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "33",
    cells: [
      {
        id: "A",
        content: "RDW related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Red cell distribution width related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756093</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "34",
    cells: [
      {
        id: "A",
        content: "RETnum related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Reticulocytes count related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756094</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "35",
    cells: [
      {
        id: "A",
        content: "RETprc related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Reticulocytes pourcentage related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756095</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "36",
    cells: [
      {
        id: "A",
        content: "SBP related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Systolic blood pressure related variants, either in LD with GWAS associated variants (r2>=0.8TOPMed, in white, black, east Asians or south east Asians) or finemapped.",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51756096</CellLink>
        ),
      },
      {
        id: "F",
        content: "Lettre Lab",
      },
      {
        id: "G",
        content: "estelle.lecluze@mhi-humangenetics.org",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "37",
    cells: [
      {
        id: "A",
        content: "Lupus clinvar variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Immune",
      },
      {
        id: "D",
        content: "Lupus variants submitted to clinvar",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51790706</CellLink>
        ),
      },
      {
        id: "F",
        content: "Kundaje Center",
      },
      {
        id: "G",
        content: "amarder@stanford.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "SPDI threw warnings",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "38",
    cells: [
      {
        id: "A",
        content: "Lupus gwas variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Immune",
      },
      {
        id: "D",
        content:
          "Multi-ancestry lupus variants identified through GWAS in EUR and EAS populations",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn51790705</CellLink>
        ),
      },
      {
        id: "F",
        content: "Kundaje Center",
      },
      {
        id: "G",
        content: "amarder@stanford.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "SPDI threw warnings",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "39",
    cells: [
      {
        id: "A",
        content: "CAD gwas variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Coronary artery disease",
      },
      {
        id: "D",
        content:
          "Discovery and systematic characterization of risk variants and genes for coronary artery disease in over a million participants. Million vet data (MVP) and CARDIoGRAM+C4D (Aragam)",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52173360</CellLink>
        ),
      },
      {
        id: "F",
        content: "Engreitz Lab\r\nQuetermous Lab",
      },
      {
        id: "G",
        content: "engreitz@stanford.edu tomq1@stanford.edu",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "40",
    cells: [
      {
        id: "A",
        content: "CAD gwas variants in EC enhancers",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Coronary artery disease",
      },
      {
        id: "D",
        content: "CAD variants in endothelial cell enhancers",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52173360</CellLink>
        ),
      },
      {
        id: "F",
        content: "Engreitz Lab",
      },
      {
        id: "G",
        content: "engreitz@stanford.edu",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "41",
    cells: [
      {
        id: "A",
        content: "VarChamp variants phase 1",
      },
      {
        id: "B",
        content: "resource",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Broad sample of ~16,000 variants from ClinVar encompassing all annotation classes and a range of diseases",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52187361</CellLink>
        ),
      },
      {
        id: "F",
        content: "CCSB, DFCI",
      },
      {
        id: "G",
        content: "tong_hao@dfci.harvard.edu",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "42",
    cells: [
      {
        id: "A",
        content: "Psoriasis related variants",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content: "A list of 700 selected psoriasis GWAS variants",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52223771</CellLink>
        ),
      },
      {
        id: "F",
        content: "Sartor Lab",
      },
      {
        id: "G",
        content: "elysian@umich.edu, sartorma@med.umich.edu",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
  {
    id: "43",
    cells: [
      {
        id: "A",
        content: "CAVA variants phase 1",
      },
      {
        id: "B",
        content: "resource",
      },
      {
        id: "C",
        content: "VAMPseq; SGE",
      },
      {
        id: "D",
        content: "List of SNVs for genes identified for VAMP-seq and SGE MAVEs",
      },
      {
        id: "E",
        content: (
          <CellLink>https://www.synapse.org/#!Synapse:syn52228735</CellLink>
        ),
      },
      {
        id: "F",
        content: "Fowler and Starita Labs",
      },
      {
        id: "G",
        content: "alan.rubin@wehi.edu.au",
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
        content: "Yes",
      },
      {
        id: "L",
        content: "",
      },
    ],
  },
];

export default function Variants() {
  return (
    <div>
      <PagePreamble pageTitle="Variants" />
      <div role="table" className="overflow-x-auto text-sm">
        <DataTable data={dataGrid} />
      </div>
    </div>
  );
}
