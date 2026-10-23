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
      void router.push(path);
    }
  }

  return (
    <DataPanel className="@container mt-8 pt-0" isPaddingSuppressed>
      <TabGroup defaultId={pageId} onChange={tabClickHandler}>
        <TabList className="border-tab-group border-b">
          <TabTitle id="analysis-content">Analysis</TabTitle>
          <TabTitle id="prediction-content">Prediction</TabTitle>
        </TabList>
        <div className="flex flex-col gap-6 p-4">{children}</div>
      </TabGroup>
    </DataPanel>
  );
}
