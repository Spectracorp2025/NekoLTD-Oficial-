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

const JWT_SECRET = process.env.JWT_SECRET || "neko_ltd_secret_key_2026";

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

      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure no foreign key constraint exists on chats.user_id to allow virtual admin (ID 0)
      ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user_id_fkey;

      CREATE TABLE IF NOT EXISTS forums (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure no foreign key constraint exists on forums.user_id to allow virtual admin (ID 0)
      ALTER TABLE forums DROP CONSTRAINT IF EXISTS forums_user_id_fkey;

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

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
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Schema updates for existing tables
      ALTER TABLE games ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
      ALTER TABLE games ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'juegos';
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

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, age, country, phone, password, role, code } = req.body;
    
    if (role === 'premium' && code !== '15108') {
      return res.status(400).json({ error: "Código Premium inválido" });
    }
    if (role === 'plus' && code !== '1052023') {
      return res.status(400).json({ error: "Código Plus inválido" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (name, age, country, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, role",
        [name, age, country, phone, hashedPassword, role || 'normal']
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      if (err.code === '23505') return res.status(400).json({ error: "El teléfono ya está registrado" });
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { phone, password } = req.body;
    
    if (phone === 'Fumiko' && password === 'fumiko121508') {
      const token = jwt.sign({ id: 0, name: 'Fumiko', role: 'admin' }, JWT_SECRET);
      return res.json({ token, user: { id: 0, name: 'Fumiko', role: 'admin' } });
    }

    try {
      const result = await pool.query("SELECT * FROM users WHERE phone = $1", [phone]);
      const user = result.rows[0];
      if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
      if (user.status === 'banned') return res.status(403).json({ error: "Tu cuenta ha sido suspendida permanentemente." });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: "Contraseña incorrecta" });

      const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/me", authenticateToken, async (req: any, res) => {
    if (req.user.id === 0) return res.json(req.user);
    const result = await pool.query("SELECT id, name, role, phone, country, age, status FROM users WHERE id = $1", [req.user.id]);
    res.json(result.rows[0]);
  });

  // Chat
  app.get("/api/chat", authenticateToken, async (req, res) => {
    const result = await pool.query(`
      SELECT c.*, 
        CASE WHEN c.user_id = 0 THEN 'Fumiko' ELSE u.name END as user_name,
        CASE WHEN c.user_id = 0 THEN 'admin' ELSE u.role END as user_role 
      FROM chats c 
      LEFT JOIN users u ON c.user_id = u.id 
      ORDER BY c.created_at ASC
    `);
    res.json(result.rows);
  });

  // Forums
  app.get("/api/forums", authenticateToken, async (req, res) => {
    const result = await pool.query(`
      SELECT f.*, u.name as user_name, u.role as user_role,
      (SELECT count(*) FROM forum_comments WHERE forum_id = f.id) as comment_count
      FROM forums f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  });

  app.post("/api/forums", authenticateToken, async (req: any, res) => {
    const { title, content } = req.body;
    const result = await pool.query(
      "INSERT INTO forums (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
      [req.user.id, title, content]
    );
    res.json(result.rows[0]);
  });

  // Reports
  app.post("/api/reports", authenticateToken, async (req: any, res) => {
    const { type, message } = req.body;
    await pool.query(
      "INSERT INTO reports (user_id, type, message) VALUES ($1, $2, $3)",
      [req.user.id, type, message]
    );
    res.json({ success: true });
  });

  // Admin Routes
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    next();
  };

  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    const result = await pool.query("SELECT id, name, role, phone, country, age, status, created_at FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  });

  app.post("/api/admin/users/:id/role", authenticateToken, isAdmin, async (req: any, res) => {
    const { role } = req.body;
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, req.params.id]);
    await pool.query("INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)", 
      [req.user.id, 'update_role', `Changed user ${req.params.id} role to ${role}`]);
    res.json({ success: true });
  });

  app.post("/api/admin/users/:id/status", authenticateToken, isAdmin, async (req: any, res) => {
    const { status } = req.body;
    await pool.query("UPDATE users SET status = $1 WHERE id = $2", [status, req.params.id]);
    await pool.query("INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)", 
      [req.user.id, 'update_status', `Changed user ${req.params.id} status to ${status}`]);
    res.json({ success: true });
  });

  app.get("/api/admin/reports", authenticateToken, isAdmin, async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT r.*, u1.name as reporter_name, u2.name as target_name
        FROM reports r 
        LEFT JOIN users u1 ON r.user_id = u1.id 
        LEFT JOIN users u2 ON r.target_id = u2.id
        ORDER BY r.created_at DESC
      `);
      res.json(result.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/reports/:id/resolve", authenticateToken, isAdmin, async (req, res) => {
    try {
      await pool.query("UPDATE reports SET status = 'resolved' WHERE id = $1", [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/reports/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      await pool.query("DELETE FROM reports WHERE id = $1", [req.params.id]);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
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
  });

  app.post("/api/admin/chat/clear", authenticateToken, isAdmin, async (req: any, res) => {
    console.log(`Admin ${req.user.id} clearing chat`);
    await pool.query("DELETE FROM chats");
    await pool.query("INSERT INTO admin_logs (admin_id, action, details) VALUES ($1, $2, $3)", 
      [req.user.id, 'clear_chat', 'Cleared all global chat messages']);
    io.emit("chat_cleared");
    res.json({ success: true });
  });

  app.post("/api/admin/ads", authenticateToken, isAdmin, async (req, res) => {
    const { title, content, media_url, media_type } = req.body;
    const result = await pool.query(
      "INSERT INTO ads (title, content, media_url, media_type) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, media_url, media_type]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/admin/ads/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Admin ${req.user.id} deleting ad ${id}`);
      await pool.query("DELETE FROM ads WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting ad:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ads", authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM ads ORDER BY created_at DESC");
    res.json(result.rows);
  });

  // Content Routes
  app.get("/api/games", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM games ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err: any) {
      console.error("Error fetching games:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/apps", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM apps ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err: any) {
      console.error("Error fetching apps:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/accounts", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM accounts ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/novels", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM novels ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err: any) {
      console.error("Error fetching novels:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/products", authenticateToken, async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM products ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/novels/:id/chapters", authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM novel_chapters WHERE novel_id = $1 ORDER BY order_index ASC", [req.params.id]);
    res.json(result.rows);
  });

  app.get("/api/chapters/:id/content", authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM novel_content WHERE chapter_id = $1 ORDER BY order_index ASC", [req.params.id]);
    res.json(result.rows);
  });

  // Admin Content Management
  app.post("/api/admin/games", authenticateToken, isAdmin, async (req, res) => {
    const { title, description, url, thumbnail_url, category, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO games (title, description, url, thumbnail_url, category, allowed_roles) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, url, thumbnail_url, category || 'juegos', allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/admin/games/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Admin ${req.user.id} deleting game ${id}`);
      await pool.query("DELETE FROM games WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting game:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/apps", authenticateToken, isAdmin, async (req, res) => {
    const { title, description, url, thumbnail_url, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO apps (title, description, url, thumbnail_url, allowed_roles) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, url, thumbnail_url, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/admin/apps/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Admin ${req.user.id} deleting app ${id}`);
      await pool.query("DELETE FROM apps WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting app:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/accounts", authenticateToken, isAdmin, async (req, res) => {
    const { title, description, details, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO accounts (title, description, details, allowed_roles) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, details, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/admin/accounts/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Admin ${req.user.id} deleting account ${id}`);
      await pool.query("DELETE FROM accounts WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting account:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/novels", authenticateToken, isAdmin, async (req, res) => {
    const { title, description, cover_url, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO novels (title, description, cover_url, allowed_roles) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, description, cover_url, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  });

  app.post("/api/admin/novels/:id/chapters", authenticateToken, isAdmin, async (req, res) => {
    const { title, order_index, allowed_roles } = req.body;
    const result = await pool.query(
      "INSERT INTO novel_chapters (novel_id, title, order_index, allowed_roles) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.id, title, order_index, allowed_roles || ['normal', 'premium', 'plus', 'admin']]
    );
    res.json(result.rows[0]);
  });

  app.post("/api/admin/chapters/:id/content", authenticateToken, isAdmin, async (req, res) => {
    const { type, content, order_index } = req.body;
    const result = await pool.query(
      "INSERT INTO novel_content (chapter_id, type, content, order_index) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.id, type, content, order_index]
    );
    res.json(result.rows[0]);
  });

  app.delete("/api/admin/novels/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Admin ${req.user.id} deleting novel ${id}`);
      await pool.query("DELETE FROM novels WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting novel:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/products", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { title, description, price, image_url } = req.body;
      const result = await pool.query(
        "INSERT INTO products (title, description, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *",
        [title, description, price, image_url]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      console.error("Error creating product:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/admin/products/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Admin ${req.user.id} deleting product ${id}`);
      await pool.query("DELETE FROM products WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error deleting product:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Socket.io for Chat
  io.on("connection", (socket) => {
    socket.on("send_message", async (data) => {
      const { userId, message } = data;
      try {
        const result = await pool.query(
          "INSERT INTO chats (user_id, message) VALUES ($1, $2) RETURNING id, created_at",
          [userId, message]
        );
        
        let userName = 'Usuario';
        let userRole = 'normal';

        if (userId === 0) {
          userName = 'Fumiko';
          userRole = 'admin';
        } else {
          const userResult = await pool.query("SELECT name, role FROM users WHERE id = $1", [userId]);
          if (userResult.rows[0]) {
            userName = userResult.rows[0].name;
            userRole = userResult.rows[0].role;
          }
        }

        const fullMessage = {
          id: result.rows[0].id,
          user_id: userId,
          message,
          created_at: result.rows[0].created_at,
          user_name: userName,
          user_role: userRole
        };
        io.emit("receive_message", fullMessage);
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("delete_message", async (messageId) => {
      // In a real app, verify admin role via socket handshake/auth
      await pool.query("DELETE FROM chats WHERE id = $1", [messageId]);
      io.emit("message_deleted", messageId);
    });

    socket.on("clear_chat", async () => {
      await pool.query("DELETE FROM chats");
      io.emit("chat_cleared");
    });
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

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
