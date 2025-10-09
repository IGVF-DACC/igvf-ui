// components
import PageTitle from "./page-title";
import SiteTitle from "./site-title";
import { type SectionList } from "./section-directory";

/**
 * Put this at the top of any page that needs a tab title and an <h1> page title. Both the tab
 * title and <h1> usually come from the page props `title` property, usually from
 * `getServerSideProps()`. But for those cases where the page title needs data not available to the
 * Next.js server, use the `pageTitle` prop of this component to set the tab title and <h1> element.
 * In addition, this component also accepts a `styledTitle` prop that allows you to display a React
 * element as the <h1> title, allowing more than basic text as the <h1> title.
 * @param pageTitle - Text title of the page for the tab and <h1> element
 * @param styledTitle - React element to be used as the <h1> title instead of `pageTitle`
 * @param isTitleHidden - True to hide the <h1> title, false to show it
 * @param sections - Section information for the page; used in the section directory
 */
export default function PagePreamble({
  pageTitle = "",
  styledTitle = null,
  isTitleHidden = false,
  sections,
  children = null,
}: {
  pageTitle?: string;
  styledTitle?: React.ReactElement;
  isTitleHidden?: boolean;
  sections?: SectionList;
  children?: React.ReactNode;
}) {
  return (
    <>
      <SiteTitle pageTitle={pageTitle} />
      {!isTitleHidden && (
        <PageTitle pageTitle={styledTitle || pageTitle} sections={sections}>
          {children}
        </PageTitle>
      )}
    </>
  );
}
