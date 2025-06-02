// node_modules
import PropTypes from "prop-types";
// components
import Link from "./link-no-prefetch";
// lib
import { pathToType } from "../lib/general";

// We want ideally: ABCAM - CD7348 - 11100020
// <Link href="source.url">{source.name} - {productId} - {lotId}</Link>
// If no url, then `{source.name} - {productId} - {lotId}`
// We know if we have a lotId, then we have a productId
export default function ProductInfo({
  sources = [],
  productId = null,
  lotId = null,
}) {
  const prodLot = lotId ? `${productId} (${lotId})` : productId;
  if (sources.length > 0) {
    const sourceType = pathToType(sources[0]["@id"]);
    if (sourceType === "sources") {
      return (
        <>
          {sources[0].url ? (
            <>
              <Link href={sources[0].url}>{sources[0].name}</Link> {prodLot}
            </>
          ) : (
            <>
              {sources[0].name} {prodLot}
            </>
          )}
        </>
      );
    }
    if (sourceType === "labs") {
      return (
        <>
          <Link href={sources[0]["@id"]}>{sources[0].title}</Link> {prodLot}
        </>
      );
    }
  }
  return <>{prodLot}</>;
}

ProductInfo.propTypes = {
  // Source
  sources: PropTypes.arrayOf(PropTypes.object),
  // Product ID
  productId: PropTypes.string,
  // Lot ID
  lotId: PropTypes.string,
};
