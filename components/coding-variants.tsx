// node_modules
import { useRouter } from "next/router";
import { ReactNode } from "react";
// components
import { DataPanel } from "./data-area";
import { TabGroup, TabList, TabPanes, TabPane, TabTitle } from "./tabs";

/**
 * Mapping from tab IDs to their corresponding paths.
 */
const IdToPathMap: Record<string, string> = {
  "analysis-content": "/coding-variants/analysis",
  "prediction-content": "/coding-variants/prediction",
};

/**
 * Layout component for the Coding Variants pages. It includes a tab navigation for "Analysis" and
 * "Prediction" sections.
 *
 * @param pageId - ID of the current page's tab
 */
export function CodingVariantsLayout({
  pageId,
  children,
}: {
  pageId: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function tabClickHandler(tabId: string) {
    const path = IdToPathMap[tabId];
    if (path) {
      void router.push({
        pathname: path,
        query: router.query,
      });
    }
  }

  return (
    <DataPanel className="@container mt-8 pt-0" isPaddingSuppressed>
      <TabGroup selectedId={pageId} onChange={tabClickHandler}>
        <TabList className="border-tab-group border-b">
          <TabTitle id="analysis-content">Analysis</TabTitle>
          <TabTitle id="prediction-content">Prediction</TabTitle>
        </TabList>
        <TabPanes>
          <TabPane>{pageId === "analysis-content" ? children : null}</TabPane>
          <TabPane>{pageId === "prediction-content" ? children : null}</TabPane>
        </TabPanes>
      </TabGroup>
    </DataPanel>
  );
}
