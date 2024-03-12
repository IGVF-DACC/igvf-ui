import { fireEvent, render, screen, within } from "@testing-library/react";
import SortableGrid from "../sortable-grid";

const data = [
  {
    accession: "ENCBS697LCA",
    age: 14,
    biosample_ontology: {
      term_name: "HepG2",
      classification: "cell line",
    },
    date_obtained: "2021-09-15",
    description:
      "RNA-seq on HepG2 cells treated with a CRISPR gRNA against DDX18. (DDX18-BGHcLV29-72)",
    life_stage: "child",
    organism: {
      scientific_name: "Homo sapiens",
    },
    status: "released",
    uuid: "43fbe319-22f3-4c7c-a9ac-aa99f905dc5a",
  },
  {
    accession: "ENCBS255XED",
    age: 9,
    biosample_ontology: {
      term_name: "K562",
      classification: "cell line",
    },
    description:
      "RNA-seq on K562 cells treated with a CRISPR gRNA against RIOK2. (RIOK2-BGKcLV30-36)",
    life_stage: "adult",
    organism: {
      scientific_name: "Homo sapiens",
    },
    status: "released",
    uuid: "74a0dda3-ea39-459b-b309-52b302638cde",
  },
];

function CustomDescriptionHeader() {
  return <div className="bg-slate-100">Description</div>;
}

