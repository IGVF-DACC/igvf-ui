// node_modules
import { GetServerSidePropsContext } from "next";
// components
import PagePreamble from "../components/page-preamble";
// lib
import { errorObjectToProps } from "../lib/errors";
import FetchRequest from "../lib/fetch-request";
import { type AnalysisSetObject } from "../lib/file-sets";
import { type PageProps } from "../lib/next-js";
// root
import type { SearchResults } from "../globals";

/**
 * Props for the CodingVariants page component.
 *
 * @property matrix - Matrix results object containing the x and y axes of the data to be displayed
 * @property totalCount - Total number of datasets represented in the matrix
 */
interface CodingVariantProps extends PageProps {
  analysisSets: AnalysisSetObject[];
}

export default function CodingVariants({ analysisSets }: CodingVariantProps) {
  return (
    <>
      <PagePreamble />
      <pre className="text-xs">{JSON.stringify(analysisSets, null, 2)}</pre>
    </>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const results = (
    await request.getObject<SearchResults<AnalysisSetObject>>(
      "/search-quick/?type=AnalysisSet&status=released&file_set_type=principal+analysis&preferred_assay_slims=protein+scanning"
    )
  ).union();

  if (FetchRequest.isResponseSuccess(results)) {
    return {
      props: {
        analysisSets: results["@graph"],
        pageContext: { title: "Coding Variants" },
        isJson: false,
      },
    };
  }

  return errorObjectToProps(results);
}
