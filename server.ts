import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Secure Server-side Admin Authentication Endpoint
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    
    // Retrieve credentials from environment variables safely (exclusively server-side)
    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    const expectedPassword = process.env.ADMIN_PASSWORD || "adminkronggen2026";

    if (username === expectedUsername && password === expectedPassword) {
      return res.json({ 
        success: true, 
        message: "Otorisasi panitia dikonfirmasi secara aman.", 
        token: "session_secured_sdn4_kronggen_token_2026" 
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: "Nama pengguna atau kata sandi salah!" 
    });
  });

  // Data Directory Setup
  const fs = await import("fs");
  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
  const KEGIATAN_FILE = path.join(DATA_DIR, "kegiatan.json");
  const LOGOS_FILE = path.join(DATA_DIR, "logos.json");

  // Sync API: Registrations
  app.get("/api/sync/registrations", (req, res) => {
    try {
      if (fs.existsSync(REGISTRATIONS_FILE)) {
        const data = fs.readFileSync(REGISTRATIONS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.json([]);
    } catch (err) {
      console.error("Gagal membaca registrations server:", err);
      return res.status(500).json({ error: "Gagal memproses data di server" });
    }
  });

  app.post("/api/sync/registrations", (req, res) => {
    try {
      const { students } = req.body;
      if (Array.isArray(students)) {
        fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(students, null, 2), "utf-8");
        return res.json({ success: true, count: students.length });
      }
      return res.status(400).json({ error: "Format data students harus berupa array" });
    } catch (err) {
      console.error("Gagal menyimpan registrations server:", err);
      return res.status(500).json({ error: "Gagal menyimpan data di server" });
    }
  });

  // Sync API: Kegiatan
  app.get("/api/sync/kegiatan", (req, res) => {
    try {
      if (fs.existsSync(KEGIATAN_FILE)) {
        const data = fs.readFileSync(KEGIATAN_FILE, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.json([]);
    } catch (err) {
      console.error("Gagal membaca kegiatan server:", err);
      return res.status(500).json({ error: "Gagal memproses data di server" });
    }
  });

  app.post("/api/sync/kegiatan", (req, res) => {
    try {
      const { kegiatan } = req.body;
      if (Array.isArray(kegiatan)) {
        fs.writeFileSync(KEGIATAN_FILE, JSON.stringify(kegiatan, null, 2), "utf-8");
        return res.json({ success: true, count: kegiatan.length });
      }
      return res.status(400).json({ error: "Format data kegiatan harus berupa array" });
    } catch (err) {
      console.error("Gagal menyimpan kegiatan server:", err);
      return res.status(500).json({ error: "Gagal menyimpan data di server" });
    }
  });

  // Sync API: Logos (Header & Dinas)
  app.get("/api/sync/logos", (req, res) => {
    try {
      if (fs.existsSync(LOGOS_FILE)) {
        const data = fs.readFileSync(LOGOS_FILE, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.json({ sdnLogo: null, dinasLogo: null });
    } catch (err) {
      console.error("Gagal membaca logos server:", err);
      return res.json({ sdnLogo: null, dinasLogo: null });
    }
  });

  app.post("/api/sync/logos", (req, res) => {
    try {
      const { sdnLogo, dinasLogo } = req.body;
      const payload = { sdnLogo: sdnLogo || null, dinasLogo: dinasLogo || null };
      fs.writeFileSync(LOGOS_FILE, JSON.stringify(payload, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (err) {
      console.error("Gagal menyimpan logos server:", err);
      return res.status(500).json({ error: "Gagal menyimpan logo di server" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
