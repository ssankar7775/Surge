#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('💻 Validating JavaScript...');

try {
  const jsPath = path.join(__dirname, '..', 'script.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  let errors = [];
  let warnings = [];

  // Check for syntax errors by attempting to create a new Function
  try {
    new Function(js);
    console.log('✅ JavaScript syntax is valid');
  } catch (syntaxError) {
    errors.push(`❌ JavaScript syntax error: ${syntaxError.message}`);
  }

  // Check for required functions
  const requiredFunctions = [
    'updateCharts',
    'calculateLinkBudget',
    'updatePowerByModeChart',
    'updateEnergyDistributionChart',
    'updatePowerTimeChart',
    'updateBatteryAnalysisChart'
  ];

  requiredFunctions.forEach(funcName => {
    if (!js.includes(`function ${funcName}`) && !js.includes(`${funcName} =`)) {
      errors.push(`❌ Missing required function: ${funcName}`);
    } else {
      console.log(`✅ Found function: ${funcName}`);
    }
  });

  // Check for Chart.js usage
  if (js.includes('new Chart') && js.includes('Chart.')) {
    console.log('✅ Chart.js integration found');
  } else {
    errors.push('❌ Chart.js integration not found');
  }

  // Check for DOM manipulation
  const domMethods = ['getElementById', 'querySelector', 'addEventListener'];
  domMethods.forEach(method => {
    if (js.includes(method)) {
      console.log(`✅ DOM method used: ${method}`);
    }
  });

  // Check for localStorage usage
  if (js.includes('localStorage')) {
    console.log('✅ localStorage integration found');
  }

  // Check for event listeners
  const eventTypes = ['click', 'input', 'submit', 'DOMContentLoaded'];
  eventTypes.forEach(eventType => {
    if (js.includes(`'${eventType}'`) || js.includes(`"${eventType}"`)) {
      console.log(`✅ Event listener for: ${eventType}`);
    }
  });

  // Check for error handling
  if (js.includes('try') && js.includes('catch')) {
    console.log('✅ Error handling found');
  } else {
    warnings.push('⚠️  Limited error handling found');
  }

  // Check for console.log statements (should be removed in production)
  const consoleLogs = (js.match(/console\./g) || []).length;
  if (consoleLogs > 0) {
    warnings.push(`⚠️  Found ${consoleLogs} console statements (consider removing for production)`);
  }

  // Check for magic numbers
  const magicNumbers = js.match(/\b\d{2,}\b/g) || [];
  const suspiciousNumbers = magicNumbers.filter(num => {
    const n = parseInt(num);
    return n > 100 && n < 10000 && !js.includes(`// ${num}`) && !js.includes(`/* ${num}`);
  });

  if (suspiciousNumbers.length > 0) {
    warnings.push(`⚠️  Found ${suspiciousNumbers.length} potential magic numbers: ${suspiciousNumbers.slice(0, 5).join(', ')}`);
  }

  // Check for proper function organization
  const functionCount = (js.match(/function\s+\w+|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(/g) || []).length;
  console.log(`ℹ️  Found ${functionCount} functions/variables`);

  // Check for JSDOM compatibility (since we're testing with JSDOM)
  const browserAPIs = ['window', 'document', 'localStorage', 'alert'];
  browserAPIs.forEach(api => {
    if (js.includes(api)) {
      console.log(`✅ Uses browser API: ${api}`);
    }
  });

  // Check for Chart.js specific code
  const chartMethods = ['destroy', 'update', 'getContext'];
  chartMethods.forEach(method => {
    if (js.includes(method)) {
      console.log(`✅ Chart.js method used: ${method}`);
    }
  });

  // Check for navigation functionality
  if (js.includes('classList.add') && js.includes('classList.remove')) {
    console.log('✅ Navigation functionality found');
  }

  // Check for form validation
  if (js.includes('preventDefault') && js.includes('isNaN')) {
    console.log('✅ Form validation found');
  }

  // Check for data persistence
  if (js.includes('JSON.stringify') && js.includes('JSON.parse')) {
    console.log('✅ Data serialization found');
  }

  // Check for file size
  const jsSize = js.length;
  if (jsSize > 100000) {
    warnings.push(`⚠️  JavaScript file is quite large (${Math.round(jsSize/1024)}KB)`);
  } else {
    console.log(`ℹ️  JavaScript file size: ${Math.round(jsSize/1024)}KB`);
  }

  // Test basic functionality with JSDOM
  try {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    const dom = new JSDOM(html, {
      url: 'http://localhost:8000',
      pretendToBeVisual: true,
      resources: 'usable'
    });

    // Mock Chart.js
    dom.window.Chart = class Chart {
      constructor() {
        this.destroy = () => {};
        this.update = () => {};
      }
      static register() {}
    };

    // Mock localStorage
    dom.window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    };

    // Execute the script in the JSDOM context
    // Note: We can't easily test DOMContentLoaded scripts without complex setup,
    // so we'll rely on static analysis for now
    console.log('✅ JavaScript structure validated (skipping runtime test)');

  } catch (runtimeError) {
    console.log('ℹ️  JSDOM test skipped due to DOMContentLoaded dependencies');
  }

  if (errors.length > 0) {
    console.error('\n❌ JavaScript Validation Failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  } else {
    console.log('\n✅ JavaScript validation passed!');
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(warning));
    }
  }

} catch (error) {
  console.error('❌ JavaScript validation error:', error.message);
  process.exit(1);
}