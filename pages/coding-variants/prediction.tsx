// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// components
import { CodingVariantsLayout } from "../../components/coding-variants";
import NoCollectionData from "../../components/no-collection-data";
import PagePreamble from "../../components/page-preamble";
import { SearchList } from "../../components/search";
// lib
import { errorObjectToProps, generateErrorObject } from "../../lib/errors";
import FetchRequest, { HTTP_STATUS_CODE } from "../../lib/fetch-request";
import { type PredictionSetObject } from "../../lib/file-sets";
import { type PageProps } from "../../lib/next-js";
import { encodeUriElement } from "../../lib/query-encoding";
import { isSearchQuickResults } from "../../lib/search-results";
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

/**
 * Prediction page component for the Coding Variants prediction page.
 *
 * @param predictions - List of prediction sets to display
 */
export default function CodingVariantsPage({
  predictions,
}: CodingVariantsProps) {
  return (
    <>
      <PagePreamble />
      <CodingVariantsLayout pageId="prediction-content">
        {predictions.length > 0 ? (
          <SearchList
            items={predictions}
            className="grid gap-x-1.5 @3xl:grid-cols-2"
            isItemMarginTrimmed={false}
          />
        ) : (
          <div className="italic">
            No coding variants prediction sets available.
          </div>
        )}
      </CodingVariantsLayout>
    </>
  );
}

/**
 * Server-side request handler for the Coding Variants page prediction tab.
 *
 * @param context - Server-side request context
 * @returns Server-side props for the Coding Variants page prediction tab
 */
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
  if (
    FetchRequest.isResponseSuccess(predictions) &&
    isSearchQuickResults(predictions)
  ) {
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

  if (FetchRequest.isResponseSuccess(predictions)) {
    return errorObjectToProps(
      generateErrorObject(
        HTTP_STATUS_CODE.BAD_GATEWAY,
        "Invalid server response",
        "The server returned an invalid quick-search response.",
        "Expected the prediction results to contain an @graph array."
      )
    );
  }

  return errorObjectToProps(predictions);
}
