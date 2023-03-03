// node_modules
import PropTypes from "prop-types";
// components
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemStatus,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Publication({ item: publication, accessoryData }) {
  const lab = accessoryData?.[publication.lab];
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={publication} />
          {publication.identifiers[0]}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{publication.title}</SearchListItemTitle>
        {(lab ||
          publication.authors ||
          publication.journal ||
          publication.date_published) && (
          <SearchListItemMeta>
            {lab && <div key="lab">{lab.title}</div>}
            {publication.authors && (
              <div key="authors">{publication.authors}</div>
            )}
            {(publication.journal || publication.date_published) && (
              <div key="citation">
                {publication.journal ? <i>{publication.journal}. </i> : ""}
                {publication.date_published ? (
                  `${publication.date_published};`
                ) : (
                  <span>&nbsp;</span>
                )}
                {publication.volume ? publication.volume : ""}
                {publication.issue ? `(${publication.issue})` : ""}
                {publication.page ? (
                  `:${publication.page}.`
                ) : (
                  <span>&nbsp;</span>
                )}
              </div>
            )}
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={publication} />
    </SearchListItemContent>
  );
}

Publication.propTypes = {
  // Single publication search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

Publication.getAccessoryDataPaths = (publications) => {
  return publications.map((publication) => publication.lab);
};
