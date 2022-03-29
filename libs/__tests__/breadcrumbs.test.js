import buildBreadcrumbContext from "../breadcrumbs"

describe("Test breadcrumb composition and rendering functionality", () => {
  it("builds a collection breadcrumb context properly", async () => {
    const labCollectionData = {
      "@graph": [],
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    }
    const breadcrumbContext = await buildBreadcrumbContext(
      labCollectionData,
      "title"
    )
    expect(breadcrumbContext).toHaveLength(1)
    expect(breadcrumbContext[0].title).toBe("Labs")
    expect(breadcrumbContext[0].href).toBe("/labs/")
  })

  it("builds an item breadcrumb context properly", async () => {
    // Mock lab collection retrieval.
    const mockCollectionData = {
      "@graph": [],
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    }
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockCollectionData),
      })
    )

    const labItemData = {
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      title: "J. Michael Cherry, Stanford",
    }

    const breadcrumbContext = await buildBreadcrumbContext(labItemData, "title")
    expect(breadcrumbContext).toHaveLength(2)
    expect(breadcrumbContext[0].title).toBe("Labs")
    expect(breadcrumbContext[0].href).toBe("/labs/")
    expect(breadcrumbContext[1].title).toBe("J. Michael Cherry, Stanford")
    expect(breadcrumbContext[0].href).toBe("/labs/")
  })
})
