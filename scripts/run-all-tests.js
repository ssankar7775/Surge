#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 SURGE Build & Test Runner');
console.log('==============================\n');

const scripts = [
  { name: 'HTML Validation', command: 'npm run validate-html' },
  { name: 'CSS Validation', command: 'npm run validate-css' },
  { name: 'JavaScript Validation', command: 'npm run validate-js' },
  { name: 'Functionality Tests', command: 'npm run test-functionality' },
  { name: 'Performance Tests', command: 'npm run test-performance' },
  { name: 'Accessibility Tests', command: 'npm run test-accessibility' },
  { name: 'Code Linting', command: 'npm run lint' }
];

let passed = 0;
let failed = 0;

for (const script of scripts) {
  console.log(`\n📋 Running: ${script.name}`);
  console.log('-'.repeat(50));

  try {
    execSync(script.command, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log(`✅ ${script.name} passed`);
    passed++;
  } catch (error) {
    console.log(`❌ ${script.name} failed`);
    failed++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! Ready for deployment.');
  process.exit(0);
} else {
  console.log('💥 Some tests failed. Please fix issues before deploying.');
  process.exit(1);
}