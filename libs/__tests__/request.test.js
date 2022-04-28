import _ from "lodash"
import Request from "../request"

describe("Test functions to handle requests to the server", () => {
  it("retrieves a single item from the server correctly", async () => {
    // Mock lab collection retrieval.
    const mockData = {
      name: "j-michael-cherry",
      "@id": "/labs/j-michael-cherry/",
      "@type": ["Lab", "Item"],
      title: "J. Michael Cherry, Stanford",
    }
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    )

    const request = new Request()
    const labItem = await request.getObject("/labs/j-michael-cherry/")
    expect(labItem).toBeTruthy()
    expect(_.isEqual(labItem, mockData)).toBeTruthy()
  })

  it("retrieves multiple items from the server correctly", async () => {
    const mockData = [
      {
        name: "j-michael-cherry",
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      {
        name: "jesse-engreitz",
        "@id": "/labs/jesse-engreitz/",
        "@type": ["Lab", "Item"],
        title: "Jesse Engreitz, Stanford University",
      },
    ]
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    )

    // Retrieve multiple lab items.
    const request = new Request("mockcookie")
    const labItems = await request.getMultipleObjects([
      "/labs/j-michael-cherry/",
      "/labs/jesse-engreitz/",
    ])
    expect(labItems).toBeTruthy()
    expect(labItems).toHaveLength(2)

    // Make sure passing an empty array returns an empty array.
    const noLabItems = await request.getMultipleObjects([])
    expect(noLabItems).toBeTruthy()
    expect(noLabItems).toHaveLength(0)
  })

  it("retrieves a collection object from the server correctly", async () => {
    const mockData = {
      title: "Labs",
      description: "Listing of labs",
      "@id": "/labs/",
      "@type": ["LabCollection", "Collection"],
      "@context": "/terms/",
    }
    window.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockData),
      })
    )

    const request = new Request()
    const labCollection = await request.getCollection("labs")
    expect(labCollection).toBeTruthy()
    expect(_.isEqual(labCollection, mockData)).toBeTruthy()
  })
})
