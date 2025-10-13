import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function removeSuperRefineCalls(source: string): { output: string; changed: boolean } {
  let s = source;
  let changed = false;
  const needle = '.superRefine(';

  while (true) {
    const startDot = s.indexOf(needle);
    if (startDot === -1) break;

    // Find the next `export const` after the superRefine call
    const exportIdx = s.indexOf('export const ', startDot);
    if (exportIdx === -1) {
      // If not found, stop to avoid accidental deletion
      break;
    }
    // Backtrack to the beginning of the export line (its preceding newline)
    let newlinePos = exportIdx;
    while (newlinePos > startDot && s[newlinePos - 1] !== '\n') {
      newlinePos--;
    }
    // Remove from the leading '.' of .superRefine to just before the export line
    s = s.slice(0, startDot) + '\n' + s.slice(newlinePos);
    changed = true;
  }

  // Additional cleanup: if superRefine no longer exists but there is leftover code
  // between the end of the z.object call `});` and the next `export const`, remove it.
  const nextExport = s.indexOf('export const');
  if (nextExport !== -1) {
    const beforeExportLineStart = (() => {
      let p = nextExport;
      while (p > 0 && s[p - 1] !== '\n') p--;
      return p;
    })();
    const closeObjIdx = s.lastIndexOf('});', beforeExportLineStart);
    if (closeObjIdx !== -1 && s.indexOf('.superRefine(', closeObjIdx) === -1) {
      const afterCloseObj = closeObjIdx + 3; // position after `});`
      if (afterCloseObj < beforeExportLineStart) {
        s = s.slice(0, afterCloseObj) + '\n' + s.slice(beforeExportLineStart);
        changed = true;
      }
    }
  }

  return { output: s, changed };
}

async function clearSuperRefineInFile(filePath: string): Promise<{ changed: boolean }> {
  const before = await readFile(filePath, 'utf8');
  const { output, changed } = removeSuperRefineCalls(before);
  if (changed) {
    await writeFile(filePath, output, 'utf8');
  }
  return { changed };
}

async function main() {
  const targetDir = path.resolve(process.cwd(), 'src/generated/schemas');
  let allFiles: string[] = [];
  try {
    allFiles = await walk(targetDir);
  } catch {
    console.error('[clear-zod-schema] target directory not found:', path.relative(process.cwd(), targetDir));
    return;
  }

  let changedCount = 0;
  const changedFiles: string[] = [];

  for (const f of allFiles) {
    try {
      const { changed } = await clearSuperRefineInFile(f);
      if (changed) {
        changedCount += 1;
        changedFiles.push(path.relative(process.cwd(), f));
      }
    } catch (err) {
      console.error('[clear-zod-schema] failed processing', path.relative(process.cwd(), f), err);
    }
  }

  console.log('[clear-zod-schema] scanned', allFiles.length, 'files under', path.relative(process.cwd(), targetDir));
  console.log('[clear-zod-schema] removed superRefine from', changedCount, 'file(s)');
  if (changedFiles.length > 0) {
    for (const f of changedFiles) {
      console.log(' -', f);
    }
  }
}

main().catch((err) => {
  console.error('[clear-zod-schema] failed:', err);
  process.exit(1);
});
