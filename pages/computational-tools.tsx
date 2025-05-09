// node_modules
import _ from "lodash";
import Link from "next/link";
// components
import { DataTable } from "../components/data-table";
import PagePreamble from "../components/page-preamble";
import SeparatedList from "../components/separated-list";
// lib
import { requestPublications } from "../lib/common-requests";
import { type DataTableFormat, type Row } from "../lib/data-table";
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { toShishkebabCase } from "../lib/general";
// root
import type {
  DatabaseObject,
  PublicationObject,
  SearchResults,
  SoftwareObject,
} from "../globals";

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
 * Generates DataTable rows for each software object within a category. These rows exist as child
 * rows of a category row.
 * @param items Software objects to be converted to rows
 * @returns DataTable rows for the software objects; children of a category row
 */
function generateRowsInCategory(
  items: SoftwareObject[],
  publications: PublicationObject[]
): Row[] {
  return items.map((item) => {
    const titleAsId = toShishkebabCase(item.title);

    return {
      id: `${titleAsId}-row`,
      cells: [
        {
          id: `${titleAsId}-tool`,
          content: item.title,
        },
        {
          id: `${titleAsId}-purpose`,
          content: item.description,
        },
        {
          id: `${titleAsId}-publications`,
          content: (
            <PublicationCell
              softwarePublications={item.publications}
              publications={publications}
            />
          ),
        },
      ],
    };
  });
}

/**
 * Converts an array of software objects into a format that `<DataTable>` can render. Each software
 * object is grouped by its category. As software objects can have multiple categories, a software
 * object can appear multiple times in the table under different categories.
 * @param software Publication object fragments associated with a software object
 * @param publications Full publication objects associated with all software objects
 * @returns DataTable rows for the software objects
 */
function convertSoftwareToDataTable(
  software: SoftwareObject[],
  publications: PublicationObject[]
): DataTableFormat {
  const softwareByCategory = groupByCategories(software);
  const tableData: Row[] = [];
  Object.entries(softwareByCategory).forEach(([category, items]) => {
    const itemRows = generateRowsInCategory(items, publications);
    tableData.push({
      id: `${toShishkebabCase(category)}-row`,
      cells: [
        {
          id: `${toShishkebabCase(category)}-category`,
          content: category,
          childRows: itemRows,
        },
      ],
    });
  });
  return tableData;
}

/**
 * Renders a cell containing comma-separated links to publication pages. `softwarePublications` is
 * an array of objects only containing the publication `@id` associated with a software object.
 * `publications` is an array of full publication objects associated with all software objects
 * displayed on this page.
 * @param softwarePublications Publication paths associated with a software object
 * @param publications Full publication objects associated with all software objects
 */
function PublicationCell({
  softwarePublications,
  publications,
}: {
  softwarePublications: PublicationObject[];
  publications: PublicationObject[];
}) {
  if (softwarePublications) {
    return (
      <SeparatedList>
        {softwarePublications.map((publicationFragment) => {
          const publication = publications.find(
            (publication) => publication["@id"] === publicationFragment["@id"]
          );
          return (
            <Link key={publication["@id"]} href={publication["@id"]}>
              {publication.title}
            </Link>
          );
        })}
      </SeparatedList>
    );
  }
}

/**
 * Main page component for the Computational Tools page. It fetches software and publication data from
 * the server and passes it to the `DataTable` component for rendering. The software data is grouped by
 * categories, and each category is a header cell with child rows for each software object in that
 * category.
 */
export default function ComputationalTools({
  software,
  publications,
}: {
  software: SoftwareObject[];
  publications: PublicationObject[];
}) {
  const tableData = convertSoftwareToDataTable(software, publications);
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
  const response = (
    await request.getObject(
      "/report/?type=Software&categories=*&field=%40id&field=categories&field=description&field=source_url&field=title&field=publications.@id"
    )
  ).union();
  if (FetchRequest.isResponseSuccess(response)) {
    const softwareResults = response as DatabaseObject as SearchResults;
    const software = softwareResults["@graph"] as SoftwareObject[];

    // Get the publication object paths for the software objects.
    const publicationPaths = software.reduce((acc, item) => {
      if (item.publications) {
        const paths = item.publications.map((pub) => pub["@id"]);
        return acc.concat(paths);
      }
      return acc;
    }, [] as string[]);
    const uniquePublicationPaths = [...new Set(publicationPaths)];

    // Fetch the publication objects.
    const publications =
      uniquePublicationPaths.length > 0
        ? ((await requestPublications(
            uniquePublicationPaths,
            request
          )) as PublicationObject[])
        : [];

    return {
      props: {
        software,
        publications,
        pageContext: { title: "Computational Tools" },
      },
    };
  }
  return errorObjectToProps(response);
}
