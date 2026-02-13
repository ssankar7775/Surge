#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Validating CSS...');

try {
  const cssPath = path.join(__dirname, '..', 'styles.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  let errors = [];
  let warnings = [];

  // Check for CSS syntax issues
  const bracketCount = (css.match(/\{/g) || []).length;
  const closeBracketCount = (css.match(/\}/g) || []).length;

  if (bracketCount !== closeBracketCount) {
    errors.push('❌ Mismatched braces in CSS');
  } else {
    console.log('✅ CSS braces are balanced');
  }

  // Check for required CSS variables
  const requiredVars = [
    '--primary-color',
    '--secondary-color',
    '--accent-color',
    '--background-color',
    '--text-color',
    '--success-color',
    '--warning-color',
    '--error-color'
  ];

  requiredVars.forEach(varName => {
    if (!css.includes(varName)) {
      errors.push(`❌ Missing CSS variable: ${varName}`);
    } else {
      console.log(`✅ Found CSS variable: ${varName}`);
    }
  });

  // Check for responsive design
  const hasMediaQueries = css.includes('@media');
  if (!hasMediaQueries) {
    warnings.push('⚠️  No media queries found - consider adding responsive design');
  } else {
    console.log('✅ Media queries found for responsive design');
  }

  // Check for keyframe animations
  const hasKeyframes = css.includes('@keyframes');
  if (hasKeyframes) {
    console.log('✅ CSS animations found');
  }

  // Check for CSS custom properties usage
  const varUsage = (css.match(/var\(--[^)]+\)/g) || []).length;
  if (varUsage > 0) {
    console.log(`✅ Using ${varUsage} CSS custom properties`);
  }

  // Check for important declarations (should be minimized)
  const importantCount = (css.match(/!important/g) || []).length;
  if (importantCount > 10) {
    warnings.push(`⚠️  High number of !important declarations (${importantCount})`);
  } else if (importantCount > 0) {
    console.log(`ℹ️  Found ${importantCount} !important declaration(s)`);
  }

  // Check for CSS grid or flexbox usage
  const hasFlexbox = css.includes('display: flex') || css.includes('display: inline-flex');
  const hasGrid = css.includes('display: grid') || css.includes('display: inline-grid');

  if (hasFlexbox) {
    console.log('✅ Flexbox layout found');
  }
  if (hasGrid) {
    console.log('✅ CSS Grid layout found');
  }

  // Check for dark theme variables
  const darkThemeVars = ['--bg-primary', '--bg-secondary', '--text-primary', '--text-secondary'];
  darkThemeVars.forEach(varName => {
    if (css.includes(varName)) {
      console.log(`✅ Dark theme variable: ${varName}`);
    }
  });

  // Check for glass-morphism effects
  if (css.includes('backdrop-filter') || css.includes('background: rgba')) {
    console.log('✅ Glass-morphism effects found');
  }

  // Check for proper CSS organization
  const sections = css.split('}').filter(section => section.trim().length > 0);
  console.log(`ℹ️  CSS has ${sections.length} rule blocks`);

  // Check for unused CSS (basic check - look for common patterns)
  const suspiciousSelectors = [
    /^\.unused/i,
    /^\.temp/i,
    /^\.debug/i
  ];

  suspiciousSelectors.forEach(pattern => {
    const matches = css.match(new RegExp(pattern.source, 'gm'));
    if (matches) {
      warnings.push(`⚠️  Found potentially unused selectors: ${matches.join(', ')}`);
    }
  });

  // Check for CSS file size
  const cssSize = css.length;
  if (cssSize > 50000) {
    warnings.push(`⚠️  CSS file is quite large (${Math.round(cssSize/1024)}KB)`);
  } else {
    console.log(`ℹ️  CSS file size: ${Math.round(cssSize/1024)}KB`);
  }

  if (errors.length > 0) {
    console.error('\n❌ CSS Validation Failed:');
    errors.forEach(error => console.error(error));
    process.exit(1);
  } else {
    console.log('\n✅ CSS validation passed!');
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(warning));
    }
  }

} catch (error) {
  console.error('❌ CSS validation error:', error.message);
  process.exit(1);
}