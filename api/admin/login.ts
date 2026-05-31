import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: any, res: any) {
  // Set CORS and security headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Method Not Allowed" });
    return;
  }

  // Parse body if it is not already parsed.
  // Vercel parses application/json bodies automatically, but we have a safe fallback for safety.
  let body = req.body;
  if (!body && req.readable) {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const raw = Buffer.concat(buffers).toString();
    try {
      body = JSON.parse(raw);
    } catch (e) {
      body = {};
    }
  } else if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }

  const username = body?.username || "";
  const password = body?.password || "";

  const trimmedUsername = typeof username === "string" ? username.trim() : "";
  const trimmedPassword = typeof password === "string" ? password : "";

  // Retrieve credentials from environment variables safely (exclusively server-side)
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "adminkronggen2026";

  if (trimmedUsername === expectedUsername && trimmedPassword === expectedPassword) {
    res.status(200).json({ 
      success: true, 
      message: "Otorisasi panitia dikonfirmasi secara aman.", 
      token: "session_secured_sdn4_kronggen_token_2026" 
    });
    return;
  }

  res.status(401).json({ 
    success: false, 
    message: "Nama pengguna atau kata sandi salah!" 
  });
}
