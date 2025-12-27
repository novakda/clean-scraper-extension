#!/usr/bin/env node

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

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

async function runFirefoxTest() {
  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(colors.cyan, '   ', 'Network Traffic Capturer - Runtime Test');
  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  log(colors.blue, '[1/3]', 'Starting Firefox with extension...');

  const proc = spawn('pnpm', ['run', 'dev:firefox'], {
    shell: true,
    stdio: 'pipe'
  });

  const errors = [];
  const warnings = [];
  let buildComplete = false;
  let firefoxOpened = false;

  proc.stdout.on('data', (data) => {
    const output = data.toString();

    // Check for build completion
    if (output.includes('Built extension')) {
      buildComplete = true;
      log(colors.green, '  ✓', 'Extension built successfully');
    }

    // Check for Firefox opening
    if (output.includes('Opened browser')) {
      firefoxOpened = true;
      log(colors.green, '  ✓', 'Firefox opened with extension loaded');
    }

    // Capture errors
    if (output.toLowerCase().includes('error') && !output.includes('0 error')) {
      errors.push(output.trim());
    }

    // Capture warnings
    if (output.toLowerCase().includes('warning')) {
      warnings.push(output.trim());
    }
  });

  proc.stderr.on('data', (data) => {
    const output = data.toString();

    // Check for StreamFilter errors
    if (output.includes('StreamFilter ERROR')) {
      errors.push('StreamFilter API error detected');
    }

    // Check for popup errors
    if (output.includes('popup') && output.toLowerCase().includes('error')) {
      errors.push('Popup error detected: ' + output.trim());
    }
  });

  // Wait for startup
  await setTimeout(8000);

  log(colors.blue, '[2/3]', 'Checking extension status...');

  if (!buildComplete) {
    log(colors.red, '  ✗', 'Extension failed to build');
  }

  if (!firefoxOpened) {
    log(colors.yellow, '  ⚠', 'Firefox may not have opened (check manually)');
  }

  if (errors.length > 0) {
    log(colors.red, '  ✗', `Found ${errors.length} error(s):`);
    errors.slice(0, 5).forEach(err => {
      log(colors.red, '    ', err.substring(0, 100));
    });
  } else {
    log(colors.green, '  ✓', 'No critical errors detected');
  }

  if (warnings.length > 0) {
    log(colors.yellow, '  ⚠', `Found ${warnings.length} warning(s)`);
  }

  console.log('');
  log(colors.blue, '[3/3]', 'Manual verification steps:');
  log(colors.cyan, '    ', '1. Click the extension icon to open popup');
  log(colors.cyan, '    ', '2. Verify popup UI displays correctly');
  log(colors.cyan, '    ', '3. Navigate to https://code.claude.com/docs');
  log(colors.cyan, '    ', '4. Open Browser Console (Ctrl+Shift+J)');
  log(colors.cyan, '    ', '5. Check for StreamFilter errors');
  log(colors.cyan, '    ', '6. Verify network requests are captured');
  console.log('');

  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log(colors.yellow, '   ', 'Firefox is running. Press Ctrl+C to exit when done.');
  log(colors.cyan, '━━━', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Keep process running
  await new Promise(() => {});
}

runFirefoxTest().catch((error) => {
  log(colors.red, '✗', `Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
