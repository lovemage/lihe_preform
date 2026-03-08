#!/usr/bin/env node
/**
 * Auto-increment version number
 * Run this script before git push to automatically bump patch version
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packagePath = join(__dirname, '..', 'package.json');

try {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const [major, minor, patch] = packageJson.version.split('.').map(Number);

  // Increment patch version
  const newVersion = `${major}.${minor}.${patch + 1}`;
  packageJson.version = newVersion;

  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`✅ Version bumped: ${major}.${minor}.${patch} → ${newVersion}`);
} catch (error) {
  console.error('❌ Failed to bump version:', error.message);
  process.exit(1);
}
