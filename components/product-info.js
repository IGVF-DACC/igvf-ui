import PropTypes from "prop-types";
import Link from "next/link";
import { pathToType } from "../lib/general";

// We want ideally: ABCAM - CD7348 - 11100020
// <Link href="source.url">{source.name} - {productId} - {lotId}</Link>
// If no url, then `{source.name} - {productId} - {lotId}`
// We know if we have a lotId, then we have a productId
export default function ProductInfo({ source, productId, lotId }) {
  const content = [];
  const prodLot = lotId ? `${productId} (${lotId})` : "";
  if (lotId) {
    // If we have a lotId, then we will also have a productId
    content.push(productId);
    content.push(lotId);
  }
  if (source) {
    const sourceType = pathToType(source["@id"]);
    if (sourceType == "sources") {
      content.unshift(source.name);
      return (
        <>
          {source.url ? (
            <>
              <Link href={source.url}>{source.name}</Link> {prodLot}
            </>
          ) : (
            <>
              {source.name} {prodLot}
            </>
          )}
        </>
      );
    }
    if (sourceType == "labs") {
      return (
        <>
          <Link href={source["@id"]}>{source.title}</Link> {prodLot}
        </>
      );
    }
  }
  return <>{prodLot}</>;
}

ProductInfo.propTypes = {
  // Source
  source: PropTypes.object,
  // Product ID
  productId: PropTypes.string,
  // Lot ID
  lotId: PropTypes.string,
};
