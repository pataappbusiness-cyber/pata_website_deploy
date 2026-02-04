# Website Cleanup & Speed Optimization - Technical Specification

**Project:** Veterinary Website Audit & Optimization  
**Developer:** Diogo  
**CTO Reviewer:** Claude  
**Date:** 2026-02-04  
**Estimated Time:** 2-3 hours  

---

## 🎯 MISSION OVERVIEW

Perform a comprehensive audit of the website directory structure to:
1. Identify all unused files not connected to index.html
2. Clean up unused assets to reduce project bloat
3. Generate speed optimization report with actionable recommendations

---

## 📋 TASK BREAKDOWN

### **TASK 1: Dependency Analysis (30 min)**

**Objective:** Map all files referenced in index.html and identify orphaned files

**Process:**
1. Parse `index.html` to extract all file references:
   - CSS files (`<link>` tags)
   - JavaScript files (`<script>` tags)
   - Images (`<img src>`, CSS `background-image`)
   - Fonts (`@font-face`, CSS font references)
   - Other assets (favicons, manifests, etc.)

2. Recursively scan referenced files for additional dependencies:
   - CSS imports (`@import`)
   - CSS url() references (images, fonts)
   - JavaScript imports/requires
   - JavaScript dynamic asset loading

3. Compare against all files in project directory

4. Generate comprehensive list of:
   - ✅ **USED FILES** - Connected to index.html
   - ❌ **UNUSED FILES** - Orphaned/not referenced
   - ⚠️ **UNCERTAIN FILES** - Need manual review

**Output:** `UNUSED_FILES_REPORT.md`

**Expected Format:**
```markdown
# Unused Files Analysis Report

## Summary
- Total files scanned: X
- Used files: Y
- Unused files: Z
- Uncertain files: W

## ❌ UNUSED FILES (Safe to delete)
### Images
- /images/old-banner.jpg (150KB)
- /images/unused-icon.png (25KB)

### CSS
- /css/legacy-styles.css (45KB)

### JavaScript
- /js/old-analytics.js (12KB)

### Fonts
- /fonts/unused-font.woff2 (80KB)

**Total space to recover: XYZ KB**

## ⚠️ UNCERTAIN FILES (Manual review needed)
- /js/feature-flag.js - May be loaded conditionally
- /images/backup-logo.svg - Possible fallback asset

## ✅ FILES IN USE (Keep these)
[Brief summary - full list in separate section]
```

---

### **TASK 2: Cleanup Execution (15 min)**

**Objective:** Remove unused files safely

**Safety Checklist:**
- [ ] Backup project before deletion
- [ ] Review uncertain files manually
- [ ] Delete only confirmed unused files
- [ ] Test website functionality after deletion
- [ ] Verify no broken links or 404s

**Process:**
1. Create backup of current project state
2. Execute deletion of confirmed unused files
3. Generate deletion log
4. Verify index.html still loads correctly
5. Check browser console for any 404 errors

**Output:** 
- Cleaned project directory
- `DELETION_LOG.md` with list of removed files

---

### **TASK 3: Speed Analysis & Optimization Report (45-60 min)**

**Objective:** Comprehensive website performance audit with actionable improvements

**Analysis Categories:**

#### **A. Asset Size Analysis**
- Total page weight (HTML + CSS + JS + Images + Fonts)
- Largest individual files (top 10)
- File type breakdown (% of total weight)
- Compression opportunities

#### **B. Loading Performance**
- Render-blocking resources
- Critical CSS identification
- JavaScript blocking assessment
- Font loading strategy review
- Image lazy-loading opportunities

#### **C. Network Efficiency**
- HTTP requests count
- Potential for file concatenation
- CDN usage assessment
- Caching strategy review

#### **D. Image Optimization**
- Already compressed images (note existing work)
- Remaining optimization opportunities
- Modern format recommendations (WebP, AVIF)
- Responsive image strategy
- Sprite sheet opportunities

#### **E. Code Optimization**
- CSS minification status
- JavaScript minification status
- Unused CSS detection
- Dead JavaScript code detection
- Critical CSS extraction opportunity

#### **F. Third-Party Resources**
- External script impact
- Analytics/tracking overhead
- Social media widget performance
- Font loading from external sources

**Output:** `SPEED_OPTIMIZATION_REPORT.md`

