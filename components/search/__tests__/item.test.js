import { render, screen } from "@testing-library/react";
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
} from "../list-renderer/search-list-item";
import { SearchListItem } from "../../search";

describe("Test a search-list item", () => {
  it("should render a complete search-list item", () => {
    const term = {
      "@type": ["Term", "Item"],
      term_id: "Unique ID",
      term_name: "Term name",
      synonyms: ["Metadata"],
      status: "current",
      related_terms: ["Term A", "Term B", "Term C"],
    };

    render(
      <SearchListItem href="#" testid="/term/single-term/">
        <SearchListItemContent>
          <SearchListItemMain>
            <SearchListItemUniqueId>
              <SearchListItemType item={term} />
              {term.term_id}
            </SearchListItemUniqueId>
            <SearchListItemTitle>{term.term_name}</SearchListItemTitle>
            <SearchListItemMeta>
              <span>{term.synonyms.join(", ")}</span>
            </SearchListItemMeta>
          </SearchListItemMain>
          <SearchListItemSupplement>
            <SearchListItemSupplementSection>
              <SearchListItemSupplementLabel>
                Term Supplement
              </SearchListItemSupplementLabel>
              <SearchListItemSupplementContent>
                {term.related_terms.join(", ")}
              </SearchListItemSupplementContent>
            </SearchListItemSupplementSection>
          </SearchListItemSupplement>
          <SearchListItemQuality item={term} />
        </SearchListItemContent>
      </SearchListItem>
    );

    const uniqueId = screen.getByTestId("search-list-item-unique-id");
    expect(uniqueId).toHaveTextContent("Term");
    expect(uniqueId).toHaveTextContent("Unique ID");

    const title = screen.getByTestId("search-list-item-title");
    expect(title).toHaveTextContent("Term name");

    const meta = screen.getByTestId("search-list-item-meta");
    expect(meta).toHaveTextContent("Metadata");

    const supplement = screen.getByTestId("search-list-item-supplement");
    expect(supplement).toHaveTextContent("Term Supplement");

    const supplementContent = screen.getByTestId(
      "search-list-item-supplement-content"
    );
    expect(supplementContent).toHaveTextContent("Term A, Term B, Term C");
  });
});
