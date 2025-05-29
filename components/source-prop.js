// node_modules
import PropTypes from "prop-types";
// components
import Link from "./link-no-prefetch";
// lib
import { pathToType } from "../lib/general";

/**
 * The `source` property of sample objects can refer to either a `source` or `lab` object. Display
 * the source or lab name with a link either to the source URL or the lab page.
 */
export default function SourceProp({ source }) {
  const sourceType = pathToType(source["@id"]);
  if (sourceType === "sources") {
    return (
      <a href={source.url} target="_blank" rel="noreferrer">
        {source.title}
      </a>
    );
  }
  if (sourceType === "labs") {
    return <Link href={source["@id"]}>{source.title}</Link>;
  }
  return null;
}

SourceProp.propTypes = {
  // `source` or `lab` object to display a relevant link for
  source: PropTypes.shape({
    "@id": PropTypes.string.isRequired,
    title: PropTypes.string,
    url: PropTypes.string,
  }),
};
