import express from 'express';
//import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

/**
// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}
**/


//--- データベース接続 ---
// Renderの環境変数（DATABASE_URL）から接続情報を取得してPostgreSQLに接続します
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // RenderのDBに接続するためのSSL設定
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize SQLite database
//const db = new sqlite3.Database(':memory:');

/** 
//データベース永続的に保存
const db = new sqlite3.Database('./members.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the members.db SQLite database.');
});
**/



/** 
// Initialize database schema and sample data
db.serialize(() => {
  // Create members table
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data
  const sampleMembers = ['佐藤', '鈴木', '高橋'];
  const stmt = db.prepare('INSERT OR IGNORE INTO members (name) VALUES (?)');
  sampleMembers.forEach(name => {
    stmt.run(name);
  });
  stmt.finalize();
});
**/

//--- データベースの初期化 ---
const initializeDatabase = async () => {
  try {
    // PostgreSQLの文法に変更 (id SERIAL PRIMARY KEY, TIMESTAMPTZ)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // サンプルデータの挿入 (存在しない場合のみ)
    const sampleMembers = ['佐藤', '鈴木', '高橋'];
    for (const name of sampleMembers) {
      // ON CONFLICT DO NOTHINGは、同じ名前が既に存在する場合は何もしない、というPostgreSQLの命令です
      await pool.query('INSERT INTO members (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [name]);
    }
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
};
// サーバー起動時にデータベース初期化を実行
initializeDatabase();

// API Routes

/** 
// Get all members
app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});
**/

// 全メンバーを取得
app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM members ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve members' });
  }
});


/** 
// Add new member
app.post('/api/members', (req, res) => {
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  db.run('INSERT INTO members (name) VALUES (?)', [name.trim()], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: 'Member already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
      return;
    }
    res.json({ id: this.lastID, name: name.trim() });
  });
});
**/

// 新しいメンバーを追加
app.post('/api/members', async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // RETURNING * を使うことで、追加した行の情報を取得できます
    const result = await pool.query(
      'INSERT INTO members (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    // PostgreSQLのUNIQUE制約違反エラーコードは '23505' です
    if (err.code === '23505') {
      res.status(409).json({ error: 'Member already exists' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Failed to add member' });
    }
  }
});

/**
// Delete member
app.delete('/api/members/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM members WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }
    res.json({ message: 'Member deleted successfully' });
  });
});
**/

// メンバーを削除
app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM members WHERE id = $1', [id]);
    // result.rowCountで、実際に削除された行の数を確認できます
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/** 
// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
**/

// （今回は静的サイトを別でデプロイするため、この部分は直接使われませんが、汎用的な設定として残しておきます）
const clientBuildPath = path.join(__dirname, '../dist');
app.use(express.static(clientBuildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});