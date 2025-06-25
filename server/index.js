import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Initialize SQLite database
//const db = new sqlite3.Database(':memory:');


//データベース永続的に保存
const db = new sqlite3.Database('./members.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the members.db SQLite database.');
});




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

// API Routes

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});