describe("SortableGrid", () => {
  it("renders a two-column sortable table", () => {
    const columns = [
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "biosample_ontology",
        title: "Biosample",
        value: (item) =>
          `${item.biosample_ontology.term_name} / ${item.biosample_ontology.classification}`,
      },
      {
        id: "description",
        title: "Description",
        isSortable: false,
      },
      {
        id: "date_obtained",
        title: "Date Obtained",
      },
    ];

    render(<SortableGrid data={data} columns={columns} />);

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const headers = within(table).getAllByRole("columnheader");
    expect(headers).toHaveLength(4);
    let cells = within(table).getAllByRole("cell");
    expect(cells).toHaveLength(8);

    expect(headers[0]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "1 / 2" });
    expect(headers[1]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "2 / 3" });
    expect(headers[2]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "3 / 4" });
    expect(headers[3]).toHaveStyle({ gridRow: "1 / 2", gridColumn: "4 / 5" });
    expect(cells[0]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "1 / 2" });
    expect(cells[1]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "2 / 3" });
    expect(cells[2]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "3 / 4" });
    expect(cells[3]).toHaveStyle({ gridRow: "2 / 3", gridColumn: "4 / 5" });
    expect(cells[4]).toHaveStyle({ gridRow: "3 / 4", gridColumn: "1 / 2" });
    expect(cells[5]).toHaveStyle({ gridRow: "3 / 4", gridColumn: "2 / 3" });
    expect(cells[6]).toHaveStyle({ gridRow: "3 / 4", gridColumn: "3 / 4" });
    expect(cells[7]).toHaveStyle({ gridRow: "3 / 4", gridColumn: "4 / 5" });

    const sortableHeaders = within(table).getAllByRole("button");
    expect(sortableHeaders).toHaveLength(3);

    // Before clicking a header cell to change sorting.
    expect(cells[0]).toHaveTextContent("ENCBS255XED");
    expect(cells[1]).toHaveTextContent("K562 / cell line");
    expect(cells[2]).toHaveTextContent("RNA-seq on K562");
    expect(cells[3]).not.toHaveValue();
    expect(cells[4]).toHaveTextContent("ENCBS697LCA");
    expect(cells[5]).toHaveTextContent("HepG2 / cell line");
    expect(cells[6]).toHaveTextContent("RNA-seq on HepG2");
    expect(cells[7]).toHaveTextContent("2021-09-15");

    // Click the accession header.
    let headerButton = within(headers[0]).getByRole("button");
    fireEvent.click(headerButton);
    cells = within(table).getAllByRole("cell");

    // Make sure it now sorts by accession, descending.
    expect(cells[0]).toHaveTextContent("ENCBS697LCA");
    expect(cells[1]).toHaveTextContent("HepG2 / cell line");
    expect(cells[2]).toHaveTextContent("RNA-seq on HepG2");
    expect(cells[3]).toHaveTextContent("2021-09-15");
    expect(cells[4]).toHaveTextContent("ENCBS255XED");
    expect(cells[5]).toHaveTextContent("K562 / cell line");
    expect(cells[6]).toHaveTextContent("RNA-seq on K562");
    expect(cells[7]).not.toHaveValue();

    // Click the biosample header.
    headerButton = within(headers[1]).getByRole("button");
    fireEvent.click(headerButton);
    cells = within(table).getAllByRole("cell");

    // Make sure it sorts by biosample, ascending.
    expect(cells[0]).toHaveTextContent("ENCBS697LCA");
    expect(cells[1]).toHaveTextContent("HepG2 / cell line");
    expect(cells[2]).toHaveTextContent("RNA-seq on HepG2");
    expect(cells[3]).toHaveTextContent("2021-09-15");
    expect(cells[4]).toHaveTextContent("ENCBS255XED");
    expect(cells[5]).toHaveTextContent("K562 / cell line");
    expect(cells[6]).toHaveTextContent("RNA-seq on K562");
    expect(cells[7]).not.toHaveValue();

    // Click the biosample header again.
    fireEvent.click(headerButton);
    cells = within(table).getAllByRole("cell");

    // Make sure it sorts by biosample, descending.
    expect(cells[0]).toHaveTextContent("ENCBS255XED");
    expect(cells[1]).toHaveTextContent("K562 / cell line");
    expect(cells[2]).toHaveTextContent("RNA-seq on K562");
    expect(cells[3]).not.toHaveValue();
    expect(cells[4]).toHaveTextContent("ENCBS697LCA");
    expect(cells[5]).toHaveTextContent("HepG2 / cell line");
    expect(cells[6]).toHaveTextContent("RNA-seq on HepG2");
    expect(cells[7]).toHaveTextContent("2021-09-15");
  });

  it("renders a table with a custom sorting function", () => {
    const columns = [
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "biosample_ontology",
        title: "Biosample",
        value: (item) =>
          `${item.biosample_ontology.term_name} / ${item.biosample_ontology.classification}`,
      },
      {
        id: "age",
        title: "Age",
        sorter: (item) => Number(item.age),
      },
      {
        id: "description",
        title: "Description",
        isSortable: false,
      },
    ];

    render(<SortableGrid data={data} columns={columns} keyProp="uuid" />);

    let cells = screen.getAllByRole("cell");
    expect(cells[2]).toHaveTextContent("9");
    expect(cells[6]).toHaveTextContent("14");

    // Click the Age column header.
    const ageColumnHeader = screen.getByRole("columnheader", { name: "Age" });
    const ageSortButton = within(ageColumnHeader).getByRole("button");
    fireEvent.click(ageSortButton);

    // Make sure it sorts by age, ascending.
    cells = screen.getAllByRole("cell");
    expect(cells[2]).toHaveTextContent("9");
    expect(cells[6]).toHaveTextContent("14");

    // Click the Age column header again.
    fireEvent.click(ageSortButton);

    // Make sure it sorts by age, descending.
    cells = screen.getAllByRole("cell");
    expect(cells[2]).toHaveTextContent("14");
    expect(cells[6]).toHaveTextContent("9");

    // Click the Age column header yet again.
    fireEvent.click(ageSortButton);

    // Make sure it returns to sorting by age, ascending.
    cells = screen.getAllByRole("cell");
    expect(cells[2]).toHaveTextContent("9");
    expect(cells[6]).toHaveTextContent("14");
  });

  it("Renders a custom header component", () => {
    const columns = [
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "description",
        title: <CustomDescriptionHeader />,
      },
    ];

    render(
      <SortableGrid
        data={data}
        columns={columns}
        keyProp="uuid"
        initialSort={{ columnId: "doesnt_exist", isSortingSuppressed: true }}
        pager={{}}
      />
    );

    const headers = screen.getAllByRole("columnheader");
    const descriptionDiv = within(headers[1]).getByText("Description");
    expect(descriptionDiv).toHaveClass("bg-slate-100");
  });

  it("hides columns conditionally", () => {
    const columns = [
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "description",
        title: "Description",
        hide: (data, columns, meta) => meta.isSmallViewport,
      },
    ];

    render(
      <SortableGrid
        data={data}
        columns={columns}
        meta={{ isSmallViewport: true }}
        keyProp="uuid"
      />
    );

    const headers = screen.getAllByRole("columnheader");
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent("Accession");
  });
});

describe("Test the pager", () => {
  it("renders a pager", () => {
    const columns = [
      {
        id: "accession",
        title: "Accession",
      },
      {
        id: "description",
        title: "Description",
      },
    ];

    render(
      <SortableGrid
        data={data}
        columns={columns}
        keyProp="uuid"
        pager={{ maxItemsPerPage: 1 }}
      />
    );

    const pager = screen.getByRole("navigation");
    expect(pager).toBeInTheDocument();

    const pageButtons = within(pager).getAllByRole("button");
    expect(pageButtons).toHaveLength(4);
    expect(pageButtons[1]).toHaveTextContent("1");
    expect(pageButtons[2]).toHaveTextContent("2");

    // Click the right arrow to go to the next page.
    fireEvent.click(pageButtons[3]);

    // Make sure the right arrow button is disabled and the left arrow button is enabled.
    expect(pageButtons[0]).not.toBeDisabled();
    expect(pageButtons[3]).toBeDisabled();
  });
});
