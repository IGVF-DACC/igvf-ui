/**
 * This API route is used to fetch the `collection-titles` object from the data provider and cache
 * it on the NextJS server.
 */

// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { retrieveCollectionTitles } from "../../lib/server-objects";

export default async function collectionTitles(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const collectionTitles = await retrieveCollectionTitles(req.headers.cookie);
    if (collectionTitles) {
      res.status(200).json(collectionTitles);
    } else {
      res.status(404).json({ error: "Collection titles not found" });
    }
  } catch (error) {
    console.error("Error fetching collection titles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
