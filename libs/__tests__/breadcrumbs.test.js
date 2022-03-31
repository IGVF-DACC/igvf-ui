import buildBreadcrumbs from "../breadcrumbs"

describe("Test breadcrumb composition and rendering functionality", () => {
  it("builds a collection breadcrumb data properly", async () => {
    const labCollectionData = {
      "@graph": [],
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
    }
    const breadcrumbs = await buildBreadcrumbs(labCollectionData)
    expect(breadcrumbs).toHaveLength(1)
    expect(breadcrumbs[0].title).toBe("Labs")
    expect(breadcrumbs[0].href).toBe("/labs/")
  })

  it("builds an item breadcrumb data properly", async () => {
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

    const breadcrumbs = await buildBreadcrumbs(labItemData, "title")
    expect(breadcrumbs).toHaveLength(2)
    expect(breadcrumbs[0].title).toBe("Labs")
    expect(breadcrumbs[0].href).toBe("/labs/")
    expect(breadcrumbs[1].title).toBe("J. Michael Cherry, Stanford")
    expect(breadcrumbs[0].href).toBe("/labs/")
  })
})
