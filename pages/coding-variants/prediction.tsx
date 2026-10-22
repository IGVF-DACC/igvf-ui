// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import PagePreamble from "../../components/page-preamble";
import { SearchList } from "../../components/search";
// lib
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import { type PredictionSetObject } from "../../lib/file-sets";
import { type PageProps } from "../../lib/next-js";
import { encodeUriElement } from "../../lib/query-encoding";
// root
import { type SearchQuickResults } from "../../globals";

/**
 * Props for the Coding Variants page component from the server-side request.
 */
interface CodingVariantsProps extends PageProps {
  predictions: PredictionSetObject[];
}

/**
 * Query values for software_versions.software.title elements in the query string.
 */
const softwareVersionTitles = [
  "ExCALIBR",
  "MutPred2",
  "Biobank validation of variant classifications",
  "Calibration of computational tools for missense variant pathogenicity classification and ClinGen recommendations for PP3/BP4 criteria",
  "ESM-1v",
];

/**
 * Query string for the software_versions.software.title elements.
 */
const softwareVersionQuery = softwareVersionTitles
  .map((title) => `software_versions.software.title=${encodeUriElement(title)}`)
  .join("&");

/**
 * Query values for file_set_type elements in the query string.
 */
const fileSetTypes = [
  "coding variants pathogenicity",
  "coding variant effects",
];

/**
 * Query string for the file_set_type elements.
 */
const fileSetTypeQuery = fileSetTypes
  .map((type) => `file_set_type=${encodeUriElement(type)}`)
  .join("&");

/**
 * Base query string for the Prediction page matrix requests.
 */
const BASE_QUERY = `type=PredictionSet&status=released&${softwareVersionQuery}&${fileSetTypeQuery}`;

export default function CodingVariantsPage({
  predictions,
}: CodingVariantsProps) {
  return (
    <>
      <PagePreamble />
      <div className="@container mt-8">
        <SearchList
          items={predictions}
          className="grid gap-x-1.5 @3xl:grid-cols-2"
          isItemMarginTrimmed={false}
        />
      </div>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<CodingVariantsProps>> {
  const { req } = context;

  const request = new FetchRequest({ cookie: req.headers.cookie });
  const predictions = (
    await request.getObject<SearchQuickResults<PredictionSetObject>>(
      `/search-quick/?${BASE_QUERY}`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(predictions)) {
    return {
      props: {
        predictions: predictions["@graph"],
        pageContext: {
          title: "Coding Variants",
        },
        isJson: false,
      },
    };
  }
  return errorObjectToProps(predictions);
}
