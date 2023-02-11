// node_modules
import PropTypes from "prop-types";
import { useContext } from "react";
// components
import { DataPanel } from "./data-area";
import GlobalContext from "./global-context";

/**
 * Display a message on a collection page indicating that no viewable collection data exists.
 */
export default function NoCollectionData({ pageTitle = "" }) {
  const { page } = useContext(GlobalContext);

  return (
    <DataPanel className="my-0.5">
      <div className="text-center italic">
        No {pageTitle || page.title} to display
      </div>
    </DataPanel>
  );
}

NoCollectionData.propTypes = {
  // Page title to display in the message if not using pageTitle props from getServerSideProps()
  pageTitle: PropTypes.string,
};
