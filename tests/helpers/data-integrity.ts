/**
 * Сравнение ответа API с строкой SQLite. Несовпадение = Data Integrity Fault.
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import type { UserRow } from './sqlite-client';

export function assertApiMatchesDbUser(api: UserRow, dbRow: UserRow | undefined): void {
  if (!dbRow) {
    throw new Error(
      `Data Integrity Fault: no DB row for API user ${JSON.stringify(api)}`
    );
  }
  if (api.id !== dbRow.id || api.name !== dbRow.name || api.role !== dbRow.role) {
    throw new Error(
      `Data Integrity Fault: API ${JSON.stringify(api)} differs from DB ${JSON.stringify(dbRow)}`
    );
  }
}
