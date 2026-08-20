const STUB_REPLY =
  "Thanks — Doorstep's server-side chat integration is ready for a future Gemini connection.";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  // Keep the key server-side. The stub deliberately does not call Gemini yet.
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);

  return response.status(200).json({
    reply: STUB_REPLY,
    stub: true,
    geminiConfigured,
  });
}
