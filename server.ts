import express from "express";
import type { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres.xqsynxmznrlybdjpiolt:bZL9WfKE27Fe3CcF@aws-1-us-east-2.pooler.supabase.com:6543/postgres",
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

const JWT_SECRET = process.env.JWT_SECRET || "neko_ltd_secret_key_2026";

// Async wrapper to catch errors
const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        age INTEGER,
        country TEXT,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'normal',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- Initialize default codes if not present
      INSERT INTO settings (key, value) VALUES ('code_premium', '15108') ON CONFLICT DO NOTHING;
      INSERT INTO settings (key, value) VALUES ('code_plus', '1052023') ON CONFLICT DO NOTHING;
      INSERT INTO settings (key, value) VALUES ('code_admin', 'nekoadmin2026') ON CONFLICT DO NOTHING;
      INSERT INTO settings (key, value) VALUES ('app_version', '3.0.0 SPECTRA') ON CONFLICT DO NOTHING;

      CREATE TABLE IF NOT EXISTS social_networks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ads (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        media_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        category TEXT DEFAULT 'juegos',
        password TEXT,
        allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL,
        thumbnail_url TEXT,
        allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        details TEXT,
        allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'],
        expires_at TIMESTAMPTZ,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure expires_at is TIMESTAMPTZ if table already exists
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='accounts' AND column_name='expires_at') THEN
          ALTER TABLE accounts ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at AT TIME ZONE 'UTC';
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS streams (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        scheduled_at TIMESTAMPTZ NOT NULL,
        stream_url TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure scheduled_at is TIMESTAMPTZ if table already exists
      DO $$ 
      BEGIN 
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='streams' AND column_name='scheduled_at') THEN
          ALTER TABLE streams ALTER COLUMN scheduled_at TYPE TIMESTAMPTZ USING scheduled_at AT TIME ZONE 'UTC';
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS novels (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cover_url TEXT,
        allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS novel_chapters (
        id SERIAL PRIMARY KEY,
        novel_id INTEGER REFERENCES novels(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS novel_content (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER REFERENCES novel_chapters(id) ON DELETE CASCADE,
        type TEXT NOT NULL, -- 'text', 'dialogue', 'thought', 'video'
        content TEXT NOT NULL,
        order_index INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        target_id INTEGER,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure target_id exists in reports table
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reports' AND column_name='target_id') THEN
          ALTER TABLE reports ADD COLUMN target_id INTEGER;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure no foreign key constraint exists on admin_logs.admin_id to allow virtual admin (ID 0)
      ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS admin_logs_admin_id_fkey;

      -- Schema updates for existing tables
      ALTER TABLE games ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      ALTER TABLE games ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'juegos';
      ALTER TABLE games ADD COLUMN IF NOT EXISTS password TEXT;
      ALTER TABLE games ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'];
      
      ALTER TABLE apps ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      ALTER TABLE apps ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'];
      
      ALTER TABLE accounts ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE accounts ADD COLUMN IF NOT EXISTS details TEXT;
      ALTER TABLE accounts ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'];
      
      ALTER TABLE novels ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE novels ADD COLUMN IF NOT EXISTS cover_url TEXT;
      ALTER TABLE novels ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'];
      
      ALTER TABLE novel_chapters ADD COLUMN IF NOT EXISTS allowed_roles TEXT[] DEFAULT ARRAY['normal', 'premium', 'plus', 'admin'];
      
      ALTER TABLE reports ADD COLUMN IF NOT EXISTS target_id INTEGER;
    `);
    /* 
    await pool.query(`
      DELETE FROM games;
      DELETE FROM accounts;
      DELETE FROM apps;
      DELETE FROM novels;
      DELETE FROM novel_chapters;
      DELETE FROM novel_content;
      DELETE FROM chats;
      DELETE FROM reports;
    `);
    console.log("Database initialized and default data cleared");
    */
    console.log("Database initialized");
  } catch (err) {
    console.error("Database initialization failed", err);
  }
}

async function startServer() {
  await initDb();

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  app.use(express.json());

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok", db: "connected" });
    } catch (err: any) {
      res.status(500).json({ status: "error", db: err.message });
    }
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // API Routes
  app.post("/api/auth/register", catchAsync(async (req: Request, res: Response) => {
    const { name, age, country, phone, password, role, code } = req.body;
    
    // Fetch codes from settings
    const settingsRes = await pool.query("SELECT * FROM settings");
    const settings: Record<string, string> = {};
    settingsRes.rows.forEach(row => settings[row.key] = row.value);

    // Only require code for non-normal roles
    if (role === 'premium' && code !== settings.code_premium) {
      return res.status(400).json({ error: "Código Premium inválido" });
    }
    if (role === 'plus' && code !== settings.code_plus) {
      return res.status(400).json({ error: "Código Plus inválido" });
    }
    if (role === 'admin' && code !== settings.code_admin) {
      return res.status(400).json({ error: "Código Admin inválido" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, age, country, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, role",
      [name, age, country, phone, hashedPassword, role || 'normal']
    );
    res.json(result.rows[0]);
  }));

  app.post("/api/auth/login", catchAsync(async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    
    if (phone === 'Fumiko' && password === 'fumiko121508') {
      const token = jwt.sign({ id: 0, name: 'Fumiko', role: 'admin' }, JWT_SECRET);
      return res.json({ token, user: { id: 0, name: 'Fumiko', role: 'admin' } });
    }

    const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    if (user.status === 'banned') return res.status(403).json({ error: "Tu cuenta ha sido suspendida permanentemente." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  }));

  app.get("/api/me", authenticateToken, catchAsync(async (req: any, res: Response) => {
    if (req.user.id === 0) return res.json(req.user);
    const result = await pool.query("SELECT id, name, role, phone, country, age, status FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  }));

  // Social Networks
  app.get("/api/social-networks", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM social_networks ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.post("/api/admin/social-networks", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, url, image_url } = req.body;
    const result = await pool.query(
      "INSERT INTO social_networks (title, description, url, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, url, image_url]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/social-networks/:id", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query("DELETE FROM social_networks WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  // Reports
  app.post("/api/reports", authenticateToken, catchAsync(async (req: any, res: Response) => {
    const { type, message, target_id } = req.body;
    console.log(`Creating report from user ${req.user.id}: type=${type}, target=${target_id}`);
    await pool.query(
      "INSERT INTO reports (user_id, type, message, target_id) VALUES ($1, $2, $3, $4)",
      [req.user.id, type, message, target_id || null]
    );
    res.json({ success: true });
  }));

  // Admin Routes
  app.get("/api/admin/users", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT id, name, role, phone, country, age, status, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.post("/api/admin/users/:id/role", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { role } = req.body;
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, req.params.id]);
    await pool.query("INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)", 
      [req.user.id, 'update_role', `Changed user ${req.params.id} role to ${role}`]);
    res.json({ success: true });
  }));

  app.post("/api/admin/users/:id/status", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { status } = req.body;
    await pool.query("UPDATE users SET status = $1 WHERE id = $2", [status, req.params.id]);
    await pool.query("INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)", 
      [req.user.id, 'update_status', `Changed user ${req.params.id} status to ${status}`]);
    res.json({ success: true });
  }));

  app.get("/api/admin/reports", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query(`
      SELECT r.*, u1.name as reporter_name, u2.name as target_name
      FROM reports r 
      LEFT JOIN users u1 ON r.user_id = u1.id 
      LEFT JOIN users u2 ON r.target_id = u2.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  }));

  app.post("/api/admin/reports/:id/resolve", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    await pool.query("UPDATE reports SET status = 'resolved' WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  }));

  app.delete("/api/admin/reports/:id", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    await pool.query("DELETE FROM reports WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  }));

  app.get("/api/admin/stats", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const usersCount = await pool.query("SELECT count(*) FROM users");
    const premiumCount = await pool.query("SELECT count(*) FROM users WHERE role = 'premium'");
    const plusCount = await pool.query("SELECT count(*) FROM users WHERE role = 'plus'");
    const bannedCount = await pool.query("SELECT count(*) FROM users WHERE status = 'banned'");
    const reportsCount = await pool.query("SELECT count(*) FROM reports");
    const pendingReports = await pool.query("SELECT count(*) FROM reports WHERE status = 'pending'");
    
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      premiumUsers: parseInt(premiumCount.rows[0].count),
      plusUsers: parseInt(plusCount.rows[0].count),
      bannedUsers: parseInt(bannedCount.rows[0].count),
      totalReports: parseInt(reportsCount.rows[0].count),
      pendingReports: parseInt(pendingReports.rows[0].count)
    });
  }));

  app.get("/api/admin/settings", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM settings");
    const settings: Record<string, string> = {};
    result.rows.forEach(row => settings[row.key] = row.value);
    res.json(settings);
  }));

  app.post("/api/admin/settings", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const updates = req.body; // { key: value, ... }
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [key, value]
      );
    }
    res.json({ success: true });
  }));

  app.post("/api/admin/chat/clear", authenticateToken, isAdmin, async (req: any, res) => {
    res.json({ success: true });
  });

  app.post("/api/admin/ads", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, content, media_url, media_type } = req.body;
    const result = await pool.query(
      "INSERT INTO ads (title, content, media_url, media_type) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, media_url, media_type]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/ads/:id", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    console.log(`Admin ${req.user.id} deleting ad ${id}`);
    await pool.query("DELETE FROM ads WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  app.get("/api/ads", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM ads ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  // Content Routes
  app.get("/api/games", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM games ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.get("/api/apps", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM apps ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.get("/api/accounts", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    // Auto-delete expired accounts
    await pool.query("DELETE FROM accounts WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP");
    
    const result = await pool.query("SELECT * FROM accounts ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.get("/api/streams", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM streams WHERE scheduled_at > CURRENT_TIMESTAMP - INTERVAL '2 hours' ORDER BY scheduled_at ASC");
    res.json(result.rows);
  }));

  app.get("/api/novels", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM novels ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.get("/api/products", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(result.rows);
  }));

  app.get("/api/novels/:id/chapters", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM novel_chapters WHERE novel_id = $1 ORDER BY order_index ASC", [req.params.id]);
    res.json(result.rows);
  }));

  app.get("/api/chapters/:id/content", authenticateToken, catchAsync(async (req: Request, res: Response) => {
    const result = await pool.query("SELECT * FROM novel_content WHERE chapter_id = $1 ORDER BY order_index ASC", [req.params.id]);
    res.json(result.rows);
  }));

  // Admin Content Management
  app.post("/api/admin/games", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, url, thumbnail_url, category, password, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO games (title, description, url, thumbnail_url, category, password, allowed_roles) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [title, description, url, thumbnail_url, category || 'juegos', password || null, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/games/:id", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    console.log(`Admin ${req.user.id} deleting game ${id}`);
    await pool.query("DELETE FROM games WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  app.post("/api/admin/apps", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, url, thumbnail_url, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO apps (title, description, url, thumbnail_url, allowed_roles) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, url, thumbnail_url, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/apps/:id", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    console.log(`Admin ${req.user.id} deleting app ${id}`);
    await pool.query("DELETE FROM apps WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  app.post("/api/admin/accounts", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, details, allowed_roles, expires_at } = req.body;
    const result = await pool.query(
      "INSERT INTO accounts (title, description, details, allowed_roles, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, details, allowed_roles || ['normal', 'premium', 'plus', 'admin'], expires_at || null]
    );
    res.json(result.rows[0]);
  }));

  app.post("/api/admin/streams", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, scheduled_at, stream_url, image_url } = req.body;
    const result = await pool.query(
      "INSERT INTO streams (title, description, scheduled_at, stream_url, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, scheduled_at, stream_url, image_url]
    );
    res.json(result.rows[0]);
  }));

  app.put("/api/admin/streams/:id", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, scheduled_at, stream_url, image_url } = req.body;
    const result = await pool.query(
      "UPDATE streams SET title = $1, description = $2, scheduled_at = $3, stream_url = $4, image_url = $5 WHERE id = $6 RETURNING *",
      [title, description, scheduled_at, stream_url, image_url, id]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/streams/:id", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pool.query("DELETE FROM streams WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  app.delete("/api/admin/accounts/:id", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    console.log(`Admin ${req.user.id} deleting account ${id}`);
    await pool.query("DELETE FROM accounts WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  app.post("/api/admin/novels", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, cover_url, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO novels (title, description, cover_url, allowed_roles) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, cover_url, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  }));

  app.post("/api/admin/novels/:id/chapters", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, order_index, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO novel_chapters (novel_id, title, order_index, allowed_roles) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.id, title, order_index, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  }));

  app.post("/api/admin/chapters/:id/content", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { type, content, order_index } = req.body;
    const result = await pool.query(
      "INSERT INTO novel_content (chapter_id, type, content, order_index) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.id, type, content, order_index]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/novels/:id", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    console.log(`Admin ${req.user.id} deleting novel ${id}`);
    await pool.query("DELETE FROM novels WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  app.post("/api/admin/products", authenticateToken, isAdmin, catchAsync(async (req: Request, res: Response) => {
    const { title, description, price, image_url } = req.body;
    const result = await pool.query(
      "INSERT INTO products (title, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, price, image_url]
    );
    res.json(result.rows[0]);
  }));

  app.delete("/api/admin/products/:id", authenticateToken, isAdmin, catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    console.log(`Admin ${req.user.id} deleting product ${id}`);
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.json({ success: true });
  }));

  // Socket.io removed
  io.on("connection", (socket) => {
    // Chat functionality removed
  });

  // Ensure all other /api routes return 404 JSON
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
  });

  // Vite middleware
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

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
