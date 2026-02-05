# LifeBank Website - Quick Start Guide

## Project Overview
LifeBank is a modern blood donation management website with enhanced features for registration, inventory tracking, and donor management.

---

## 📁 Project Structure

```
tej/
├── HTML Pages
│   ├── index.html              - Home page with hero section
│   ├── register.html           - Donor registration form
│   ├── inventory.html          - Blood inventory dashboard
│   ├── about.html              - About page with mission/vision
│   ├── faq-and-process.html    - FAQ and donation process guide
│   └── contact.html            - Contact form and information
│
├── JavaScript Files
│   ├── main.js                 - Core functionality (animations, forms, utilities)
│   ├── security.js             - CSRF protection, input sanitization, rate limiting
│   ├── api.js                  - Backend API integration and WebSocket setup
│   └── sw.js                   - Service Worker for offline support
│
├── Documentation
│   ├── design.md               - Design philosophy and visual language
│   ├── interaction.md          - Interaction design patterns
│   ├── outline.md              - Project outline
│   └── ENHANCEMENTS_SUMMARY.md - Detailed enhancement documentation
│
└── resources/                  - Image assets directory
```

---

## 🚀 Getting Started

### 1. Local Setup
```bash
# No build process required - static HTML project
# Simply open index.html in your browser or serve locally:
python -m http.server 8000  # Python 3
python -m SimpleHTTPServer 8000  # Python 2
# Or use any other local server
```

### 2. Service Worker
The Service Worker (sw.js) registers automatically on page load:
```javascript
// Automatically registers in main.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
```

### 3. API Integration
Configure your API endpoints in `api.js`:
```javascript
const API_CONFIG = {
    endpoints: {
        base: 'https://api.lifebank.org',
        donate: '/api/donate',
        inventory: '/api/inventory',
        // ... more endpoints
    }
};
```

---

## 📋 Key Features

### ✅ Mobile Navigation
- Hamburger menu for mobile devices
- Smooth animations and transitions
- Accessible ARIA labels

### ✅ Form Validation
- Real-time client-side validation
- Error messages below fields
- Password strength indicator
- Auto-save with localStorage

### ✅ Accessibility
- Skip links
- ARIA labels on interactive elements
- Semantic HTML structure
- WCAG 2.1 compliant
- Screen reader support

### ✅ Performance
- Image lazy loading
- Service Worker caching
- Optimized animations
- Small bundle sizes

### ✅ Security
- CSRF token protection
- Input sanitization
- Rate limiting
- Secure API calls

### ✅ User Experience
- Breadcrumb navigation
- Toast notifications
- Back-to-top button
- Smooth scrolling
- Loading states

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file or update `api.js`:
```javascript
REACT_APP_API_URL=https://api.lifebank.org
WEBSOCKET_URL=wss://api.lifebank.org/ws
SMTP_SERVICE=sendgrid
```

### API Configuration
Update endpoints in `api.js`:
```javascript
endpoints: {
    base: 'https://your-api.com',
    donate: '/api/v1/donate',
    // ... etc
}
```

---

## 💻 Development

### File Size Guide
- main.js: ~15KB (core functionality)
- security.js: ~8KB (security utilities)
- api.js: ~10KB (API integration)
- sw.js: ~7KB (Service Worker)
- Total CSS: ~5KB (inline Tailwind)

### Adding New Features

#### 1. New Page
```html
<!-- Copy template from existing page -->
<!-- Update navigation links -->
<!-- Include main.js and security.js -->
```

#### 2. New Form Validation
```javascript
// Add to main.js validateField() switch
case 'newField':
    isValid = value && customValidation(value);
    break;
```

#### 3. New API Call
```javascript
// Add to api.js
async function newFeature(data) {
    return await apiRequest('/api/endpoint', {
        method: 'POST',
        body: data
    });
}
```

---

## 🔌 API Integration Examples

### Submit Donor Registration
```javascript
const donorData = {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-15',
    email: 'john@example.com',
    bloodType: 'O+'
};

API.submitDonorRegistration(donorData)
    .then(response => console.log('Success:', response))
    .catch(error => console.error('Error:', error));
```

### Get Blood Inventory
```javascript
API.getBloodInventory()
    .then(inventory => {
        console.log('Inventory:', inventory);
        // Update UI with inventory data
    })
    .catch(error => console.error('Failed:', error));
```

### Subscribe to Real-time Updates
```javascript
API.subscribeToInventoryUpdates((data) => {
    console.log('Inventory updated:', data);
    // Update UI in real-time
});
```

