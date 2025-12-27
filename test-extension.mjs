#!/usr/bin/env node

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, prefix, message) {
  console.log(`${color}${prefix}${colors.reset} ${message}`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      shell: true,
      stdio: 'pipe',
      ...options
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

async function checkTypeScript() {
  log(colors.blue, '[1/4]', 'Checking TypeScript compilation...');

  const result = await runCommand('pnpm', ['run', 'compile']);

  if (result.code === 0) {
    log(colors.green, '  ✓', 'TypeScript compilation passed');
    return true;
  } else {
    log(colors.red, '  ✗', 'TypeScript compilation failed:');
    console.log(result.stdout);
    console.log(result.stderr);
    return false;
  }
}

async function buildExtension() {
  log(colors.blue, '[2/4]', 'Building extension...');

  const result = await runCommand('pnpm', ['run', 'build:firefox']);

  if (result.code === 0) {
    log(colors.green, '  ✓', 'Build completed successfully');
    return true;
  } else {
    log(colors.red, '  ✗', 'Build failed:');
    console.log(result.stdout);
    console.log(result.stderr);
    return false;
  }
}

async function checkManifest() {
  log(colors.blue, '[3/4]', 'Validating manifest...');

  try {
    const manifestPath = path.join('.output', 'firefox-mv2', 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(manifestContent);

    // Check required fields
    const required = ['manifest_version', 'name', 'version', 'permissions'];
    const missing = required.filter(field => !manifest[field]);

    if (missing.length > 0) {
      log(colors.red, '  ✗', `Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    log(colors.green, '  ✓', `Manifest valid (v${manifest.version})`);
    log(colors.cyan, '    ', `Name: ${manifest.name}`);
    log(colors.cyan, '    ', `Permissions: ${manifest.permissions.join(', ')}`);
    return true;
  } catch (error) {
    log(colors.red, '  ✗', `Failed to read manifest: ${error.message}`);
    return false;
  }
}

async function checkBuildOutput() {
  log(colors.blue, '[4/4]', 'Checking build output...');

  try {
    const outputDir = path.join('.output', 'firefox-mv2');
    const files = await fs.readdir(outputDir);

    const expectedFiles = ['manifest.json', 'background.js', 'popup.html'];
    const missing = expectedFiles.filter(file => !files.includes(file));

    if (missing.length > 0) {
      log(colors.red, '  ✗', `Missing files: ${missing.join(', ')}`);
      return false;
    }

    // Check file sizes
    const stats = await Promise.all(
      expectedFiles.map(async (file) => {
        const stat = await fs.stat(path.join(outputDir, file));
        return { file, size: stat.size };
      })
    );

    log(colors.green, '  ✓', 'All expected files present:');
    stats.forEach(({ file, size }) => {
      const sizeKB = (size / 1024).toFixed(2);
      log(colors.cyan, '    ', `${file}: ${sizeKB} KB`);
    });

    return true;
  } catch (error) {
    log(colors.red, '  ✗', `Failed to check build output: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('');
  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(colors.cyan, '   ', 'Network Traffic Capturer - Automated Test Suite');
  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  const results = [];

  results.push(await checkTypeScript());
  results.push(await buildExtension());
  results.push(await checkManifest());
  results.push(await checkBuildOutput());

  console.log('');
  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const passed = results.filter(r => r).length;
  const total = results.length;

  if (passed === total) {
    log(colors.green, ' ✓ ', `All tests passed (${passed}/${total})`);
    log(colors.green, '   ', 'Extension is ready for testing!');
    console.log('');
    log(colors.cyan, '   ', 'To run in Firefox: pnpm dev:firefox');
  } else {
    log(colors.red, ' ✗ ', `${total - passed} test(s) failed (${passed}/${total} passed)`);
    log(colors.yellow, '   ', 'Fix the issues above and try again');
  }

  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  process.exit(passed === total ? 0 : 1);
}

main().catch((error) => {
  log(colors.red, '✗', `Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
