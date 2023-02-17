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

export default function File({ item: file, accessoryData }) {
  const titleElements = [file.file_format, file.content_type];
  const lab = accessoryData?.[file.lab];
  const summary = file.summary;

  return (
    <SearchListItemContent>
      <SearchListItemMain>
        <SearchListItemUniqueId>
          <SearchListItemType item={file} />
          {file.accession}
        </SearchListItemUniqueId>
        <SearchListItemTitle>{titleElements.join(" - ")}</SearchListItemTitle>
        {(summary || lab) && (
          <SearchListItemMeta>
            {lab && <div key="lab">{lab.title}</div>}
            {summary && <div key="summary">{summary}</div>}
          </SearchListItemMeta>
        )}
      </SearchListItemMain>
      <SearchListItemStatus item={file} />
    </SearchListItemContent>
  );
}

File.propTypes = {
  // Single biosample-derived search-result object to display on a search-result list page
  item: PropTypes.object.isRequired,
  // Accessory data to display for all search-result objects
  accessoryData: PropTypes.object,
};

File.getAccessoryDataPaths = (files) => {
  const labs = files.map((file) => file.lab);
  return labs;
};
