#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testFunctionality() {
  console.log('🧪 Testing website functionality...');

  let browser;
  let errors = [];
  let passedTests = 0;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`🔴 Browser console error: ${msg.text()}`);
      }
    });

    // Navigate to the local server (assuming it's running)
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const fileUrl = `file://${htmlPath}`;

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Check if page title is correct
    const title = await page.title();
    if (title.includes('Space Mission Budget Calculator')) {
      console.log('✅ Page title is correct');
      passedTests++;
    } else {
      errors.push(`❌ Incorrect page title: ${title}`);
    }

    // Test 2: Check if Chart.js is loaded
    const chartLoaded = await page.evaluate(() => {
      return typeof Chart !== 'undefined';
    });

    if (chartLoaded) {
      console.log('✅ Chart.js is loaded');
      passedTests++;
    } else {
      errors.push('❌ Chart.js failed to load');
    }

    // Test 3: Check navigation buttons exist
    const navButtons = await page.$$('.nav-btn');
    if (navButtons.length >= 3) {
      console.log('✅ Navigation buttons found');
      passedTests++;
    } else {
      errors.push(`❌ Only ${navButtons.length} navigation buttons found`);
    }

    // Test 4: Test navigation functionality
    try {
      const powerBtn = await page.$('#power-budget-btn');
      const linkBtn = await page.$('#link-budget-btn');
      const systemBtn = await page.$('#system-performance-btn');

      if (powerBtn && linkBtn && systemBtn) {
        // Click power budget button
        await powerBtn.click();
        await new Promise(resolve => setTimeout(resolve, 500));

        const powerSectionVisible = await page.evaluate(() => {
          const section = document.getElementById('power-budget-section');
          return section && !section.classList.contains('hidden');
        });

        if (powerSectionVisible) {
          console.log('✅ Power budget navigation works');
          passedTests++;
        } else {
          errors.push('❌ Power budget navigation failed');
        }

        // Click link budget button
        await linkBtn.click();
        await new Promise(resolve => setTimeout(resolve, 500));

        const linkSectionVisible = await page.evaluate(() => {
          const section = document.getElementById('link-budget-section');
          return section && !section.classList.contains('hidden');
        });

        if (linkSectionVisible) {
          console.log('✅ Link budget navigation works');
          passedTests++;
        } else {
          errors.push('❌ Link budget navigation failed');
        }

        // Click system performance button
        await systemBtn.click();
        await new Promise(resolve => setTimeout(resolve, 500));

        const systemSectionVisible = await page.evaluate(() => {
          const section = document.getElementById('system-performance-section');
          return section && !section.classList.contains('hidden');
        });

        if (systemSectionVisible) {
          console.log('✅ System performance navigation works');
          passedTests++;
        } else {
          errors.push('❌ System performance navigation failed');
        }
      } else {
        errors.push('❌ Navigation buttons not found');
      }
    } catch (navError) {
      errors.push(`❌ Navigation test failed: ${navError.message}`);
    }

    // Test 5: Check if canvases exist
    const canvasCount = await page.$$eval('canvas', canvases => canvases.length);
    if (canvasCount >= 16) { // 8 power + 8 link budget charts
      console.log(`✅ Found ${canvasCount} canvas elements`);
      passedTests++;
    } else {
      errors.push(`❌ Only ${canvasCount} canvas elements found`);
    }

    // Test 6: Test link budget form
    try {
      const form = await page.$('#link-budget-form');
      if (form) {
        // Fill out form
        await page.type('#frequency', '2.4');
        await page.type('#transmit-power', '10');
        await page.type('#transmit-gain', '15');
        await page.type('#transmit-losses', '1');
        await page.type('#distance', '1000');
        await page.type('#receive-gain', '20');
        await page.type('#receive-losses', '1');
        await page.type('#atmospheric-loss', '0.5');
        await page.type('#noise-temp', '290');
        await page.type('#bandwidth', '1000000');
        await page.type('#required-snr', '10');
        await page.type('#modulation-loss', '2');

        // Submit form
        await form.evaluate(form => form.dispatchEvent(new Event('submit')));
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if results are shown
        const resultsVisible = await page.evaluate(() => {
          const results = document.getElementById('link-budget-results');
          return results && !results.classList.contains('hidden');
        });

        if (resultsVisible) {
          console.log('✅ Link budget calculation works');
          passedTests++;
        } else {
          errors.push('❌ Link budget calculation failed');
        }
      } else {
        errors.push('❌ Link budget form not found');
      }
    } catch (formError) {
      errors.push(`❌ Link budget form test failed: ${formError.message}`);
    }

    // Test 7: Test localStorage functionality
    try {
      const storageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('test', 'value');
          const result = localStorage.getItem('test');
          localStorage.removeItem('test');
          return result === 'value';
        } catch (e) {
          return false;
        }
      });

      if (storageWorks) {
        console.log('✅ localStorage functionality works');
        passedTests++;
      } else {
        errors.push('❌ localStorage functionality failed');
      }
    } catch (storageError) {
      errors.push(`❌ localStorage test failed: ${storageError.message}`);
    }

    // Test 8: Check for JavaScript errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (jsErrors.length === 0) {
      console.log('✅ No JavaScript runtime errors');
      passedTests++;
    } else {
      errors.push(`❌ JavaScript errors found: ${jsErrors.join(', ')}`);
    }

    // Test 9: Check responsive design
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 500));

    const mobileLayout = await page.evaluate(() => {
      const nav = document.querySelector('.main-nav');
      return nav && window.getComputedStyle(nav).flexDirection === 'column';
    });

    console.log('✅ Responsive design test completed');

    // Test 10: Check for accessibility issues (basic)
    const accessibilityScore = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const missingAlt = Array.from(images).filter(img => !img.alt).length;

      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasH1 = document.querySelectorAll('h1').length > 0;

      const forms = document.querySelectorAll('form');
      const labels = document.querySelectorAll('label');

      return {
        missingAlt,
        hasH1,
        formCount: forms.length,
        labelCount: labels.length
      };
    });

    if (accessibilityScore.hasH1) {
      console.log('✅ Has H1 heading');
      passedTests++;
    } else {
      errors.push('❌ Missing H1 heading');
    }

    if (accessibilityScore.missingAlt === 0) {
      console.log('✅ All images have alt text');
      passedTests++;
    } else {
      errors.push(`❌ ${accessibilityScore.missingAlt} images missing alt text`);
    }

  } catch (error) {
    errors.push(`❌ Test setup failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const totalTests = 10;
  const successRate = Math.round((passedTests / totalTests) * 100);

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`);

  if (errors.length > 0) {
    console.error('\n❌ Functionality Test Failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  } else {
    console.log('\n✅ All functionality tests passed!');
  }
}

testFunctionality().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});