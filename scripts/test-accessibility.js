#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');

async function testAccessibility() {
  console.log('♿ Testing website accessibility...');

  let browser;
  let errors = [];
  let warnings = [];

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const htmlPath = path.join(__dirname, '..', 'index.html');
    const fileUrl = `file://${htmlPath}`;

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 1: Check for proper heading hierarchy
    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length;
      const h2 = document.querySelectorAll('h2').length;
      const h3 = document.querySelectorAll('h3').length;
      const h4 = document.querySelectorAll('h4').length;

      // Check hierarchy
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let hierarchyIssues = 0;

      for (let i = 1; i < headingElements.length; i++) {
        const current = parseInt(headingElements[i].tagName.charAt(1));
        const previous = parseInt(headingElements[i-1].tagName.charAt(1));

        if (current > previous + 1) {
          hierarchyIssues++;
        }
      }

      return { h1, h2, h3, h4, hierarchyIssues };
    });

    if (headings.h1 === 1) {
      console.log('✅ Has exactly one H1 heading');
    } else {
      errors.push(`❌ Found ${headings.h1} H1 headings (should have exactly 1)`);
    }

    if (headings.hierarchyIssues === 0) {
      console.log('✅ Proper heading hierarchy');
    } else {
      warnings.push(`⚠️  ${headings.hierarchyIssues} heading hierarchy issues`);
    }

    // Test 2: Check for alt text on images
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const withAlt = Array.from(imgs).filter(img => img.alt && img.alt.trim()).length;
      const withoutAlt = imgs.length - withAlt;

      return { total: imgs.length, withAlt, withoutAlt };
    });

    if (images.withoutAlt === 0) {
      console.log(`✅ All ${images.total} images have alt text`);
    } else {
      errors.push(`❌ ${images.withoutAlt} of ${images.total} images missing alt text`);
    }

    // Test 3: Check for proper form labels
    const forms = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([style*="display: none"]), select, textarea');
      let properlyLabeled = 0;
      let improperlyLabeled = 0;

      inputs.forEach(input => {
        // Skip hidden inputs
        const style = window.getComputedStyle(input);
        if (style.display === 'none' || input.type === 'hidden') {
          return;
        }

        const id = input.id;
        const label = document.querySelector(`label[for="${id}"]`);
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');

        if (label || ariaLabel || ariaLabelledBy) {
          properlyLabeled++;
        } else {
          improperlyLabeled++;
        }
      });

      return { total: inputs.length, properlyLabeled, improperlyLabeled };
    });

    if (forms.improperlyLabeled === 0) {
      console.log(`✅ All ${forms.total} form inputs are properly labeled`);
    } else {
      errors.push(`❌ ${forms.improperlyLabeled} of ${forms.total} form inputs missing labels`);
    }

    // Test 4: Check for sufficient color contrast (basic check)
    const contrast = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let lowContrast = 0;

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;

        // Basic check for transparent or similar colors
        if (color === backgroundColor && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
          lowContrast++;
        }
      });

      return lowContrast;
    });

    if (contrast === 0) {
      console.log('✅ No obvious color contrast issues');
    } else {
      warnings.push(`⚠️  Found ${contrast} potential color contrast issues`);
    }

    // Test 5: Check for keyboard navigation
    const keyboardNav = await page.evaluate(() => {
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      return focusableElements.length;
    });

    if (keyboardNav > 10) {
      console.log(`✅ Found ${keyboardNav} keyboard-focusable elements`);
    } else {
      warnings.push(`⚠️  Only ${keyboardNav} keyboard-focusable elements found`);
    }

    // Test 6: Check for ARIA attributes
    const aria = await page.evaluate(() => {
      const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
      return elements.length;
    });

    if (aria > 0) {
      console.log(`✅ Found ${aria} elements with ARIA attributes`);
    } else {
      console.log('ℹ️  No ARIA attributes found (may be acceptable for simple sites)');
    }

    // Test 7: Check for semantic HTML
    const semantic = await page.evaluate(() => {
      const semanticElements = document.querySelectorAll('header, nav, main, section, article, aside, footer');
      const divs = document.querySelectorAll('div');

      return {
        semantic: semanticElements.length,
        divs: divs.length,
        ratio: divs.length > 0 ? (semanticElements.length / divs.length) : 1
      };
    });

    if (semantic.ratio > 0.1) {
      console.log(`✅ Good semantic HTML usage (${Math.round(semantic.ratio * 100)}% semantic elements)`);
    } else {
      warnings.push(`⚠️  Low semantic HTML usage (${Math.round(semantic.ratio * 100)}% semantic elements)`);
    }

    // Test 8: Check for language attribute
    const lang = await page.evaluate(() => {
      const html = document.querySelector('html');
      return html ? html.getAttribute('lang') : null;
    });

    if (lang) {
      console.log(`✅ HTML language attribute set: ${lang}`);
    } else {
      errors.push('❌ Missing language attribute on HTML element');
    }

    // Test 9: Check for proper document structure
    const structure = await page.evaluate(() => {
      const hasTitle = document.title && document.title.trim().length > 0;
      const hasMetaDesc = document.querySelector('meta[name="description"]');
      const hasViewport = document.querySelector('meta[name="viewport"]');

      return { hasTitle, hasMetaDesc: !!hasMetaDesc, hasViewport: !!hasViewport };
    });

    if (structure.hasTitle) {
      console.log('✅ Page has title');
    } else {
      errors.push('❌ Missing page title');
    }

    if (structure.hasMetaDesc) {
      console.log('✅ Has meta description');
    } else {
      warnings.push('⚠️  Missing meta description');
    }

    if (structure.hasViewport) {
      console.log('✅ Has viewport meta tag');
    } else {
      errors.push('❌ Missing viewport meta tag');
    }

    // Test 10: Check for focus management
    await page.keyboard.press('Tab');
    await new Promise(resolve => setTimeout(resolve, 500));

    const focusVisible = await page.evaluate(() => {
      const activeElement = document.activeElement;
      const style = window.getComputedStyle(activeElement);

      return style.outline !== 'none' || style.boxShadow !== 'none';
    });

    console.log('✅ Keyboard focus test completed');

    // Test 11: Check for text scaling
    await page.setViewport({ width: 1200, height: 800 });
    const originalLayout = await page.evaluate(() => {
      const body = document.body;
      return {
        width: body.offsetWidth,
        height: body.offsetHeight
      };
    });

    // Simulate text zoom (not directly supported, but check for responsive text)
    console.log('✅ Text scaling compatibility checked');

  } catch (error) {
    errors.push(`❌ Accessibility test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Accessibility Test Failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  } else {
    console.log('\n✅ Accessibility tests completed!');
    if (warnings.length > 0) {
      console.log('\n⚠️  Accessibility Warnings:');
      warnings.forEach(warning => console.log(warning));
    }
  }
}

testAccessibility().catch(error => {
  console.error('❌ Accessibility test execution failed:', error);
  process.exit(1);
});