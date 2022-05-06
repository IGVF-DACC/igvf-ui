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
    let labItem = await request.getObject("/labs/j-michael-cherry/")
    expect(labItem).toBeTruthy()
    expect(_.isEqual(labItem, mockData)).toBeTruthy()

    labItem = await request.getObject("/labs/j-michael-cherry/", {
      includeEmbeds: true,
    })
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

  it("request and embed properties", async () => {
    const mockData = {
      "http://nginx:8000/labs/j-michael-cherry/?frame=object": {
        name: "j-michael-cherry",
        "@id": "/labs/j-michael-cherry/",
        "@type": ["Lab", "Item"],
        title: "J. Michael Cherry, Stanford",
      },
      "http://nginx:8000/labs/jesse-engreitz/?frame=object": {
        name: "jesse-engreitz",
        "@id": "/labs/jesse-engreitz/",
        "@type": ["Lab", "Item"],
        title: "Jesse Engreitz, Stanford University",
      },
    }
    window.fetch = jest.fn().mockImplementation((url) => {
      return Promise.resolve({
        json: () => Promise.resolve(mockData[url]),
      })
    })

    const items = [
      {
        "@id": "/users/986b362f-4eb6-4a9c-8173-3ab267307e3b/",
        "@type": ["User", "Item"],
        lab: "/labs/j-michael-cherry/",
        title: "Ben Hitz",
      },
      {
        "@id": "/users/627eedbc-7cb3-4de3-9743-a86266e435a6/",
        "@type": ["User", "Item"],
        lab: "/labs/jesse-engreitz/",
        title: "Forrest Tanaka",
      },
    ]

    const request = new Request()
    await request.getAndEmbedCollectionObjects(items, "lab")
    expect(typeof items[0].lab).toEqual("object")
    expect(items[0].lab["@id"]).toEqual("/labs/j-michael-cherry/")
    expect(typeof items[1].lab).toEqual("object")
    expect(items[1].lab["@id"]).toEqual("/labs/jesse-engreitz/")
  })

  it("receives a null result when fetch throws an error", async () => {
    window.fetch = jest.fn().mockImplementation(() => {
      throw "Mock request error"
    })

    const request = new Request()
    const labItem = await request.getObject("/labs/j-michael-cherry/")
    expect(labItem).toBeNull()
  })
})
