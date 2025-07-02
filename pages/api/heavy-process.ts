import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await new Promise((r) => setTimeout(r, 400));
  res.status(200).json({ ok: true });
}
