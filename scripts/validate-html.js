#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('🔍 Validating HTML...');

try {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  // Parse HTML with JSDOM
  const dom = new JSDOM(html, {
    includeNodeLocations: true,
    pretendToBeVisual: true
  });

  const document = dom.window.document;

  // Check for required elements
  const requiredElements = [
    { selector: 'title', name: 'Page title' },
    { selector: 'meta[name="description"]', name: 'Meta description' },
    { selector: 'meta[name="viewport"]', name: 'Viewport meta tag' },
    { selector: '#power-budget-btn', name: 'Power budget navigation button' },
    { selector: '#link-budget-btn', name: 'Link budget navigation button' },
    { selector: '#system-performance-btn', name: 'System performance navigation button' },
    { selector: '#power-budget-section', name: 'Power budget section' },
    { selector: '#link-budget-section', name: 'Link budget section' },
    { selector: '#system-performance-section', name: 'System performance section' },
    { selector: 'script[src*="chart.umd.js"]', name: 'Chart.js script' },
    { selector: 'link[href*="styles.css"]', name: 'Stylesheet link' }
  ];

  let errors = [];

  requiredElements.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (!element) {
      errors.push(`❌ Missing required element: ${name} (${selector})`);
    } else {
      console.log(`✅ Found: ${name}`);
    }
  });

  // Check for Chart.js canvas elements
  const canvases = document.querySelectorAll('canvas[id]');
  const expectedCanvases = [
    'powerByModeChart', 'energyDistributionChart', 'powerTimeChart', 'batteryAnalysisChart',
    'linkMarginVsDistanceChart', 'snrVsFrequencyChart', 'powerVsTxPowerChart', 'linkBudgetBreakdownChart',
    'systemPowerByModeChart', 'systemEnergyDistributionChart', 'systemPowerTimeChart', 'systemBatteryAnalysisChart',
    'systemLinkMarginVsDistanceChart', 'systemSnrVsFrequencyChart', 'systemPowerVsTxPowerChart', 'systemLinkBudgetBreakdownChart'
  ];

  expectedCanvases.forEach(canvasId => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      errors.push(`❌ Missing canvas: ${canvasId}`);
    } else {
      console.log(`✅ Found canvas: ${canvasId}`);
    }
  });

  // Check for form elements
  const forms = document.querySelectorAll('form');
  if (forms.length === 0) {
    errors.push('❌ No forms found');
  } else {
    console.log(`✅ Found ${forms.length} form(s)`);
  }

  // Check for navigation functionality
  const navButtons = document.querySelectorAll('.nav-btn');
  if (navButtons.length < 3) {
    errors.push('❌ Missing navigation buttons');
  } else {
    console.log(`✅ Found ${navButtons.length} navigation buttons`);
  }

  // Check for proper semantic HTML
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    errors.push('❌ No headings found');
  } else {
    console.log(`✅ Found ${headings.length} heading(s)`);
  }

  // Check for alt text on images (if any)
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      errors.push(`❌ Image ${index + 1} missing alt text`);
    }
  });

  if (images.length > 0) {
    console.log(`✅ Found ${images.length} image(s) with alt text`);
  }

  // Check for proper DOCTYPE
  if (!html.trim().startsWith('<!DOCTYPE html>')) {
    errors.push('❌ Missing or incorrect DOCTYPE');
  } else {
    console.log('✅ Valid DOCTYPE');
  }

  // Check for language attribute
  const htmlElement = document.querySelector('html');
  if (!htmlElement || !htmlElement.getAttribute('lang')) {
    errors.push('❌ Missing lang attribute on html element');
  } else {
    console.log('✅ HTML lang attribute present');
  }

  if (errors.length > 0) {
    console.error('\n❌ HTML Validation Failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  } else {
    console.log('\n✅ HTML validation passed!');
  }

} catch (error) {
  console.error('❌ HTML validation error:', error.message);
  process.exit(1);
}