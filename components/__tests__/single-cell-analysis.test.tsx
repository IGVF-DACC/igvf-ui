import { render, screen } from "@testing-library/react";
import type { MatrixBucket, MatrixResultsObject } from "../../lib/matrix";
import Analysis from "../../pages/single-cell/analysis";

jest.mock("../data-table", () => ({
  DataTable: ({ data }: { data: Array<{ id: string }> }) => (
    <div data-testid="data-table">{data.map((row) => row.id).join(",")}</div>
  ),
}));

jest.mock("../no-collection-data", () => ({
  __esModule: true,
  default: () => <div>No collection data</div>,
}));

jest.mock("../page-preamble", () => ({
  __esModule: true,
  default: () => <div>Page preamble</div>,
}));

function wrapper(buckets: MatrixBucket[]) {
  return {
    doc_count_error_upper_bound: 0,
    sum_other_doc_count: 0,
    buckets,
  };
}

function createSampleClassBucket({
  classification,
  startingTerm,
  targetedTerms,
}: {
  classification: string;
  startingTerm: string;
  targetedTerms: string[];
}): MatrixBucket {
  return {
    key: classification,
    doc_count: targetedTerms.length,
    "samples.sample_terms.term_name": wrapper([
      {
        key: startingTerm,
        doc_count: targetedTerms.length,
        "samples.targeted_sample_term.term_name": wrapper(
          targetedTerms.map((targetedTerm) => ({
            key: targetedTerm,
            doc_count: 1,
            preferred_assay_titles: wrapper([
              { key: "scRNA-seq", doc_count: 1 },
            ]),
          }))
        ),
      },
    ]),
  };
}

function createMatrix(sampleClassBuckets: MatrixBucket[]): MatrixResultsObject {
  return {
    x: {
      group_by: "preferred_assay_titles",
      doc_count: 1,
      preferred_assay_titles: wrapper([
        { key: "scRNA-seq", doc_count: 1 },
      ]),
    },
    y: {
      group_by: [
        "samples_class",
        "samples.sample_terms.term_name",
        "samples.targeted_sample_term.term_name",
      ],
      doc_count: 1,
      samples_class: wrapper(sampleClassBuckets),
    },
  };
}

function renderAnalysis(matrix: MatrixResultsObject) {
  return render(
    <Analysis
      matrix={matrix}
      isJson={false}
      pageContext={{ title: "Single Cell Analysis" }}
    />
  );
}

describe("single-cell analysis matrix", () => {
  it("shows the empty state when sample terms have no leaf rows", () => {
    const matrix = createMatrix([
      createSampleClassBucket({
        classification: "organoid",
        startingTerm: "induced pluripotent stem cell",
        targetedTerms: [],
      }),
    ]);

    renderAnalysis(matrix);

    expect(screen.getByText("No collection data")).toBeInTheDocument();
    expect(screen.queryByTestId("data-table")).not.toBeInTheDocument();
  });

  it("omits classifications without leaf rows from a nonempty matrix", () => {
    const matrix = createMatrix([
      createSampleClassBucket({
        classification: "organoid",
        startingTerm: "empty starting term",
        targetedTerms: [],
      }),
      createSampleClassBucket({
        classification: "primary cell",
        startingTerm: "bone marrow",
        targetedTerms: ["bone marrow"],
      }),
    ]);

    renderAnalysis(matrix);

    const table = screen.getByTestId("data-table");
    expect(table).toHaveTextContent("header,primary-cell,bone-marrow");
    expect(table).not.toHaveTextContent("organoid");
  });
});