**Expected Format:**
```markdown
# Website Speed Optimization Report

## 🎯 Executive Summary
- Current total page weight: XXX KB
- Total HTTP requests: XX
- Estimated load time (3G): X.Xs
- Estimated load time (4G): X.Xs
- **Optimization potential: -XX% page weight, -XX% load time**

---

## 📊 Current State Analysis

### Asset Breakdown
| Asset Type | Count | Total Size | % of Total |
|------------|-------|------------|------------|
| HTML       | 1     | XX KB      | X%         |
| CSS        | X     | XX KB      | X%         |
| JavaScript | X     | XX KB      | X%         |
| Images     | X     | XX KB      | X%         |
| Fonts      | X     | XX KB      | X%         |
| **TOTAL**  | **X** | **XXX KB** | **100%**   |

### Largest Files (Top 10)
1. `/images/hero-banner.jpg` - 250KB ⚠️ High priority
2. `/js/main.js` - 120KB ⚠️ Not minified
3. `/css/styles.css` - 85KB ⚠️ Not minified
...

---

## 🚀 PRIORITY 1: Quick Wins (Impact: High, Effort: Low)

### 1.1 Minify CSS & JavaScript
**Current Impact:** +205KB
**Savings:** ~60KB (29% reduction)
**Effort:** 15 minutes

**Action Items:**
- [ ] Minify `/css/styles.css` (85KB → ~50KB)
- [ ] Minify `/js/main.js` (120KB → ~75KB)

**Implementation:**
```bash
# Use online tool or build process
npx terser js/main.js -o js/main.min.js
npx csso css/styles.css -o css/styles.min.css
```

### 1.2 Optimize Uncompressed Images
**Current Impact:** +XXX KB
**Savings:** ~XXX KB
**Effort:** 30 minutes

**Images to optimize:**
- `/images/hero-banner.jpg` (250KB → ~80KB with compression)
- `/images/gallery-1.jpg` (180KB → ~60KB)

**Note:** You've already compressed some images ✅ - great work!
**Remaining opportunities identified above.**

**Tools:**
- TinyPNG/TinyJPG for lossless compression
- ImageOptim (Mac) / Squoosh (Web)

---

## 🎯 PRIORITY 2: Medium Impact (Impact: Medium, Effort: Medium)

### 2.1 Implement Modern Image Formats
**Savings:** ~30-40% on image weight

**Action:**
```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero">
</picture>
```

### 2.2 Lazy Load Below-the-Fold Images
**Savings:** Faster initial page load

**Action:**
```html
<img src="image.jpg" loading="lazy" alt="Description">
```

### 2.3 Font Loading Optimization
**Current:** [Describe current font loading]
**Improvement:** font-display: swap

```css
@font-face {
  font-family: 'YourFont';
  src: url('font.woff2') format('woff2');
  font-display: swap; /* Add this */
}
```

---

## 🔧 PRIORITY 3: Advanced Optimizations (Impact: Medium, Effort: High)

### 3.1 Critical CSS Extraction
**Benefit:** Eliminate render-blocking CSS

**Process:**
1. Extract above-the-fold CSS
2. Inline critical CSS in `<head>`
3. Async load full stylesheet

### 3.2 Code Splitting
**Benefit:** Reduce initial JavaScript bundle

### 3.3 HTTP/2 Server Push
**Benefit:** Preload critical resources

---

## 📈 Performance Metrics Target

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| Page Weight | XXX KB | YYY KB | -ZZ% |
| HTTP Requests | XX | YY | -Z |
| Load Time (3G) | X.Xs | Y.Ys | -Z.Zs |
| First Contentful Paint | X.Xs | Y.Ys | -Z.Zs |

---

## ✅ Implementation Checklist

### Phase 1: Immediate (This week)
- [ ] Minify all CSS files
- [ ] Minify all JavaScript files  
- [ ] Compress remaining unoptimized images
- [ ] Add lazy loading to images

**Expected Impact:** -XX% page weight, -X.Xs load time

### Phase 2: Short-term (Next 2 weeks)
- [ ] Convert images to WebP with fallbacks
- [ ] Implement font-display: swap
- [ ] Review and remove unused CSS
- [ ] Concatenate small CSS/JS files

**Expected Impact:** Additional -XX% page weight

### Phase 3: Long-term (Next month)
- [ ] Extract critical CSS
- [ ] Implement JavaScript code splitting
- [ ] Set up build process for automation
- [ ] Consider CDN for static assets

**Expected Impact:** -X.Xs load time

---

## 🛠 Recommended Tools

### Free Tools:
- **PageSpeed Insights** - Overall performance score
- **WebPageTest** - Detailed loading waterfall
- **Lighthouse** (Chrome DevTools) - Comprehensive audit

### Image Optimization:
- **Squoosh** (web) - Image compression/conversion
- **TinyPNG** - PNG/JPG compression
- **ImageOptim** (Mac) - Batch optimization

### Code Optimization:
- **csso** - CSS minification
- **terser** - JavaScript minification
- **PurgeCSS** - Remove unused CSS

---

## 📝 Notes
- Already compressed assets noted ✅
- Preserve originals before optimization
- Test functionality after each optimization
- Monitor Core Web Vitals post-deployment

**Next Steps:** Start with Priority 1 quick wins for immediate impact!
```

