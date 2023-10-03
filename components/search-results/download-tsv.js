// node modules
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
// components
import { ButtonLink } from "../form-elements";
// lib
import { API_URL } from "../../lib/constants";

export default function DownloadTSV() {
  const currentQuery = window.location.search;
  const link = new URL(`${API_URL}/multireport.tsv${currentQuery}`).toString();
  return (
    <ButtonLink href={link} hasIconOnly={true} label="Download report as TSV">
      <DocumentArrowDownIcon strokeWidth={2} />
    </ButtonLink>
  );
}
