/**
 * Прямая инициализация SQLite (схема как у api/server.js).
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'api_master.sqlite');

console.log('[SPACE108] Starting DB seed (AI MODE)...');

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS users');
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  )`);

  db.run("INSERT INTO users (name, role) VALUES ('Space108', 'AI Full-stack Quality')");

  db.each('SELECT id, name, role FROM users', (err, row) => {
    if (err) throw err;
    console.log(`[SPACE108] DB updated: [${row.name}] - ${row.role} (id=${row.id})`);
  });
});
db.close();
