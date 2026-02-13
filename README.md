# 🚀 SURGE - Space Mission Budget Calculator

Advanced Space Mission Budget Calculator with real-time visualization and comprehensive analysis tools for power systems and communications link budgets.

![CI/CD](https://github.com/ssankar7775/Surge/workflows/CI/CD%20Pipeline/badge.svg)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)

## 🌟 Features

- **Power Budget Analysis**: Calculate and visualize power consumption across multiple mission modes
- **Link Budget Calculator**: Real-time communications link analysis with performance metrics
- **System Performance Dashboard**: Comprehensive analysis combining power and communications data
- **Data Persistence**: Export/import functionality with local storage
- **Real-time Charts**: Interactive Chart.js visualizations with custom styling
- **Responsive Design**: Mobile-friendly interface with dark theme
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🛠️ Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/ssankar7775/Surge.git
cd Surge

# Install dependencies
npm install

# Start development server
npm start
```

### Available Scripts

```bash
# Development
npm start              # Start local development server
npm run dev           # Alias for start

# Building & Validation
npm run build         # Full build with validation and tests
npm run validate      # Validate HTML, CSS, and JavaScript
npm run validate-html # Validate HTML structure
npm run validate-css  # Validate CSS syntax and best practices
npm run validate-js   # Validate JavaScript syntax and structure

# Testing
npm run test                 # Run all tests
npm run test-functionality   # Test website functionality with Puppeteer
npm run test-performance     # Test performance metrics
npm run test-accessibility   # Test accessibility compliance

# Code Quality
npm run lint         # Lint JavaScript and CSS
npm run lint-js      # Lint JavaScript with ESLint
npm run lint-css     # Lint CSS with Stylelint

# Deployment
npm run deploy       # Deploy to GitHub Pages
npm run predeploy    # Pre-deployment build
```

### Project Structure

```
Surge/
├── index.html              # Main HTML file
├── styles.css              # CSS styles with dark theme
├── script.js               # Main JavaScript application
├── chart.umd.js            # Chart.js library (local copy)
├── package.json            # Node.js dependencies and scripts
├── scripts/                # Build and test scripts
│   ├── validate-html.js    # HTML validation
│   ├── validate-css.js     # CSS validation
│   ├── validate-js.js      # JavaScript validation
│   ├── test-functionality.js  # Functionality tests
│   ├── test-performance.js    # Performance tests
│   └── test-accessibility.js  # Accessibility tests
├── .github/
│   └── workflows/
│       └── ci-cd.yml       # GitHub Actions CI/CD pipeline
└── README.md               # This file
```

## 🧪 Testing Strategy

The project includes comprehensive testing covering:

### Validation Tests
- **HTML**: Semantic structure, required elements, accessibility
- **CSS**: Syntax, custom properties, responsive design, performance
- **JavaScript**: Syntax, required functions, runtime errors

### Functional Tests
- Navigation between sections
- Form submissions and calculations
- Chart rendering and updates
- Data persistence (localStorage)
- Real-time calculations
- Export/import functionality

### Performance Tests
- Page load times
- Bundle size analysis
- Code coverage (CSS/JS usage)
- Memory usage monitoring
- Animation performance
- DOM query efficiency

### Accessibility Tests
- Heading hierarchy
- Alt text on images
- Form labels and ARIA attributes
- Color contrast
- Keyboard navigation
- Semantic HTML usage
- Screen reader compatibility

## 🚀 Deployment

### Automatic Deployment (GitHub Actions)

The project uses GitHub Actions for automatic CI/CD:

1. **Push to main branch** → Tests run automatically
2. **All tests pass** → Deploy to GitHub Pages
3. **Performance audit** → Lighthouse report generated
4. **Notifications** → Success/failure status

### Manual Deployment

```bash
# Build and test locally
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📊 Performance Metrics

Current performance benchmarks:

- **Page Load**: < 3 seconds
- **Bundle Size**: < 500KB total
- **Lighthouse Score**: > 90 (Performance, Accessibility, Best Practices, SEO)
- **Code Coverage**: > 50% CSS/JS usage
- **Memory Usage**: Stable across navigation

## 🎨 Design System

### Color Palette
- **Primary**: `#00d4ff` (Electric Blue)
- **Secondary**: `#ff6b6b` (Coral)
- **Accent**: `#4ecdc4` (Teal)
- **Background**: Dark gradient with glass-morphism effects

### Typography
- **Headings**: Orbitron (futuristic, monospace)
- **Body**: Rajdhani (technical, sans-serif)
- **Data**: Space Mono (code, monospace)

### Components
- Responsive grid layouts
- Glass-morphism cards
- Animated transitions
- Custom form controls
- Interactive charts

## 🔧 Configuration

### Environment Variables

The application is designed to work in any environment without configuration. All dependencies are bundled locally.

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Node.js Support

- Node.js 18.x (LTS)
- Node.js 20.x (Current)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run build`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **JavaScript**: ESLint configuration
- **CSS**: Stylelint with standard rules
- **HTML**: Semantic, accessible markup
- **Commits**: Conventional commit format

## 📈 Roadmap

- [ ] Multi-mission support
- [ ] Advanced orbital mechanics calculations
- [ ] Satellite constellation analysis
- [ ] Thermal budget calculator
- [ ] Mission timeline visualization
- [ ] Collaborative editing
- [ ] API integration for real-time data

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chart.js for visualization
- Google Fonts for typography
- GitHub Actions for CI/CD
- Puppeteer for testing
- Lighthouse for performance auditing

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ssankar7775/Surge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ssankar7775/Surge/discussions)
- **Email**: For business inquiries

---

**Live Demo**: [https://ssankar7775.github.io/Surge](https://ssankar7775.github.io/Surge)

Built with ❤️ for the space engineering community