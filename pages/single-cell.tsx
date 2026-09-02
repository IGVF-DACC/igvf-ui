// node_modules
import {
  type GetServerSidePropsContext,
  type GetServerSidePropsResult,
} from "next";
// lib
import FetchRequest from "../lib/fetch-request";
import { type MatrixResults } from "../lib/matrix";
import { errorObjectToProps } from "../lib/errors";

interface SingleCellProps {
  matrixData: MatrixResults;
}

export default function SingleCell({ matrixData }: SingleCellProps) {
  return (
    <pre className="text-sm">{JSON.stringify(matrixData.matrix, null, 2)}</pre>
  );
}

export async function getServerSideProps({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<SingleCellProps>
> {
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const matrixData = (
    await request.getObject<MatrixResults>(
      `/matrix/?type=AnalysisSet&config=SingleCellMatrixAnalysis`
    )
  ).union();
  if (FetchRequest.isResponseSuccess(matrixData)) {
    return {
      props: {
        matrixData,
      },
    };
  }
  return errorObjectToProps(matrixData);
}
