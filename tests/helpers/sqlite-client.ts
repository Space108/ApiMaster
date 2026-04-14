/**
 * Прямой доступ к data/api_master.sqlite для проверок «источник истины».
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'api_master.sqlite');

export type UserRow = { id: number; name: string; role: string };

export function dbAll<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(DB_PATH);
    database.all(sql, params, (err, rows) => {
      database.close();
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export function dbGet<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(DB_PATH);
    database.get(sql, params, (err, row) => {
      database.close();
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });
}

export function dbRun(
  sql: string,
  params: unknown[] = []
): Promise<{ changes: number; lastID: number }> {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(DB_PATH);
    database.run(sql, params, function onRun(err) {
      database.close();
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}
