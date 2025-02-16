// components
import { DataTable } from "../../components/data-table";
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
        content: "Genes/Loci",
      },
      {
        id: "B",
        content:
          "Category (e.g., negative controls, positive controls, or biological question)",
      },
      {
        id: "C",
        content: "Biological systems/Cell types/Assays",
      },
      {
        id: "D",
        content:
          "Purpose and Criteria for Selection (Explain to others why they might want to use this set of genes)",
      },
      {
        id: "E",
        content: "Link",
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
        content:
          "Include in joint TF Perturb-seq library? Please provide rationale.",
      },
    ],
  },
  {
    id: "3",
    cells: [
      {
        id: "A",
        content:
          "NKX2.5, HAND1, HOPX, TBX5, TBX20, TBX2, ISL1, MEF2C, GATA4, MYH6, GJA1, SBK2, SBK3, SMCO1, MYLK3, MYBPHL, TECRL, PXDNL, CCDC141, MYL7, MYL4, RBM20",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Congenital heart disease, cardiomyocytes",
      },
      {
        id: "D",
        content: "CRISPRi",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content:
          "Steinmetz Group at EMBL Heidelberg, Steinmetz Lab at Stanford University",
      },
      {
        id: "G",
        content: "dominik.lindenhofer@embl.de and mvk@stanford.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "CHD / Cardiomyopathies",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "4",
    cells: [
      {
        id: "A",
        content: "Stanford FCC",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Endothelial cells, Variant editing",
      },
      {
        id: "D",
        content:
          "Genes in cardiovascular disease GWAS loci (coronary artery disease, congenital heart disease, pulmonary hypertension, etc.) that act in smooth muscle cells, endothelial cells, cardiomyocytes, or macrophages",
      },
      {
        id: "E",
        content: (
          <span>
            A few variants in ECs we plan to study:{" "}
            <CellLink>
              https://docs.google.com/spreadsheets/d/139fGc0jbj_JSipG3lJcJptO8IwtMsCuM/edit#gid=445850181
            </CellLink>
          </span>
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
        content:
          "Perturb enhancers nearby to identify target genes, and perturb genes to identify downstream transcriptional phenotype using Perturb-seq",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "5",
    cells: [
      {
        id: "A",
        content: "Transcription factors",
      },
      {
        id: "B",
        content: "Concept",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content:
          "Transcription factors — interesting for gene perturbations, coding variant perturbations, disease variation, understanding TF trans-regulatory networks",
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
        content: "",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "e.g. see notes from May 10 Characterization WG",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "6",
    cells: [
      {
        id: "A",
        content:
          "PALB2, SDHD, CTCF, SFPQ, BRCA2, MRG15, RNF168, BARD1, RAD51D, BRIP, FARS2, AHDC1, NBN, XRCC2, CARD11, IRF4",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Coding variants",
      },
      {
        id: "D",
        content: "saturation genome editing for identifying LoF variants",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Starita/Fowler",
      },
      {
        id: "G",
        content: "lstarita@uw.edu; dfowler@uw.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "ACMG73 and GREGoR derived",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "7",
    cells: [
      {
        id: "A",
        content: "CYP2C19, G6PD, F9",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Coding variants",
      },
      {
        id: "D",
        content: "VAMPseq for identifying LoF variants",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Starita/Fowler",
      },
      {
        id: "G",
        content: "lstarita@uw.edu; dfowler@uw.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "ACMG73, GREGoR, CPIC derived",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "8",
    cells: [
      {
        id: "A",
        content:
          "EOMES, GATA4, GATA6, SOX17, OCT4, NANOG, SOX2, MIXL1, PDX1, HHEX, ONECUT1, ISL1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSCs, endoderm and pancreatic differentiation",
      },
      {
        id: "D",
        content: "CRISPRi",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Huangfu/Hadjantonakis/Beer",
      },
      {
        id: "G",
        content: "huangfud@mskcc.org",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "iPSCs, endoderm and pancreatic differentiation",
      },
      {
        id: "J",
        content: "Note: ISL1 and GATA4 are in common with row 4",
      },
      {
        id: "K",
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
          "LDLR, MYLIP, SCARB1, ABCA1, HNF1A, HNF4A, ARID1A, DENND4C/RPS6",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Heaptocytes",
      },
      {
        id: "D",
        content:
          "Genes with strong nearby LDL-C GWAS signal (HNF1A and HNF4A have GWAS coding variants, others likely non-coding) and strong phenotype in LDL-C uptake screens",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Pinello/Sherwood",
      },
      {
        id: "G",
        content: "rsherwood@bwh.harvard.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "LDL-C uptake in HepG2",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "10",
    cells: [
      {
        id: "A",
        content: "Genes that regulate ubiquitous cell programs:  TP53, etc.",
      },
      {
        id: "B",
        content: "Positive controls",
      },
      {
        id: "C",
        content: "Many/all cell types",
      },
      {
        id: "D",
        content:
          "Idea from Mid-Year meeting: Positive controls for Perturb-seq screens are genes that would lead to similar effects in many different cell types.  To do: Pull list from Mid-Year meeting slides",
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
        content: "",
      },
    ],
  },
  {
    id: "11",
    cells: [
      {
        id: "A",
        content: "HNF1A, HNF4A, GATA4, NKX2-5, TBX3/5, ZEB1, NR1H3/4, SREBF1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Hepatocytes",
      },
      {
        id: "D",
        content:
          "Transcription factors associated with cardiometabolic disease to act as shared testing loci for characterization and mapping projects",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Cardiometabolic FG (Rich Sherwood coordinating)",
      },
      {
        id: "G",
        content: "rsherwood@bwh.harvard.edu",
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
    ],
  },
  {
    id: "12",
    cells: [
      {
        id: "A",
        content:
          "SKI, PRDM16, FHL3, ZEB2, REST1, PRDM8, ARNTL,SMAD3, ZEB1, CLOCK",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Smooth muscle cells",
      },
      {
        id: "D",
        content:
          "TFs associated with CAD GWAS loci: CAD GWAS lead SNPs were LD-expanded and genes within +/- 500kb were interscted with gene expresssion and HiC data sets from smooth muscle cells",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://docs.google.com/spreadsheets/d/1ZhmFJ9JrwBs_0K_7IfGlYV6Mb0gppsO3/edit#gid=1836144568,
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "CMD-FG/ Querternous lab",
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
        content: "",
      },
    ],
  },
  {
    id: "13",
    cells: [
      {
        id: "A",
        content:
          "NR2C1, SAP130, FHL3, ADNP, CHD4,CHD7, DDX3X,G ATA6, KMT2A, KMT2D, NSD1, PRRX2, SMAD2, SMAD6, EOMES, FOXH1, COUPTFII, OCT4, SNAI2, SOX7",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Endothelial cells or mesenchymal cells",
      },
      {
        id: "D",
        content:
          "TFs and chromatin remodlers associated with GWAS of either CAD, BP, aortic diameter, or CHD that are expressed in endothelial cells or mesenchymal cells",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "CMD-FG/ Engreitz lab",
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
        content: "",
      },
    ],
  },
  {
    id: "14",
    cells: [
      {
        id: "A",
        content:
          "TBX5, GATA4, GLI2, IRX4, ISL1, MEIS1, MSX2, NKX2-6, NKX3-1, NR2F1, RXRA, SMAD4, SMAD6, ZIC2",
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
          "TFs associated with CHD variants identified by WGS that are within 1kb of ATAC/H3K27Ac peak and within 100kb of a GO heart development gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "CMD-FG/ Munshi Lab",
      },
      {
        id: "G",
        content: "nikhil.munshi@utsouthwestern.edu",
      },
      {
        id: "H",
        content: (
          <CellLink>
            https://www.nature.com/articles/s41588-020-0652-z.pdf
          </CellLink>
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
        content: "",
      },
    ],
  },
  {
    id: "15",
    cells: [
      {
        id: "A",
        content:
          "KLF2/4, ERG1, SOX17, TBX4, FOXF1, FOXO1, p53, NFKB, SMAD1/2/3/4/5/9, CREB3/5, PPARG, MYCC, TCF/LEF, N1ICD, NOTCH3, SNAI1,",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Endothelial cells",
      },
      {
        id: "D",
        content:
          "TFs important in pulmonary arterial hypertension (highlighted are associated with coding mutations)",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "CMD-FG/ Rabinovitch lab",
      },
      {
        id: "G",
        content: "marlener@stanford.edu",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content:
          "ChIP Seq data for KLF2/4 in endothelial cells under laminar shear stress",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "16",
    cells: [
      {
        id: "A",
        content: "DHX38, MAT2A, FES, AIDA, ARHGEF26, ADAMTS7,",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Endothelial cells",
      },
      {
        id: "D",
        content:
          "Genes at CAD GWAS loci implicated by pooled CRISPR screens in endothelial functions.",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "CMD-FG/Lettre lab",
      },
      {
        id: "G",
        content: "guillaume.lettre@umontreal.ca",
      },
      {
        id: "H",
        content: <CellLink>https://doi.org/10.1101/2021.02.10.430527</CellLink>,
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
    ],
  },
  {
    id: "17",
    cells: [
      {
        id: "A",
        content: "chromatin accessibility QTL for validation",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Lupus/PBMCs",
      },
      {
        id: "D",
        content: "caQTL derived from sciATAC data from lupus and control PBMCs",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Buenrostro/Bernstein mapping center",
      },
      {
        id: "G",
        content: "egaskell@broadinstitute.ord",
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
    ],
  },
  {
    id: "18",
    cells: [
      {
        id: "A",
        content:
          "FZD9, TBL2, VPS37D, DNAJC30, ABHD11, CLDN3, METTL27, TMEM270, FKBP6, BAZ1B, BCL7B, MLXIPL, BUD23, STX1A, CLDN4, LIMK1, LAT2, RFC2, ELN, EIF4H, CLIP2, GTF2IRD1, GTF2I",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "excitatory neurons, astrocytes, cardiomycytes, smooth muscle, endothelial cells",
      },
      {
        id: "D",
        content:
          "Williams Syndrome (7q11.23), associated with autism, schizophrenia, neurodevelopmental delay, and congenital heart defects",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "neuro-fg/Shendure",
      },
      {
        id: "G",
        content:
          "nick.page@ucsf.edu, nadav.ahituv@ucsf.edu, maria.chahrour@utsouthwestern.edu",
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
        content:
          "Yes, this CNV is associated with multiple organ phenotypes and Purturb-Seq results will be used to guide discovery of CRISPRa cis-regulation therapies to rescue william's syndrome phenotypes in brain and cardiac organoids",
      },
    ],
  },
  {
    id: "19",
    cells: [
      {
        id: "A",
        content:
          "SPN, C16orf54, ZG16, MAZ, PRRT2, CDIPT, HIRIP3, C16orf92, TBX6, YPEL3, GDPD3, MAPK3, CORO1A, QPRT, KIF22, AC009133.23, PAGR1, CTD-2574D22.6, MVP, ASPHD1, KCTD13, TMEM219, TAOK2, INO80E, TLCD3B, CTD-2515O10.6, ALDOA, PPP4C, SEZ6L2, DOC2A",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "excitatory neurons, astrocytes, cardiomycytes, smooth muscle, endothelial cells",
      },
      {
        id: "D",
        content:
          "16p11.2 Deletion Syndrome, associated with autism, schizophrenia, neurodevelopmental delay, and obesity",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "neuro-fg/Shendure",
      },
      {
        id: "G",
        content:
          "nick.page@ucsf.edu, nadav.ahituv@ucsf.edu, maria.chahrour@utsouthwestern.edu",
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
        content:
          "Yes, this CNV is associated with multiple organ phenotypes and Purturb-Seq results will be used to guide discovery of CRISPRa cis-regulation therapies to rescue william's syndrome phenotypes in brain organoids",
      },
    ],
  },
  {
    id: "20",
    cells: [
      {
        id: "A",
        content: "Ikzf1-Ikzf3",
      },
      {
        id: "B",
        content: "Positive control, biological question",
      },
      {
        id: "C",
        content: "Lupus",
      },
      {
        id: "D",
        content:
          "There's a great drug(s) that degrade these TFs, useful for validation. Also very interesting anti inflammatory factor, it's one of many lupus gwas hits.",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Buenrostro",
      },
      {
        id: "G",
        content: "Jason Buenrostro",
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
    ],
  },
  {
    id: "21",
    cells: [
      {
        id: "A",
        content:
          "TSSK2, GSC2, SLC25A1, MRPL40, CLDN5, SEPTIN5, SEPT5-GP1BB, GP1BB, RTL10, TRMT2A, CCDC188, DGCR6, AC007326.13, PRODH, DGCR2, UFD1, CDC45, TBX1, COMT, ARVCF, DGCR8, RANBP1, ZDHHC8, RTN4R, ESS2, CLTCL1, HIRA, C22orf39, GNB1L, TANGO2, DGCR6L, TXNRD2, THAP7, SLC7A4, USP41, ZNF74, SCARF2, XXbac-B562F10.12, SERPIND1, SNAP29, CRKL, LZTR1, P2RX6, LRRC74B, KLHL22, MED15, PI4KA, AIFM3",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "excitatory neurons, astrocytes, cardiomycytes, smooth muscle, endothelial cells",
      },
      {
        id: "D",
        content:
          "DiGeorge Syndrome (22q11.2), associated with autism, schizophrenia, neurodevelopmental delay, and congenital heart defects",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "neuro-fg/Shendure",
      },
      {
        id: "G",
        content:
          "nick.page@ucsf.edu, nadav.ahituv@ucsf.edu, maria.chahrour@utsouthwestern.edu",
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
        content:
          "Yes, this CNV is associated with multiple organ phenotypes and Purturb-Seq results will be used to guide discovery of CRISPRa cis-regulation therapies to rescue william's syndrome phenotypes in brain and cardiac organoids",
      },
    ],
  },
  {
    id: "22",
    cells: [
      {
        id: "A",
        content: "SENP7, PLAGL1, IKZF1, NFE2, NFKBIA,GFI1B",
      },
      {
        id: "B",
        content: "positive control, biological questions",
      },
      {
        id: "C",
        content: "Blood",
      },
      {
        id: "D",
        content: "these are master trans regulators identified in blood",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Liu lab",
      },
      {
        id: "G",
        content: "xuanyao@uchicago.edu",
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
    ],
  },
  {
    id: "23",
    cells: [
      {
        id: "A",
        content: "Hub genes in regulatory networks",
      },
      {
        id: "B",
        content: "positive control",
      },
      {
        id: "C",
        content: "",
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
        content: "Liu lab",
      },
      {
        id: "G",
        content: "xuanyao@uchicago.edu",
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
    ],
  },
  {
    id: "24",
    cells: [
      {
        id: "A",
        content: "SMC1A",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "developmental delay",
      },
      {
        id: "D",
        content:
          "SMC1A variants are known to cause a phenotype resembling Cornelia de Lange syndrome (CdLS) with relatively mild features compared to variants in the NIPBL gene, which are the most common known cause of the disorder",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "Balliu Lab",
      },
      {
        id: "G",
        content: "bballiu@ucla.edu",
      },
      {
        id: "H",
        content: <CellLink>https://pubmed.ncbi.nlm.nih.gov/28548707/</CellLink>,
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
    ],
  },
  {
    id: "25",
    cells: [
      {
        id: "A",
        content:
          "FBXO46, EIF1B, C5orf24, ZNF777, ANKRD13B, DCAF10, KIAA0232, ZBTB47, POGK, PPP4R1, C1orf21, C6orf62, ZC3H7A, ABHD13, UBFD1, ZNF654, RIMS4, ZNF296",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "high constraint",
      },
      {
        id: "D",
        content:
          "Many genes with evidence of strong selection (fitneess reduction >10%) against heterozygous loss-of-function variants have mostly unknown function. This set were also in the lowest 5% of genes for a pubmed score capturing how often they are mentioned in publications.",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://docs.google.com/spreadsheets/d/1XuouJC5YI4UWaqlQSTHK0S4dl7E8m0MYq2DMX3s7ABY/edit?usp=sharing
          </CellLink>
        ),
      },
      {
        id: "F",
        content: "Sunyaev Lab",
      },
      {
        id: "G",
        content: "evan_koch@hms.harvard.edu, ssunyaev@hms.harvard.edu",
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
    ],
  },
  {
    id: "26",
    cells: [
      {
        id: "A",
        content: "WWC3",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "iPSC->Neural progenitor cells\niPSC->Endothelial\nImmortalized smooth muscle cells",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "27",
    cells: [
      {
        id: "A",
        content: "ARID1B",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells\niPSC->Cardiomyocyte",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "28",
    cells: [
      {
        id: "A",
        content: "ZPR1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neurons (motor)",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "29",
    cells: [
      {
        id: "A",
        content: "SOX4",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "30",
    cells: [
      {
        id: "A",
        content: "SETD3",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "affected individual has skeletal muscle and nerve findings",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "31",
    cells: [
      {
        id: "A",
        content: "POLR1F",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "affected individual has motor neuron and renal disease",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "32",
    cells: [
      {
        id: "A",
        content: "BHLHE22",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "33",
    cells: [
      {
        id: "A",
        content: "MBNL2",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "affected individual has skeletal muscle disease",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "34",
    cells: [
      {
        id: "A",
        content: "Chr X:153926570-153929389",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Primary B cells, any immunologic cell line",
      },
      {
        id: "D",
        content: "GREGoR candidate locus",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_GSS",
      },
      {
        id: "G",
        content: "CReuter@stanfordhealthcare.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "35",
    cells: [
      {
        id: "A",
        content: "RNU4ATAC",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "Affected individuals have a neuro, developmental, cardio",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: (
          <div>
            <div>
              several relevant model systems (neuro, cardio, B cells,
              fibroblast, renal, ...)
            </div>
            <div>
              See{" "}
              <CellLink>https://www.ncbi.nlm.nih.gov/books/NBK589232/</CellLink>
            </div>
            <div>for the full list of affected organ systems in humans.</div>,
          </div>
        ),
      },
      {
        id: "F",
        content: "GREGoR_Broad",
      },
      {
        id: "G",
        content: "sditroia@broadinstitute.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "36",
    cells: [
      {
        id: "A",
        content: "UPF1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "Affected individuals have a neuro, developmental, cardio, and derm phenotype",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_Broad",
      },
      {
        id: "G",
        content: "sditroia@broadinstitute.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "37",
    cells: [
      {
        id: "A",
        content: "SMG8",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "Affected individuals have a neuro, skeletal, cardio phenotype",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_Broad",
      },
      {
        id: "G",
        content: "sditroia@broadinstitute.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "38",
    cells: [
      {
        id: "A",
        content: "SMG9",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "Affected individuals have a neuro, skeletal, cardio phenotype",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_Broad",
      },
      {
        id: "G",
        content: "sditroia@broadinstitute.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "39",
    cells: [
      {
        id: "A",
        content: "PAX5",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "iPSC->Neural progenitor cells\niPSC->Neurons (what types/ protocols?)(Cortical)\nPrimary B cells",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_Broad",
      },
      {
        id: "G",
        content: "sditroia@broadinstitute.org, lstarita@uw.edu",
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
    ],
  },
  {
    id: "40",
    cells: [
      {
        id: "A",
        content: "KDM1A",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "iPSC (esp. WTC11, H1, H9), iPSC-> gastruloid or primary B cells",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_UW",
      },
      {
        id: "G",
        content: "jxchong@uw.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "41",
    cells: [
      {
        id: "A",
        content: "KDF1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "fibroblasts; iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "42",
    cells: [
      {
        id: "A",
        content: "DHX9",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "43",
    cells: [
      {
        id: "A",
        content: "RAI1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "44",
    cells: [
      {
        id: "A",
        content: "MECP2",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "45",
    cells: [
      {
        id: "A",
        content: "NODAL",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "iPSC->Cardiomyocyte; iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "46",
    cells: [
      {
        id: "A",
        content: "ZIC3",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "iPSC->Cardiomyocyte; iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "47",
    cells: [
      {
        id: "A",
        content: "TBX6",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content:
          "iPSC-> gastruloid; iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "48",
    cells: [
      {
        id: "A",
        content: "REST",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "49",
    cells: [
      {
        id: "A",
        content: "FOXI3",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "50",
    cells: [
      {
        id: "A",
        content: "FLVCR1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "51",
    cells: [
      {
        id: "A",
        content: "NSRP1",
      },
      {
        id: "B",
        content: "Biological question",
      },
      {
        id: "C",
        content: "iPSC->Neural progenitor cells; iPSC->Neurons",
      },
      {
        id: "D",
        content: "GREGoR candidate gene",
      },
      {
        id: "E",
        content: "",
      },
      {
        id: "F",
        content: "GREGoR_BCM",
      },
      {
        id: "G",
        content: "Moez.Dawood@bcm.edu , lstarita@uw.edu",
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
    ],
  },
  {
    id: "52",
    cells: [
      {
        id: "A",
        content:
          "TYW1B, SBDSP1, PDYE7P, POM121, NSUN5P2, TRIM73, TRIM74, LOC541473, LOC100101148, STAG3L3, PMS2P7, SPDYE8P, GTF2IP4, GTF2IP1, NCF1B, NSUN5, TRIM50, FKBP6, FZD9, BAZ1B, BCL7B, TBL2, VPS37D, DNAJC30, WBSCR22, MIR4284, STX1A, ABHD11-AS1, ABHD11, CLDN3, CLDN4, WBSCR27, WBSCR28, ELN, LIMK1, EIF4H, MIR590, LAT2, RFC2, CLIP2, LOC101926943, NCF1, STAG3L2, PMS2P5, GATSL2, WBSCR16, GTF2IRD2B, NCF1C, PMS2P2, STAG3L1, NSUN5P1, POM121C, SPDYE5, PMS2P3, HIP1, CCL26, CCL24, RHBDD2, POR, MIR4651, SNORA14A, TMEM120A, STYXL1, MDH2, SRRM3, HSPB1, YWHAG, SSC4D, ZP3, DTX2, FDPSP2, UPK3B, LOC100133091, POMZP3, DTX2P1-UPK3BP1-PMS2P11, PMS2P9, CCDC146, FGL2, LOC101927243, GSAP, PTPN12, RSBN1L, APTR, TMEM60",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "",
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
        content: "Chong Park, Stanford",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "Williams Syndrome",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "53",
    cells: [
      {
        id: "A",
        content:
          "GGT3P, DGCR6, PRODH, DGCR5, DGCR9, DGCR10, DGCR11, DGCR2, TSSK2, DGCR14, LINC01311, SLC25A1, CLTCL1, HIRA, MRPL40, C22orf39, UFD1L, CDC45, CLDN5, LINC00895, SEPT5, GP1BB, C22orf29, GNB1L, COMT, TXNRD2, MIR4761, ARVCF, TANGO2, MIR185, DGCR8, MIR3618, MIR1306, MIR6816, RANBP1, TRMT2A, RANBP1, ZDHHC8, LOC388849, LOC284865, LINC00896, MIR1286, RTN4R, DGCR6L, SCARF2, KLHL22, MED15, POM121L4P, TMEM191A",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "",
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
        content: "Chong Park, Stanford",
      },
      {
        id: "H",
        content: "",
      },
      {
        id: "I",
        content: "DiGeroge (22q11 Deletion) Syndrome",
      },
      {
        id: "J",
        content: "",
      },
      {
        id: "K",
        content: "",
      },
    ],
  },
  {
    id: "54",
    cells: [
      {
        id: "A",
        content: "MorPhiC nominations (1010 genes/loci)",
      },
      {
        id: "B",
        content: "",
      },
      {
        id: "C",
        content: "",
      },
      {
        id: "D",
        content: "",
      },
      {
        id: "E",
        content: (
          <CellLink>
            https://github.com/morphic-bio/morphic-bio.github.io/blob/main/gene_list.csv
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
        content: "",
      },
    ],
  },
];

export default function GenesLoci() {
  return (
    <div>
      <PagePreamble pageTitle="Genes / Loci" />
      <div role="table" className="overflow-x-auto text-sm">
        <DataTable data={dataGrid} />
      </div>
    </div>
  );
}
