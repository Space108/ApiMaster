/**
 * Автономные отчёты при падении тестов (скриншоты/видео из вложений Playwright).
 * Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality
 */

import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

const FOOTER =
  '\n\n---\n\n**Разработчик проекта: [Space108] — AI Developer & AI Full-stack Quality**\n';

export default class BugReportReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status !== 'failed' && result.status !== 'timedOut') return;

    const outDir = path.join(process.cwd(), 'test-results', 'bug-reports');
    fs.mkdirSync(outDir, { recursive: true });
    const slug = test.title.replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 96);
    const file = path.join(outDir, `${slug}_${Date.now()}.md`);

    const attachments = result.attachments
      .map((a) => `- **${a.name}**: \`${a.path ?? ''}\``)
      .join('\n');

    const stderr = result.stderr
      .map((s) => (Buffer.isBuffer(s) ? s.toString('utf8') : String(s)))
      .join('\n');

    const md = [
      `# Bug report: ${test.title}`,
      '',
      `**Status:** ${result.status}`,
      '',
      '## Error',
      '```',
      result.error?.stack || result.error?.message || '',
      '```',
      '',
      '## Stderr',
      '```',
      stderr || '(empty)',
      '```',
      '',
      '## Attachments (screenshots / video / trace)',
      attachments || '_none_',
 ].join('\n');

    fs.writeFileSync(file, md + FOOTER, 'utf8');
  }
}
