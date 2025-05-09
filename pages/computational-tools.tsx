// node_modules
import _ from "lodash";
// components
import { DataTable } from "../components/data-table";
import PagePreamble from "../components/page-preamble";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { toShishkebabCase } from "../lib/general";
// root
import type { SoftwareObject } from "../globals";

/**
 * Takes an array of software objects and groups them by their categories. The resulting object has
 * the category names as keys and arrays of software objects that have that category as values.
 * Each software object can have multiple categories, so one software object can appear under
 * multiple categories.
 * @param items Software objects to be grouped by categories.
 * @returns Software objects grouped by category
 */
function groupByCategories(
  items: SoftwareObject[]
): Record<string, SoftwareObject[]> {
  const softwareByCategory = items.reduce(
    (acc, item) => {
      item.categories.forEach((category) => {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
      });
      return acc;
    },
    {} as Record<string, SoftwareObject[]>
  );
  return softwareByCategory;
}

/**
 * Generates a DataTable row for each software object. These rows exist as child rows of a category
 * row.
 * @param items Software objects to be converted to rows
 * @returns DataTable rows for the software objects; children of a category row
 */
function generateRow(items: SoftwareObject[]) {
  return items.map((item) => {
    return {
      id: `${toShishkebabCase(item.title)}-row`,
      cells: [
        {
          id: `${toShishkebabCase(item.title)}-tool`,
          content: item.title,
        },
        {
          id: `${toShishkebabCase(item.title)}-purpose`,
          content: item.description,
        },
      ],
    };
  });
}

function convertSoftwareToDataTable(software: SoftwareObject[]) {
  const softwareByCategory = groupByCategories(software);
  const tableData = [];
  Object.entries(softwareByCategory).forEach(([category, items]) => {
    const itemRow = generateRow(items);
    tableData.push({
      id: `${toShishkebabCase(category)}-row`,
      cells: [
        {
          id: `${toShishkebabCase(category)}-category`,
          content: category,
          childRows: itemRow,
        },
      ],
    });
  });
  return tableData;
}

export default function ComputationalTools({
  software,
}: {
  software: SoftwareObject[];
}) {
  const tableData = convertSoftwareToDataTable(software);
  return (
    <div>
      <PagePreamble pageTitle="Computational Tools" />
      <div role="table" className="overflow-x-auto text-sm">
        <DataTable data={tableData} />
      </div>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const software = (
    await request.getObject(
      "/report/?type=Software&categories=*&field=%40id&field=categories&field=description&field=source_url&field=title&field=publications.@id"
    )
  ).union();
  if (FetchRequest.isResponseSuccess(software)) {
    return {
      props: {
        software: software["@graph"],
        pageContext: { title: "Computational Tools" },
      },
    };
  }
  return errorObjectToProps(software);
}