---

## 🔄 IMPLEMENTATION INSTRUCTIONS FOR CLAUDE CODE

### **Step 1: Locate Project Files**
```bash
# First, ask Diogo for the website directory path
# Expected structure:
# /path/to/website/
#   ├── index.html
#   ├── css/
#   ├── js/
#   ├── images/
#   ├── fonts/
#   └── ...
```

### **Step 2: Parse index.html**
Create a Python script to:
1. Read index.html
2. Extract all file references using regex/HTML parser
3. Recursively scan referenced CSS/JS files for additional dependencies
4. Build complete dependency tree

### **Step 3: Scan File System**
```python
import os
import re
from pathlib import Path

def scan_website_directory(root_path):
    """
    Scan entire website directory and return all files
    """
    all_files = []
    for root, dirs, files in os.walk(root_path):
        for file in files:
            file_path = os.path.join(root, file)
            file_size = os.path.getsize(file_path)
            all_files.append({
                'path': file_path,
                'size': file_size,
                'extension': Path(file).suffix
            })
    return all_files

def parse_html_references(html_file):
    """
    Extract all file references from HTML
    """
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    references = set()
    
    # CSS files
    css_pattern = r'<link[^>]+href=["\']([^"\']+\.css)["\']'
    references.update(re.findall(css_pattern, content))
    
    # JS files
    js_pattern = r'<script[^>]+src=["\']([^"\']+\.js)["\']'
    references.update(re.findall(js_pattern, content))
    
    # Images in HTML
    img_pattern = r'<img[^>]+src=["\']([^"\']+)["\']'
    references.update(re.findall(img_pattern, content))
    
    # Favicon and other links
    link_pattern = r'<link[^>]+href=["\']([^"\']+)["\']'
    references.update(re.findall(link_pattern, content))
    
    return references

def parse_css_references(css_file):
    """
    Extract file references from CSS (images, fonts, imports)
    """
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    references = set()
    
    # url() references
    url_pattern = r'url\(["\']?([^"\'()]+)["\']?\)'
    references.update(re.findall(url_pattern, content))
    
    # @import
    import_pattern = r'@import\s+["\']([^"\']+)["\']'
    references.update(re.findall(import_pattern, content))
    
    return references

def parse_js_references(js_file):
    """
    Extract file references from JavaScript
    """
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    references = set()
    
    # import statements
    import_pattern = r'import\s+.*?from\s+["\']([^"\']+)["\']'
    references.update(re.findall(import_pattern, content))
    
    # require statements
    require_pattern = r'require\(["\']([^"\']+)["\']\)'
    references.update(re.findall(require_pattern, content))
    
    # Dynamic imports or asset loading (common patterns)
    asset_pattern = r'["\']([^"\']+\.(jpg|jpeg|png|gif|svg|webp))["\']'
    references.update([match[0] for match in re.findall(asset_pattern, content)])
    
    return references
```

### **Step 4: Generate UNUSED_FILES_REPORT.md**
```python
def generate_unused_files_report(used_files, all_files, uncertain_files):
    """
    Generate markdown report of unused files
    """
    unused_files = [f for f in all_files if f['path'] not in used_files and f['path'] not in uncertain_files]
    
    report = "# Unused Files Analysis Report\n\n"
    report += "## Summary\n"
    report += f"- Total files scanned: {len(all_files)}\n"
    report += f"- Used files: {len(used_files)}\n"
    report += f"- Unused files: {len(unused_files)}\n"
    report += f"- Uncertain files: {len(uncertain_files)}\n\n"
    
    # Group by file type
    unused_by_type = {}
    total_space = 0
    
    for file in unused_files:
        ext = file['extension']
        if ext not in unused_by_type:
            unused_by_type[ext] = []
        unused_by_type[ext].append(file)
        total_space += file['size']
    
    report += "## ❌ UNUSED FILES (Safe to delete)\n\n"
    
    for ext, files in sorted(unused_by_type.items()):
        report += f"### {ext} files\n"
        for file in files:
            size_kb = file['size'] / 1024
            report += f"- {file['path']} ({size_kb:.1f}KB)\n"
        report += "\n"
    
    report += f"**Total space to recover: {total_space/1024:.1f} KB**\n\n"
    
    # Write to file
    with open('UNUSED_FILES_REPORT.md', 'w') as f:
        f.write(report)
```

