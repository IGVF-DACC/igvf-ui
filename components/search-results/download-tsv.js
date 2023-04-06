import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { API_URL } from "../../lib/constants";
import { ButtonLink } from "../form-elements";

export default function DownloadTSV() {
  const currentQuery = window.location.search;
  const link = new URL(`${API_URL}/report.tsv${currentQuery}`).toString();
  return (
    <ButtonLink href={link} hasIconOnly={true} label="Download report as TSV">
      <DocumentArrowDownIcon strokeWidth={2} />
    </ButtonLink>
  );
}
