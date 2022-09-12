import { render, screen } from "@testing-library/react";
import DbxrefList from "../dbxref-list";

describe("Test the conversion of dbxref strings to links", () => {
  it("converts Cellosaurus dbxrefs to links correctly", () => {
    const dbxrefs = ["Cellosaurus:CEL-01"];
    const expected = "https://web.expasy.org/cellosaurus/CEL-01";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts DepMap dbxrefs to links correctly", () => {
    const dbxrefs = ["DepMap:ACH-123456"];
    const expected = "https://depmap.org/portal/cell_line/ACH-123456";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts human ENSEMBL dbxrefs to links correctly", () => {
    const dbxrefs = ["ENSEMBL:ENSG00000158473"];
    const expected =
      "http://www.ensembl.org/Homo_sapiens/Gene/Summary?g=ENSG00000158473";

    render(<DbxrefList dbxrefs={dbxrefs} meta={{ taxa: "Homo sapiens" }} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts mouse ENSEMBL dbxrefs to links correctly", () => {
    const dbxrefs = ["ENSEMBL:ENSMUSG00000045345"];
    const expected =
      "http://www.ensembl.org/Mus_musculus/Gene/Summary?g=ENSMUSG00000045345";

    render(<DbxrefList dbxrefs={dbxrefs} meta={{ taxa: "Mus musculus" }} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts unspecified taxa ENSEMBL dbxrefs to a text string correctly", () => {
    const dbxrefs = ["ENSEMBL:ENSG00000158473"];
    const expected = "ENSEMBL:ENSG00000158473";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const noElements = screen.queryByRole("link");
    expect(noElements).toBeNull();
    const dbxrefElements = screen.getAllByText(expected);
    expect(dbxrefElements).toHaveLength(1);
  });

  it("converts GeneCards dbxrefs to links correctly", () => {
    const dbxrefs = ["GeneCards:BAP1"];
    const expected = "http://www.genecards.org/cgi-bin/carddisp.pl?gene=BAP1";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts GEO dbxrefs to links correctly", () => {
    const dbxrefs = ["GEO:GSM798326", "GEO:SAMN45"];
    const expected =
      "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSM798326";
    const expectedSAMN = "https://www.ncbi.nlm.nih.gov/biosample/SAMN45";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(2);
    expect(dbxrefElements[0].href).toBe(expected);
    expect(dbxrefElements[1].href).toBe(expectedSAMN);
  });

  it("converts HGNC dbxrefs to links correctly", () => {
    const dbxrefs = ["HGNC:1637"];
    const expected =
      "https://www.genenames.org/cgi-bin/gene_symbol_report?hgnc_id=1637";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts IMGT/GENE-DB dbxrefs to links correctly", () => {
    const dbxrefs = ["IMGT/GENE-DB:CD1D"];
    const expected =
      "http://www.imgt.org/IMGT_GENE-DB/GENElect?species=Homo+sapiens&query=2+CD1D";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts MGI dbxrefs to links correctly", () => {
    const dbxrefs = ["MGI:3040700"];
    const expected = "http://www.informatics.jax.org/marker/MGI:3040700";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts MIM dbxrefs to links correctly", () => {
    const dbxrefs = ["MIM:603089"];
    const expected = "https://www.ncbi.nlm.nih.gov/omim/603089";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts miRBase dbxrefs to links correctly", () => {
    const dbxrefs = ["miRBase:MI0000252"];
    const expected =
      "http://www.mirbase.org/cgi-bin/mirna_entry.pl?acc=MI0000252";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts RefSeq dbxrefs to links correctly", () => {
    const dbxrefs = ["RefSeq:NM_004656.4"];
    const expected = "https://www.ncbi.nlm.nih.gov/nuccore/NM_004656.4";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts UniProtKB dbxrefs to links correctly", () => {
    const dbxrefs = ["UniProtKB:Q92560"];
    const expected = "http://www.uniprot.org/uniprot/Q92560";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });

  it("converts Vega dbxrefs to links correctly", () => {
    const dbxrefs = ["Vega:OTTHUMG00000158392"];
    const expected = "http://vega.sanger.ac.uk/id/OTTHUMG00000158392";

    render(<DbxrefList dbxrefs={dbxrefs} />);
    const dbxrefElements = screen.getAllByRole("link");
    expect(dbxrefElements).toHaveLength(1);
    expect(dbxrefElements[0].href).toBe(expected);
  });
});