### Book Appointment
```javascript
const appointmentData = {
    donorId: '12345',
    date: '2026-02-20',
    time: '10:00',
    center: 'Downtown',
    bloodType: 'O+'
};

API.bookAppointment(appointmentData)
    .then(response => {
        showNotification('Appointment booked!', 'success');
    })
    .catch(error => {
        showNotification('Booking failed: ' + error.message, 'error');
    });
```

---

## 🛡️ Security Features

### CSRF Protection
```javascript
// Automatically added to forms
// Token in every POST request
Security.getCSRFToken(); // Get current token
```

### Input Sanitization
```javascript
// Clean user input
const sanitized = Security.sanitizeInput(userInput);
const email = Security.sanitizeEmail(emailInput);
```

### Rate Limiting
```javascript
// Check if action is rate limited
if (Security.formSubmissionLimiter.isLimited(userId)) {
    showNotification('Too many attempts', 'error');
}
```

---

## 📱 Mobile Optimization

### Responsive Breakpoints
- Mobile: < 768px (hamburger menu)
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile Testing
```bash
# Chrome DevTools
# F12 > Toggle device toolbar (Ctrl+Shift+M)

# Local tunnel for mobile testing
# ngrok http 8000
```

---

## 🧪 Testing Checklist

### Functionality
- [ ] All forms validate correctly
- [ ] Mobile menu toggles properly
- [ ] Breadcrumbs navigate correctly
- [ ] Toast notifications display
- [ ] Back-to-top button works

### Accessibility
- [ ] Tab navigation works
- [ ] Skip link functional
- [ ] Screen reader friendly
- [ ] Color contrast passes WCAG
- [ ] Keyboard-only navigation

### Performance
- [ ] Images lazy load
- [ ] Page loads < 3 seconds
- [ ] Service Worker caches
- [ ] Mobile speed acceptable

### Security
- [ ] CSRF tokens in forms
- [ ] No XSS vulnerabilities
- [ ] Input properly sanitized
- [ ] Rate limiting works

### Responsiveness
- [ ] Mobile layout correct
- [ ] Tablet layout correct
- [ ] Desktop layout correct
- [ ] All breakpoints work

---

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All API endpoints configured
- [ ] Environment variables set
- [ ] SSL/HTTPS enabled
- [ ] CORS headers configured
- [ ] Service Worker tested offline
- [ ] Forms tested end-to-end
- [ ] Mobile version tested
- [ ] Performance optimized
- [ ] Security audit passed
- [ ] Analytics configured

### Deployment Steps
```bash
# 1. Build (if using build tools)
npm run build

# 2. Test production build
npm run start:production

# 3. Deploy to hosting
# - Netlify, Vercel, GitHub Pages
# - Self-hosted server
# - AWS S3 + CloudFront

# 4. Post-deployment
# - Test all forms
# - Verify API connections
# - Check Service Worker
# - Monitor errors
```

---

## 📚 Additional Resources

### External Libraries Used
- **Tailwind CSS**: Utility-first CSS framework
- **Anime.js**: Animation library
- **Typed.js**: Typewriter effect
- **ECharts**: Data visualization
- **Splide.js**: Carousel/slider

### Documentation Links
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web Accessibility](https://www.w3.org/WAI/)

---

## 🐛 Troubleshooting

### Service Worker Not Working
```javascript
// Check if registered
navigator.serviceWorker.getRegistrations()
    .then(registrations => console.log(registrations));

// Clear cache
caches.keys().then(names => 
    names.forEach(name => caches.delete(name))
);
```

### Forms Not Validating
- Check browser console for errors
- Verify field IDs match validation function
- Ensure JavaScript files are loaded
- Check for JavaScript errors

### API Not Connecting
- Verify API_CONFIG.endpoints.base
- Check CORS headers on server
- Test endpoint directly
- Check browser console for errors

---

## 📞 Support

For issues or questions:
1. Check console for errors (F12)
2. Review code comments
3. Check ENHANCEMENTS_SUMMARY.md
4. Review api.js documentation
5. Check main.js inline comments

---

## 📝 Code Standards

### Naming Conventions
- camelCase for JavaScript variables and functions
- kebab-case for CSS classes
- PascalCase for constructors
- CONSTANT_CASE for constants

### Comments
- Use JSDoc for functions
- Explain why, not what
- Update comments with code changes

### Error Handling
- Try-catch for async operations
- User-friendly error messages
- Log errors to console in development

---

**Last Updated**: February 5, 2026
**Version**: 1.0
**Status**: Production Ready
