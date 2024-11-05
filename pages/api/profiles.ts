/**
 * This API route is used to fetch the profiles object from the data provider and cache it on the
 * NextJS server.
 */

// node_modules
import type { NextApiRequest, NextApiResponse } from "next";
// lib
import { retrieveProfiles } from "../../lib/server-objects";

export default async function profiles(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const profiles = await retrieveProfiles(req.headers.cookie);
    if (profiles) {
      res.status(200).json(profiles);
    } else {
      res.status(404).json({ error: "Profiles not found" });
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
