/* eslint-disable @next/next/no-img-element */
// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMain,
  SearchListItemMeta,
  SearchListItemQuality,
  SearchListItemSupplement,
  SearchListItemSupplementContent,
  SearchListItemSupplementLabel,
  SearchListItemSupplementSection,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";
// components
import SessionContext from "../../../components/session-context";
// lib
import { UC } from "../../../lib/constants";

export default function ImageItem({ item, accessoryData = null }) {
  const { dataProviderUrl } = useContext(SessionContext);

  // `item` holds an image object with little data; get image object from accessory data.
  const image = accessoryData?.[item["@id"]];
  const attachment = image?.attachment;
  const imageUrl = dataProviderUrl
    ? `${dataProviderUrl}${image.download_url}`
    : "";

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={item} />
          {image?.uuid || item["@id"]}
        </SearchListItemUniqueId>
        <SearchListItemTitle>
          <div className="break-anywhere">
            {attachment?.download || item["@id"]}
          </div>
        </SearchListItemTitle>
        {((attachment?.width && attachment?.height) || attachment?.type) && (
          <SearchListItemMeta>
            <span key="type">{attachment.type}</span>
            <span key="size">
              {attachment.width} {UC.times} {attachment.height}
            </span>
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      {imageUrl && (
        <SearchListItemSupplement>
          <SearchListItemSupplementSection>
            <SearchListItemSupplementLabel>
              Preview
            </SearchListItemSupplementLabel>
            <SearchListItemSupplementContent>
              <div className="max-h-40 w-full max-w-sm">
                <div className="relative h-full w-full">
                  <div className="inline-block border border-data-border bg-white">
                    <img
                      src={imageUrl}
                      alt={`Preview image of ${image.summary}`}
                      className="h-auto max-h-40 w-full object-contain object-left-top"
                    />
                  </div>
                </div>
              </div>
            </SearchListItemSupplementContent>
          </SearchListItemSupplementSection>
        </SearchListItemSupplement>
      )}
      {image && <SearchListItemQuality item={image} />}
    </SearchListItemContent>
  );
}

ImageItem.propTypes = {
  // Single image search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

ImageItem.getAccessoryDataPaths = (items) => {
  // The data provider includes nearly no image properties in the search results, so we need to
  // fetch image objects as accessory data.
  return [
    {
      type: "Image",
      paths: items.map((item) => item["@id"]),
      fields: ["attachment", "download_url", "status", "summary", "uuid"],
    },
  ];
};