### **Step 5: Calculate File Sizes for Speed Report**
```python
def calculate_asset_breakdown(used_files):
    """
    Calculate total size and breakdown by asset type
    """
    breakdown = {
        'HTML': {'count': 0, 'size': 0},
        'CSS': {'count': 0, 'size': 0},
        'JavaScript': {'count': 0, 'size': 0},
        'Images': {'count': 0, 'size': 0},
        'Fonts': {'count': 0, 'size': 0},
        'Other': {'count': 0, 'size': 0}
    }
    
    extension_map = {
        '.html': 'HTML',
        '.css': 'CSS',
        '.js': 'JavaScript',
        '.jpg': 'Images', '.jpeg': 'Images', '.png': 'Images', 
        '.gif': 'Images', '.svg': 'Images', '.webp': 'Images',
        '.woff': 'Fonts', '.woff2': 'Fonts', '.ttf': 'Fonts', 
        '.eot': 'Fonts', '.otf': 'Fonts'
    }
    
    for file in used_files:
        ext = Path(file['path']).suffix.lower()
        category = extension_map.get(ext, 'Other')
        breakdown[category]['count'] += 1
        breakdown[category]['size'] += file['size']
    
    return breakdown
```

### **Step 6: Generate SPEED_OPTIMIZATION_REPORT.md**
Complete implementation of speed analysis with:
- File size calculations
- Identification of large files
- Minification detection (check for .min.js/.min.css)
- Image compression opportunities
- Loading strategy analysis

---

## ⚠️ IMPORTANT CONSIDERATIONS

1. **Backup First:** Always create backup before deletion
2. **Test After Cleanup:** Verify website works after file removal
3. **Conditional Loading:** Some files may be loaded conditionally (JS feature flags, A/B tests)
4. **Future Assets:** Keep files intended for upcoming features (document these separately)
5. **Version Control:** If using Git, commit before and after cleanup

---

## 📊 SUCCESS METRICS

- [ ] All unused files identified
- [ ] Safe cleanup executed without breaking functionality
- [ ] Speed report generated with actionable items
- [ ] Prioritized optimization roadmap created
- [ ] No 404 errors or broken functionality
- [ ] Clear understanding of optimization opportunities

---

## 🎓 LEARNING OBJECTIVES

**Diogo will learn:**
- How to perform dependency analysis
- Web performance optimization fundamentals
- Image optimization best practices
- CSS/JS minification importance
- Critical rendering path concepts

**CTO Claude will teach:**
- Why certain optimizations matter
- Trade-offs between quality and performance
- How to prioritize optimization efforts
- Build process automation basics

---

## 📞 EXECUTION WORKFLOW

**Phase 1: Analysis**
1. Claude Code scans website directory
2. Parses index.html and all referenced files
3. Generates UNUSED_FILES_REPORT.md
4. Diogo reviews uncertain files

**Phase 2: Cleanup**
1. Diogo confirms files to delete
2. Claude Code creates backup
3. Claude Code deletes approved files
4. Generates DELETION_LOG.md
5. Diogo verifies functionality

**Phase 3: Speed Analysis**
1. Claude Code analyzes remaining files
2. Calculates sizes and metrics
3. Generates SPEED_OPTIMIZATION_REPORT.md
4. Diogo reviews recommendations with CTO Claude

---

## ✅ DELIVERABLES

1. **UNUSED_FILES_REPORT.md** - Complete analysis of orphaned files
2. **DELETION_LOG.md** - Record of deleted files
3. **SPEED_OPTIMIZATION_REPORT.md** - Comprehensive performance audit with prioritized action items
4. **Cleaned project directory** - Removed unused files
5. **Backup archive** - Safety copy before changes

---

## 🚀 NEXT STEPS

**To execute this specification:**

1. Provide Claude Code with the website directory path
2. Confirm location of index.html
3. Verify backup exists or will be created
4. Run the analysis scripts
5. Review reports together
6. Execute cleanup with approval
7. Plan optimization implementation

---

*This specification is ready for Claude Code implementation. All analysis logic, report formats, and execution steps are defined. Let's make this website faster and cleaner!* 💪
