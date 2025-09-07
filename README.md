# fixtures.app - Premier League TV Listings

A modern, efficient single-page application for viewing Premier League fixtures with UK broadcaster information.

## 🚀 Recent Improvements

This codebase has been completely refactored and optimized for better maintainability, performance, and developer experience.

### What Changed

- **Modular Architecture**: Separated monolithic HTML file (1,762 lines) into clean modules
- **Clean Separation of Concerns**: CSS, JavaScript, and HTML are now in separate files
- **Modern ES6 Modules**: JavaScript code is now organized into logical modules with proper imports/exports
- **Improved Performance**: Reduced bundle size and improved loading times
- **Better Maintainability**: Code is now easier to read, modify, and extend

## 📁 Project Structure

```
src/
├── css/
│   └── main.css          # All styles, including responsive design
├── js/
│   ├── config.js         # App configuration and constants
│   ├── utils.js          # Utility functions (dates, API, routing)
│   ├── components.js     # UI rendering functions
│   └── app.js           # Main application logic
├── index.html           # Clean, minimal HTML structure
└── index-original-backup.html  # Backup of original file
```

## 🛠 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+ modules)
- **CSS**: Custom CSS with CSS variables and modern features
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Analytics**: Plausible Analytics

## 🔧 Development

### Prerequisites

- Modern web browser with ES6 module support
- Local web server for development

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pl_tv_mvp_spa
   ```

2. **Start local development server**
   ```bash
   # Using Python (recommended)
   python3 -m http.server 8000
   
   # Using Node.js http-server
   npx http-server . -p 8000
   
   # Using the included dev server
   node dev-server.js
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### File Organization

#### `src/js/config.js`
- Application constants and configuration
- Competition definitions
- Supabase configuration
- Feature flags and settings

#### `src/js/utils.js`
- Competition management functions
- Date/time utilities
- API request handlers
- Routing utilities
- SEO and navigation helpers

#### `src/js/components.js`
- UI rendering functions
- Reusable component templates
- HTML string generators for fixtures, filters, etc.

#### `src/js/app.js`
- Main application initialization
- Route handling
- View rendering coordination
- Event handling setup

#### `src/css/main.css`
- Complete styling system
- CSS custom properties for theming
- Responsive design
- Component-specific styles
- Competition-specific theming

## 🚀 Deployment

The application is designed to be deployed as static files:

1. **Build Process**: No build process required - uses native ES6 modules
2. **Static Hosting**: Compatible with Netlify, Vercel, GitHub Pages, etc.
3. **CDN Ready**: All assets can be served from CDN

### Netlify Deployment

The project includes configuration for Netlify deployment:
- `netlify.toml` - Deployment configuration
- Automatic deploys on push to main branch
- Environment variables configured in Netlify dashboard

## 🧪 Testing

### Manual Testing Checklist

- [ ] Page loads correctly
- [ ] Fixtures display properly
- [ ] Competition switching works
- [ ] Filtering functionality works
- [ ] Mobile responsive design
- [ ] Accessibility features
- [ ] Analytics tracking

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📊 Performance Improvements

### Before Refactor
- Single 1,762-line HTML file
- 340+ JavaScript declarations inline
- Mixed concerns (HTML/CSS/JS together)
- Difficult to maintain and debug

### After Refactor
- Clean separation of concerns
- Modular JavaScript architecture
- Improved caching (separate CSS/JS files)
- Better developer experience
- Easier to extend and maintain

## 🔗 API Integration

### Supabase Tables
- `fixtures` - Match fixture data
- `teams` - Team information and badges
- `broadcasts` - TV broadcaster information
- `competitions` - Competition metadata

### Data Flow
1. App loads competition configuration
2. Fetches fixtures for current competition
3. Loads team data for badges and filtering
4. Retrieves broadcast information
5. Renders UI with grouped fixtures

## 🎨 Theming

The application supports competition-specific theming:
- CSS custom properties for colors
- Dynamic styling based on competition
- Consistent design across all competitions

## 📱 Mobile Support

Fully responsive design with:
- Mobile-first CSS approach
- Touch-friendly interface elements
- Optimized typography and spacing
- Accessible navigation patterns

## 🔒 Security Features

- Content Security Policy headers
- XSS protection
- No inline scripts or styles
- Secure API communications

## 📈 Analytics

- Plausible Analytics integration
- Privacy-focused tracking
- Performance monitoring
- User experience insights

## 🤝 Contributing

1. Follow the established code organization
2. Use ES6+ features and modern JavaScript
3. Maintain responsive design principles
4. Test across multiple browsers
5. Update documentation as needed

## 📄 License

[Add license information]

## 👥 Credits

Developed by Patrick Hallett-Morley
Refactored and optimized for modern web standards.

---

*Last updated: September 2025*