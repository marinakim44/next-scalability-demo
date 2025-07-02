// pages/api/proxy.ts
import type { NextApiRequest, NextApiResponse } from "next";

const endpoints = {
  customServer: "http://18.175.171.177:4000/heavy-process",
  vercel: "https://next-scalability-demo.vercel.app/api/heavy-process",
  lambda:
    "https://m7w2wn4ow6.execute-api.eu-west-2.amazonaws.com/default/HeavyProcessLambda",
};

type Target = keyof typeof endpoints; // "customServer" | "vercel" | "lambda"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { target } = req.query;

  if (typeof target !== "string" || !(target in endpoints)) {
    return res.status(400).json({ error: "Invalid target" });
  }

  const endpoint = endpoints[target as Target];

  try {
    const start = Date.now();
    const response = await fetch(endpoint, { method: "POST" });
    const duration = Date.now() - start;

    const body = await response.text();
    return res.status(200).json({
      time: duration,
      ok: response.ok,
      status: response.status,
      body,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
