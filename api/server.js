'use strict';

/**
 * Локальный REST API для CRUD по data/api_master.sqlite (users).
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'api_master.sqlite');
const PORT = Number(process.env.APICENTER_PORT || process.env.PORT || 3847);
const MAX_NAME = 500;
const MAX_ROLE = 200;

function openDb() {
  return new sqlite3.Database(DB_PATH);
}

function migrateUsersAndAudit(db) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('PRAGMA journal_mode = WAL', (err) => {
        if (err) return reject(err);
      });

      db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
        (err, row) => {
          if (err) return reject(err);

          const createFresh = (cb) => {
            db.run(
              `CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                role TEXT NOT NULL
              )`,
              cb
            );
          };

          if (!row) {
            return createFresh((e) => (e ? reject(e) : resolve()));
          }

          db.all('PRAGMA table_info(users)', (e2, cols) => {
            if (e2) return reject(e2);
            const idCol = cols.find((c) => c.name === 'id');
            const nameCol = cols.find((c) => c.name === 'name');
            const roleCol = cols.find((c) => c.name === 'role');
            const schemaOk =
              idCol &&
              idCol.pk === 1 &&
              nameCol &&
              nameCol.notnull === 1 &&
              roleCol &&
              roleCol.notnull === 1;

            if (schemaOk) return resolve();

            db.run('ALTER TABLE users RENAME TO users_legacy', (e3) => {
              if (e3) return reject(e3);
              createFresh((e4) => {
                if (e4) return reject(e4);
                db.run(
                  'INSERT INTO users (name, role) SELECT name, role FROM users_legacy',
                  (e5) => {
                    if (e5) return reject(e5);
                    db.run('DROP TABLE users_legacy', (e6) =>
                      e6 ? reject(e6) : resolve()
                    );
                  }
                );
              });
            });
          });
        }
      );
    });
  });
}

function ensureAuditTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS test_audit (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route TEXT NOT NULL,
        response_json TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });
}

function validateUserBody(body) {
  const { name, role } = body || {};
  if (name === undefined || name === null)
    return { error: 'name is required and must be a non-null string' };
  if (role === undefined || role === null)
    return { error: 'role is required and must be a non-null string' };
  if (typeof name !== 'string' || typeof role !== 'string')
    return { error: 'name and role must be strings' };
  const n = name.trim();
  const r = role.trim();
  if (!n.length) return { error: 'name must not be empty' };
  if (!r.length) return { error: 'role must not be empty' };
  if (n.length > MAX_NAME) return { error: `name exceeds ${MAX_NAME} characters` };
  if (r.length > MAX_ROLE) return { error: `role exceeds ${MAX_ROLE} characters` };
  return { name: n, role: r };
}

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'APIMASTER', port: PORT });
});

app.get('/api/users', (req, res) => {
  req.app.locals.db.all(
    'SELECT id, name, role FROM users ORDER BY id',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ users: rows });
    }
  );
});

app.get('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res.status(400).json({ error: 'invalid id' });
  req.app.locals.db.get(
    'SELECT id, name, role FROM users WHERE id = ?',
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'not found' });
      res.json(row);
    }
  );
});

app.post('/api/users', (req, res) => {
  const v = validateUserBody(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  req.app.locals.db.run(
    'INSERT INTO users (name, role) VALUES (?, ?)',
    [v.name, v.role],
    function onInsert(err) {
      if (err) return res.status(500).json({ error: err.message });
      const newId = this.lastID;
      req.app.locals.db.get(
        'SELECT id, name, role FROM users WHERE id = ?',
        [newId],
        (e2, row) => {
          if (e2) return res.status(500).json({ error: e2.message });
          res.status(201).json(row);
        }
      );
    }
  );
});

app.put('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res.status(400).json({ error: 'invalid id' });
  const v = validateUserBody(req.body);
  if (v.error) return res.status(400).json({ error: v.error });
  req.app.locals.db.run(
    'UPDATE users SET name = ?, role = ? WHERE id = ?',
    [v.name, v.role, id],
    function onUpdate(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'not found' });
      req.app.locals.db.get(
        'SELECT id, name, role FROM users WHERE id = ?',
        [id],
        (e2, row) => {
          if (e2) return res.status(500).json({ error: e2.message });
          res.json(row);
        }
      );
    }
  );
});

app.delete('/api/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1)
    return res.status(400).json({ error: 'invalid id' });
  req.app.locals.db.run(
    'DELETE FROM users WHERE id = ?',
    [id],
    function onDel(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'not found' });
      res.status(204).send();
    }
  );
});

app.delete('/api/users', (req, res) => {
  if (process.env.APIMASTER_TEST_MODE !== '1') {
    return res.status(403).json({ error: 'bulk delete disabled' });
  }
  req.app.locals.db.run('DELETE FROM users', [], function onBulk(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ ok: true, deleted: this.changes });
  });
});

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = openDb();
  await migrateUsersAndAudit(db);
  await ensureAuditTable(db);
  app.locals.db = db;

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`APIMASTER listening on http://127.0.0.1:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
