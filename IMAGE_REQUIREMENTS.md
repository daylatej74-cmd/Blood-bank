# Image Requirements for LifeBank Website

## Donor Stories Carousel Images
These images are required for the homepage donor stories section. Place them in the `resources/` folder.

### 1. **donor-sarah.jpg**
- **Size**: Minimum 600x800px (portrait orientation)
- **Description**: Professional portrait of a smiling woman (Sarah Johnson, O+ blood type)
- **Requirements**: 
  - Diverse representation (any ethnicity)
  - Age: 30-45 years
  - Professional appearance, warm smile
  - Well-lit, good quality
  - Neutral or professional background

### 2. **donor-michael.jpg**
- **Size**: Minimum 600x800px (portrait orientation)
- **Description**: Professional portrait of a male healthcare worker (Dr. Michael Chen, A- blood type)
- **Requirements**:
  - Professional/medical environment or clean background
  - Age: 35-50 years
  - Medical professional appearance (can wear white coat/scrubs)
  - Confident, trustworthy expression
  - Good lighting and quality

### 3. **donor-maria.jpg**
- **Size**: Minimum 600x800px (portrait orientation)
- **Description**: Professional portrait of a community volunteer (Maria Rodriguez, B+ blood type)
- **Requirements**:
  - Diverse representation
  - Age: 25-40 years
  - Friendly, approachable demeanor
  - Community/volunteer setting suggested
  - Natural lighting, high quality

---

## Image Best Practices

### Format & Quality
- **Format**: JPG (compressed) or PNG
- **Compression**: Optimize with tools like TinyPNG or ImageOptim
- **Quality**: High resolution (600x800px minimum) but compressed for web (< 200KB per image)

### Optimization
```bash
# For JPG compression
convert donor-sarah.jpg -quality 85 -resize 600x800 donor-sarah-optimized.jpg

# For PNG compression (if using PNG)
pngquant 256 donor-sarah.png --output donor-sarah-optimized.png
```

### Accessibility
- All images have proper alt text in the HTML
- Alt text describes the person and their role
- High contrast between subject and background

---

## File Naming Convention
```
resources/
├── donor-sarah.jpg      (Sarah Johnson)
├── donor-michael.jpg    (Dr. Michael Chen)
├── donor-maria.jpg      (Maria Rodriguez)
├── hero-medical.jpg     (Already exists)
├── medical-team.jpg     (Already exists)
├── lab-tech.jpg         (Already exists)
└── ... other resources
```

---

## Implementation Status

### ✅ Carousel Setup Complete
- Splide.js carousel automatically initialized
- Auto-plays with 5-second interval
- Responsive design (1 slide per view)
- Touch/swipe support on mobile
- Pause on hover

### ✅ Charts Initialized
- Blood Supply Trends Chart: Real-time ECharts line chart with 30-day data
- Current Inventory Chart: Bar chart showing current levels by blood type
- Color-coded by blood type for easy identification
- Interactive tooltips and legends
- Responsive to window resize

### Image References
The following images are referenced in your HTML and need to be placed in the `resources/` folder:

| Image | Location | Status | Notes |
|-------|----------|--------|-------|
| donor-sarah.jpg | resources/ | **NEEDED** | Sarah Johnson (O+) |
| donor-michael.jpg | resources/ | **NEEDED** | Dr. Michael Chen (A-) |
| donor-maria.jpg | resources/ | **NEEDED** | Maria Rodriguez (B+) |
| hero-medical.jpg | resources/ | ✅ Exists | Hero section image |
| medical-team.jpg | resources/ | ✅ Exists | Could be reused if needed |
| lab-tech.jpg | resources/ | ✅ Exists | Could be reused if needed |

---

## Quick Setup Checklist

- [ ] Prepare 3 portrait images (Sarah, Michael, Maria)
- [ ] Optimize images (compress to < 200KB each)
- [ ] Name them: `donor-sarah.jpg`, `donor-michael.jpg`, `donor-maria.jpg`
- [ ] Place in `resources/` folder
- [ ] Test carousel on homepage (should auto-play)
- [ ] Test charts on both index.html and inventory.html
- [ ] Verify responsive design on mobile devices

---

## Charts Data

### Blood Supply Trends Chart (inventory.html)
- **Type**: Line area chart
- **Period**: Last 30 days
- **Data Points**: 8 blood types tracked daily
- **Update Frequency**: Static (connects to real API for live updates via api.js)
- **Features**: 
  - Smooth curves with area fill
  - Color-coded by blood type
  - Interactive tooltips
  - Legend toggles
  - Responsive sizing

### Current Inventory Levels Chart (index.html)
- **Type**: Bar chart
- **Display**: Current units available by blood type
- **Features**:
  - Gradient color fill
  - Value labels on top
  - Interactive tooltips
  - Responsive design

---

## Image Source Recommendations

If you don't have professional images, consider:

1. **Free Stock Photo Websites**:
   - Unsplash (unsplash.com)
   - Pexels (pexels.com)
   - Pixabay (pixabay.com)
   - Freepik (freepik.com)

2. **Search Terms**:
   - "Professional portrait" + ethnicity
   - "Healthcare worker portrait"
   - "Community volunteer"
   - "Medical professional headshot"

3. **Important**: Ensure images have proper licensing (free for commercial use)

---

## Technical Notes

- All images are lazy-loaded for performance
- Images are responsive (100% width in containers)
- Object-cover ensures proper aspect ratio
- Height set to 256px (h-64) for consistent carousel appearance
- Alt text provides accessibility for screen readers

