// node_modules
import { useRouter } from "next/router";
import { ReactNode } from "react";
// components
import { DataPanel } from "./data-area";
import { TabGroup, TabList, TabTitle } from "./tabs";

/**
 * Mapping from tab IDs to their corresponding paths.
 */
const IdToPathMap: Record<string, string> = {
  "analysis-content": "/coding-variants/analysis",
  "prediction-content": "/coding-variants/prediction",
};

/**
 * Layout component for the Coding Variants pages.
 * It includes a tab navigation for "Analysis" and "Prediction" sections.
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
      void router.push(path);
    }
  }

  return (
    <DataPanel className="@container mt-8 pt-0">
      <TabGroup defaultId={pageId} onChange={tabClickHandler}>
        <TabList>
          <TabTitle id="analysis-content">Analysis</TabTitle>
          <TabTitle id="prediction-content">Prediction</TabTitle>
        </TabList>
        {children}
      </TabGroup>
    </DataPanel>
  );
}
