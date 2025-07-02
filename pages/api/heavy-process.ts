export default async function handler(req, res) {
  await new Promise((r) => setTimeout(r, 400));
  res.status(200).json({ ok: true });
}
