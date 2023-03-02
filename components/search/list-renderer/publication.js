// node_modules
import PropTypes from "prop-types";
// components/search/list-renderer
import {
  SearchListItemContent,
  SearchListItemMeta,
  SearchListItemMain,
  SearchListItemQuality,
  SearchListItemTitle,
  SearchListItemType,
  SearchListItemUniqueId,
} from "./search-list-item";

export default function Publication({ item: publication }) {
  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={publication} />
          {publication.identifiers[0]}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{publication.title}</SearchListItemTitle>
        <SearchListItemMeta>
          <div key="lab">{publication.lab.title}</div>
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
              {publication.page ? `:${publication.page}.` : <span>&nbsp;</span>}
            </div>
          )}
        </SearchListItemMeta>
      </SearchListItemMain>
      <SearchListItemQuality item={publication} />
    </SearchListItemContent>
  );
}

Publication.propTypes = {
  // Single publication search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
};
