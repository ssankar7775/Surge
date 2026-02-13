#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testPerformance() {
  console.log('⚡ Testing website performance...');

  let browser;
  let errors = [];
  let warnings = [];

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable performance monitoring
    await page.setCacheEnabled(false);

    const htmlPath = path.join(__dirname, '..', 'index.html');
    const fileUrl = `file://${htmlPath}`;

    // Start performance monitoring
    const startTime = Date.now();

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    const loadTime = Date.now() - startTime;

    if (loadTime < 3000) {
      console.log(`✅ Page loaded in ${loadTime}ms`);
    } else {
      warnings.push(`⚠️  Slow page load: ${loadTime}ms`);
    }

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Test 1: Check bundle size
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.map(r => ({
        name: r.name,
        size: r.transferSize || r.decodedBodySize || 0,
        type: r.initiatorType
      }));
    });

    let totalSize = 0;
    resources.forEach(resource => {
      totalSize += resource.size;
      console.log(`📦 ${resource.type}: ${resource.name} (${Math.round(resource.size/1024)}KB)`);
    });

    if (totalSize < 500000) { // 500KB
      console.log(`✅ Total bundle size: ${Math.round(totalSize/1024)}KB`);
    } else {
      warnings.push(`⚠️  Large bundle size: ${Math.round(totalSize/1024)}KB`);
    }

    // Test 2: Check for render blocking resources
    const renderBlocking = await page.evaluate(() => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      const scripts = document.querySelectorAll('script[src]');

      return {
        stylesheets: stylesheets.length,
        scripts: scripts.length
      };
    });

    console.log(`ℹ️  Found ${renderBlocking.stylesheets} stylesheets and ${renderBlocking.scripts} scripts`);

    // Test 3: Check for unused CSS/JS (basic check)
    const coverage = await page.coverage.startJSCoverage();
    await page.coverage.startCSSCoverage();

    // Navigate through all sections
    const buttons = ['#power-budget-btn', '#link-budget-btn', '#system-performance-btn'];
    for (const buttonId of buttons) {
      const button = await page.$(buttonId);
      if (button) {
        await button.click();
        await page.waitForTimeout(1000);
      }
    }

    const jsCoverage = await page.coverage.stopJSCoverage();
    const cssCoverage = await page.coverage.stopCSSCoverage();

    let totalJSBytes = 0;
    let usedJSBytes = 0;
    let totalCSSBytes = 0;
    let usedCSSBytes = 0;

    jsCoverage.forEach(entry => {
      totalJSBytes += entry.text.length;
      entry.ranges.forEach(range => {
        usedJSBytes += range.end - range.start;
      });
    });

    cssCoverage.forEach(entry => {
      totalCSSBytes += entry.text.length;
      entry.ranges.forEach(range => {
        usedCSSBytes += range.end - range.start;
      });
    });

    const jsUsagePercent = totalJSBytes > 0 ? Math.round((usedJSBytes / totalJSBytes) * 100) : 0;
    const cssUsagePercent = totalCSSBytes > 0 ? Math.round((usedCSSBytes / totalCSSBytes) * 100) : 0;

    console.log(`📊 JavaScript coverage: ${jsUsagePercent}% used`);
    console.log(`📊 CSS coverage: ${cssUsagePercent}% used`);

    if (jsUsagePercent < 50) {
      warnings.push(`⚠️  Low JavaScript usage: ${jsUsagePercent}%`);
    }
    if (cssUsagePercent < 50) {
      warnings.push(`⚠️  Low CSS usage: ${cssUsagePercent}%`);
    }

    // Test 4: Check for memory leaks (basic)
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null;
    });

    // Perform some operations
    for (let i = 0; i < 5; i++) {
      await page.click('#power-budget-btn');
      await page.waitForTimeout(500);
      await page.click('#link-budget-btn');
      await page.waitForTimeout(500);
      await page.click('#system-performance-btn');
      await page.waitForTimeout(500);
    }

    const finalMemory = await page.evaluate(() => {
      return performance.memory ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.used - initialMemory.used;
      const memoryPercent = Math.round((memoryIncrease / initialMemory.used) * 100);

      if (memoryPercent < 50) {
        console.log(`✅ Memory usage stable (+${memoryPercent}%)`);
      } else {
        warnings.push(`⚠️  Significant memory increase: +${memoryPercent}%`);
      }
    }

    // Test 5: Check for smooth animations
    const animationPerformance = await page.evaluate(() => {
      return new Promise(resolve => {
        let frameCount = 0;
        let startTime = performance.now();

        function checkFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(checkFrame);
          } else {
            resolve(frameCount);
          }
        }

        requestAnimationFrame(checkFrame);
      });
    });

    if (animationPerformance > 50) {
      console.log(`✅ Smooth animations: ${animationPerformance} FPS`);
    } else {
      warnings.push(`⚠️  Low frame rate: ${animationPerformance} FPS`);
    }

    // Test 6: Check for large images or assets
    const largeAssets = resources.filter(r => r.size > 100000); // 100KB
    if (largeAssets.length > 0) {
      warnings.push(`⚠️  Found ${largeAssets.length} large assets (>100KB)`);
      largeAssets.forEach(asset => {
        console.log(`   - ${asset.name}: ${Math.round(asset.size/1024)}KB`);
      });
    } else {
      console.log('✅ No large assets found');
    }

    // Test 7: Check for efficient selectors
    const selectorPerformance = await page.evaluate(() => {
      const startTime = performance.now();

      // Test common selectors
      document.querySelectorAll('.nav-btn');
      document.querySelectorAll('canvas');
      document.querySelectorAll('form');
      document.querySelectorAll('.form-group');
      document.getElementById('power-budget-section');
      document.getElementById('link-budget-section');
      document.getElementById('system-performance-section');

      const endTime = performance.now();
      return endTime - startTime;
    });

    if (selectorPerformance < 10) {
      console.log(`✅ Fast DOM queries: ${Math.round(selectorPerformance)}ms`);
    } else {
      warnings.push(`⚠️  Slow DOM queries: ${Math.round(selectorPerformance)}ms`);
    }

    // Test 8: Check for proper resource hints
    const resourceHints = await page.evaluate(() => {
      const links = document.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]');
      return links.length;
    });

    if (resourceHints > 0) {
      console.log(`✅ Found ${resourceHints} resource hints`);
    } else {
      console.log('ℹ️  No resource hints found');
    }

  } catch (error) {
    errors.push(`❌ Performance test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Performance Test Failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  } else {
    console.log('\n✅ Performance tests completed!');
    if (warnings.length > 0) {
      console.log('\n⚠️  Performance Warnings:');
      warnings.forEach(warning => console.log(warning));
    }
  }
}

testPerformance().catch(error => {
  console.error('❌ Performance test execution failed:', error);
  process.exit(1);
});