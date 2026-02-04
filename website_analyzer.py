#!/usr/bin/env python3
"""
Website Cleanup & Speed Optimization Analyzer
Performs dependency analysis and generates optimization reports
"""

import os
import re
from pathlib import Path
from collections import defaultdict
import json

class WebsiteAnalyzer:
    def __init__(self, root_path):
        self.root_path = Path(root_path)
        self.used_files = set()
        self.uncertain_files = set()
        self.all_files = []

    def scan_directory(self):
        """Scan entire website directory and catalog all files"""
        print("📁 Scanning website directory...")

        exclude_dirs = {'.git', 'node_modules', '__pycache__', '.vscode'}
        exclude_files = {'website_analyzer.py', '.gitignore', '.DS_Store'}

        for root, dirs, files in os.walk(self.root_path):
            # Remove excluded directories from traversal
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file in exclude_files or file.endswith('.md'):
                    continue

                file_path = Path(root) / file
                try:
                    file_size = file_path.stat().st_size
                    relative_path = file_path.relative_to(self.root_path)

                    # Normalize to forward slashes for consistency
                    normalized_path = relative_path.as_posix()

                    self.all_files.append({
                        'path': normalized_path,
                        'absolute_path': str(file_path),
                        'size': file_size,
                        'extension': file_path.suffix.lower()
                    })
                except Exception as e:
                    print(f"⚠️  Error scanning {file_path}: {e}")

        print(f"✅ Found {len(self.all_files)} files")
        return self.all_files

    def normalize_path(self, path, reference_file):
        """Normalize a file path relative to the project root"""
        if path.startswith('http://') or path.startswith('https://') or path.startswith('//'):
            return None  # External resource

        # Remove query strings and fragments
        path = path.split('?')[0].split('#')[0]

        # Handle absolute paths from root
        if path.startswith('/'):
            path = path[1:]
        else:
            # Handle relative paths
            reference_dir = Path(reference_file).parent
            path = str(reference_dir / path)

        # Normalize the path
        try:
            normalized = Path(path).as_posix()
            return normalized
        except:
            return None

    def parse_html(self, html_file):
        """Extract all file references from HTML"""
        print(f"📄 Parsing {html_file}...")

        try:
            with open(self.root_path / html_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"⚠️  Error reading {html_file}: {e}")
            return set()

        references = set()

        # CSS files - link tags
        for match in re.finditer(r'<link[^>]+href=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # JavaScript files - script tags
        for match in re.finditer(r'<script[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # Images in img tags - both src and data-src
        for match in re.finditer(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        for match in re.finditer(r'<img[^>]+data-src=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # Source tags - handle src, srcset, data-src, data-srcset
        for match in re.finditer(r'<source[^>]+(?:src|srcset)=["\']([^"\']+)["\']', content, re.IGNORECASE):
            srcset = match.group(1)
            for src in srcset.split(','):
                src = src.strip().split()[0]
                ref = self.normalize_path(src, html_file)
                if ref:
                    references.add(ref)

        for match in re.finditer(r'<source[^>]+data-(?:src|srcset)=["\']([^"\']+)["\']', content, re.IGNORECASE):
            srcset = match.group(1)
            for src in srcset.split(','):
                src = src.strip().split()[0]
                ref = self.normalize_path(src, html_file)
                if ref:
                    references.add(ref)

        # Video tags with src or data-src
        for match in re.finditer(r'<video[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        for match in re.finditer(r'<video[^>]+data-src=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # Audio tags
        for match in re.finditer(r'<audio[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # Data attributes (data-src, data-video, data-bg, etc.) - more comprehensive
        asset_extensions = r'jpg|jpeg|png|gif|svg|webp|mp4|webm|ogg|mov|avi|pdf|woff|woff2|ttf|eot|otf|ico'
        for match in re.finditer(rf'data-[a-z\-]+=["\']([^"\']+\.(?:{asset_extensions}))["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # Background images in inline styles
        for match in re.finditer(r'style=["\'][^"\']*background(?:-image)?:\s*url\(["\']?([^"\'()]+)["\']?\)', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        # Favicon and other resources
        for match in re.finditer(r'<link[^>]+href=["\']([^"\']+\.(?:ico|png|jpg|svg))["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), html_file)
            if ref:
                references.add(ref)

        print(f"  Found {len(references)} references in HTML")
        return references

    def parse_css(self, css_file):
        """Extract file references from CSS"""
        print(f"🎨 Parsing CSS: {css_file}...")

        try:
            with open(self.root_path / css_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"⚠️  Error reading {css_file}: {e}")
            return set()

        references = set()

        # url() references - images, fonts, etc.
        for match in re.finditer(r'url\(["\']?([^"\'()]+)["\']?\)', content):
            ref = self.normalize_path(match.group(1), css_file)
            if ref:
                references.add(ref)

        # @import statements
        for match in re.finditer(r'@import\s+["\']([^"\']+)["\']', content):
            ref = self.normalize_path(match.group(1), css_file)
            if ref:
                references.add(ref)

        print(f"  Found {len(references)} references in CSS")
        return references

    def parse_js(self, js_file):
        """Extract file references from JavaScript"""
        print(f"⚡ Parsing JS: {js_file}...")

        try:
            with open(self.root_path / js_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"⚠️  Error reading {js_file}: {e}")
            return set()

        references = set()

        # import statements
        for match in re.finditer(r'import\s+.*?from\s+["\']([^"\']+)["\']', content):
            ref = self.normalize_path(match.group(1), js_file)
            if ref:
                references.add(ref)

        # require statements
        for match in re.finditer(r'require\(["\']([^"\']+)["\']\)', content):
            ref = self.normalize_path(match.group(1), js_file)
            if ref:
                references.add(ref)

        # Asset references in strings - images, videos, audio
        asset_extensions = r'jpg|jpeg|png|gif|svg|webp|ico|mp4|webm|ogg|mov|avi|pdf|woff|woff2|ttf|eot|otf'
        for match in re.finditer(rf'["\']([^"\']+\.(?:{asset_extensions}))["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), js_file)
            if ref:
                references.add(ref)

        # URL constructor patterns: new URL('path', import.meta.url)
        for match in re.finditer(r'new\s+URL\s*\(\s*["\']([^"\']+)["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), js_file)
            if ref:
                references.add(ref)

        # querySelector with src/href assignments
        # e.g., element.src = 'path/to/file.mp4'
        for match in re.finditer(rf'\.(?:src|href)\s*=\s*["\']([^"\']+\.(?:{asset_extensions}))["\']', content, re.IGNORECASE):
            ref = self.normalize_path(match.group(1), js_file)
            if ref:
                references.add(ref)

        print(f"  Found {len(references)} references in JS")
        return references

    def build_dependency_tree(self, start_file='index.html'):
        """Build complete dependency tree starting from index.html"""
        print(f"\n🔍 Building dependency tree from {start_file}...\n")

        to_process = {start_file}
        processed = set()

        while to_process:
            current_file = to_process.pop()

            if current_file in processed:
                continue

            processed.add(current_file)
            self.used_files.add(current_file)

            # Check if file exists
            file_path = self.root_path / current_file
            if not file_path.exists():
                continue

            # Parse based on file type
            references = set()

            if current_file.endswith('.html'):
                references = self.parse_html(current_file)
            elif current_file.endswith('.css'):
                references = self.parse_css(current_file)
            elif current_file.endswith('.js'):
                references = self.parse_js(current_file)

            # Add new references to processing queue
            for ref in references:
                if ref not in processed:
                    # Check if referenced file exists
                    if (self.root_path / ref).exists():
                        to_process.add(ref)
                        self.used_files.add(ref)

        # After building the tree, also mark compressed versions as used
        self.mark_compressed_versions_as_used()

        print(f"\n✅ Dependency tree complete: {len(self.used_files)} files in use\n")

    def mark_compressed_versions_as_used(self):
        """Mark .gz and .br versions of used files as also being used"""
        print("🔍 Checking for compressed versions of used files...")

        compressed_files_found = 0
        used_files_list = list(self.used_files)

        for used_file in used_files_list:
            # Check for .gz version
            gz_version = f"{used_file}.gz"
            if (self.root_path / gz_version).exists():
                self.used_files.add(gz_version)
                compressed_files_found += 1

            # Check for .br version
            br_version = f"{used_file}.br"
            if (self.root_path / br_version).exists():
                self.used_files.add(br_version)
                compressed_files_found += 1

        if compressed_files_found > 0:
            print(f"✅ Found and marked {compressed_files_found} compressed versions as used")

    def generate_unused_files_report(self):
        """Generate markdown report of unused files"""
        print("📊 Generating unused files report...")

        used_paths = {f for f in self.used_files}
        unused_files = [f for f in self.all_files if f['path'] not in used_paths]

        # Separate compressed versions from regular used files
        compressed_in_use = [f for f in self.all_files
                            if f['path'] in used_paths
                            and (f['path'].endswith('.gz') or f['path'].endswith('.br'))]

        # Group by extension
        unused_by_ext = defaultdict(list)
        total_space = 0

        for file in unused_files:
            ext = file['extension'] or 'no extension'
            unused_by_ext[ext].append(file)
            total_space += file['size']

        # Generate report
        report = "# Unused Files Analysis Report\n\n"
        report += f"**Generated:** {Path.cwd()}\n"
        report += f"**Analysis Date:** 2026-02-04\n\n"

        report += "## 📊 Summary\n\n"
        report += f"- **Total files scanned:** {len(self.all_files)}\n"
        report += f"- **Files in use:** {len(self.used_files)}\n"
        if compressed_in_use:
            report += f"  - Including {len(compressed_in_use)} compressed versions (.gz/.br)\n"
        report += f"- **Unused files:** {len(unused_files)}\n"
        report += f"- **Uncertain files:** {len(self.uncertain_files)}\n\n"

        if unused_files:
            report += "## ❌ UNUSED FILES (Safe to delete)\n\n"

            # Sort by category
            categories = {
                '.html': 'HTML Files',
                '.css': 'CSS Files',
                '.js': 'JavaScript Files',
                '.jpg': 'Images', '.jpeg': 'Images', '.png': 'Images',
                '.gif': 'Images', '.svg': 'Images', '.webp': 'Images',
                '.woff': 'Fonts', '.woff2': 'Fonts', '.ttf': 'Fonts',
                '.eot': 'Fonts', '.otf': 'Fonts'
            }

            categorized = defaultdict(list)
            for ext, files in unused_by_ext.items():
                category = categories.get(ext, f'{ext.upper()} Files' if ext else 'Other Files')
                categorized[category].extend(files)

            for category in sorted(categorized.keys()):
                files = categorized[category]
                report += f"### {category}\n"
                for file in sorted(files, key=lambda x: x['size'], reverse=True):
                    size_kb = file['size'] / 1024
                    report += f"- `{file['path']}` ({size_kb:.1f} KB)\n"
                report += "\n"

            report += f"**💾 Total space to recover: {total_space/1024:.1f} KB ({total_space/1024/1024:.2f} MB)**\n\n"
        else:
            report += "## ✅ No Unused Files Found\n\n"
            report += "All files in the project are referenced and in use!\n\n"

        if self.uncertain_files:
            report += "## ⚠️ UNCERTAIN FILES (Manual review needed)\n\n"
            for file in self.uncertain_files:
                report += f"- `{file}` - May be loaded conditionally\n"
            report += "\n"

        # Add section about compressed files if any exist
        if compressed_in_use:
            report += "## 📦 COMPRESSED FILES (Kept - Server Optimization)\n\n"
            report += f"Found {len(compressed_in_use)} pre-compressed versions of active files.\n"
            report += "These are used by the server for faster delivery when browsers support compression.\n\n"

            # Group by compression type
            gz_files = [f for f in compressed_in_use if f['path'].endswith('.gz')]
            br_files = [f for f in compressed_in_use if f['path'].endswith('.br')]

            if gz_files:
                total_gz_size = sum(f['size'] for f in gz_files)
                report += f"**Gzip (.gz) files:** {len(gz_files)} files ({total_gz_size/1024:.1f} KB)\n"

            if br_files:
                total_br_size = sum(f['size'] for f in br_files)
                report += f"**Brotli (.br) files:** {len(br_files)} files ({total_br_size/1024:.1f} KB)\n"

            report += "\n**Note:** These files are kept because their original versions are in use.\n\n"

        report += "## ✅ FILES IN USE\n\n"
        report += f"Total: {len(self.used_files)} files are actively referenced by index.html\n\n"
        report += "<details>\n<summary>Click to expand full list</summary>\n\n"
        for file in sorted(self.used_files):
            report += f"- {file}\n"
        report += "\n</details>\n"

        # Write report
        output_path = self.root_path / 'UNUSED_FILES_REPORT.md'
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"✅ Report saved to: UNUSED_FILES_REPORT.md")
        return output_path

    def analyze_performance(self):
        """Analyze website performance and generate optimization report"""
        print("\n🚀 Analyzing website performance...\n")

        # Calculate asset breakdown
        breakdown = {
            'HTML': {'count': 0, 'size': 0, 'files': []},
            'CSS': {'count': 0, 'size': 0, 'files': []},
            'JavaScript': {'count': 0, 'size': 0, 'files': []},
            'Images': {'count': 0, 'size': 0, 'files': []},
            'Fonts': {'count': 0, 'size': 0, 'files': []},
            'Other': {'count': 0, 'size': 0, 'files': []}
        }

        extension_map = {
            '.html': 'HTML',
            '.css': 'CSS',
            '.js': 'JavaScript',
            '.jpg': 'Images', '.jpeg': 'Images', '.png': 'Images',
            '.gif': 'Images', '.svg': 'Images', '.webp': 'Images', '.ico': 'Images',
            '.woff': 'Fonts', '.woff2': 'Fonts', '.ttf': 'Fonts',
            '.eot': 'Fonts', '.otf': 'Fonts'
        }

        # Only analyze files that are in use
        used_file_data = [f for f in self.all_files if f['path'] in self.used_files]

        for file in used_file_data:
            ext = file['extension']
            category = extension_map.get(ext, 'Other')
            breakdown[category]['count'] += 1
            breakdown[category]['size'] += file['size']
            breakdown[category]['files'].append(file)

        # Calculate totals
        total_size = sum(cat['size'] for cat in breakdown.values())
        total_count = sum(cat['count'] for cat in breakdown.values())

        # Find largest files
        all_used = sorted(used_file_data, key=lambda x: x['size'], reverse=True)[:10]

        # Detect minification status
        unminified_css = [f for f in breakdown['CSS']['files'] if not f['path'].endswith('.min.css')]
        unminified_js = [f for f in breakdown['JavaScript']['files'] if not f['path'].endswith('.min.js')]

        # Generate report
        report = self.generate_speed_report(breakdown, total_size, total_count, all_used,
                                             unminified_css, unminified_js)

        output_path = self.root_path / 'SPEED_OPTIMIZATION_REPORT.md'
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)

        print(f"✅ Speed report saved to: SPEED_OPTIMIZATION_REPORT.md")
        return output_path

    def generate_speed_report(self, breakdown, total_size, total_count, largest_files,
                              unminified_css, unminified_js):
        """Generate detailed speed optimization report"""

        report = "# Website Speed Optimization Report\n\n"
        report += "**Generated:** 2026-02-04\n"
        report += "**Project:** PATA Veterinary Website\n\n"

        # Executive Summary
        report += "## 🎯 Executive Summary\n\n"
        report += f"- **Current total page weight:** {total_size/1024:.1f} KB ({total_size/1024/1024:.2f} MB)\n"
        report += f"- **Total HTTP requests:** {total_count}\n"

        # Estimate load times (rough estimates)
        load_time_3g = (total_size / 1024) / 400  # ~400 KB/s for 3G
        load_time_4g = (total_size / 1024) / 3000  # ~3 MB/s for 4G

        report += f"- **Estimated load time (3G):** {load_time_3g:.1f}s\n"
        report += f"- **Estimated load time (4G):** {load_time_4g:.2f}s\n\n"

        # Calculate potential savings
        css_savings = sum(f['size'] for f in unminified_css) * 0.3
        js_savings = sum(f['size'] for f in unminified_js) * 0.35
        total_savings = css_savings + js_savings

        if total_savings > 0:
            savings_percent = (total_savings / total_size) * 100
            report += f"- **💡 Optimization potential:** -{savings_percent:.1f}% page weight (~{total_savings/1024:.1f} KB)\n"

        report += "\n---\n\n"

        # Current State Analysis
        report += "## 📊 Current State Analysis\n\n"
        report += "### Asset Breakdown\n\n"
        report += "| Asset Type | Count | Total Size | % of Total |\n"
        report += "|------------|-------|------------|------------|\n"

        for cat_name in ['HTML', 'CSS', 'JavaScript', 'Images', 'Fonts', 'Other']:
            cat = breakdown[cat_name]
            if cat['count'] > 0:
                size_kb = cat['size'] / 1024
                percent = (cat['size'] / total_size * 100) if total_size > 0 else 0
                report += f"| {cat_name} | {cat['count']} | {size_kb:.1f} KB | {percent:.1f}% |\n"

        report += f"| **TOTAL** | **{total_count}** | **{total_size/1024:.1f} KB** | **100%** |\n\n"

        # Largest Files
        report += "### 📦 Largest Files (Top 10)\n\n"
        for i, file in enumerate(largest_files, 1):
            size_kb = file['size'] / 1024
            priority = "⚠️ High priority" if size_kb > 100 else ""
            is_minified = '.min.' in file['path']
            minification_note = "" if is_minified else " (not minified)" if file['extension'] in ['.css', '.js'] else ""
            report += f"{i}. `{file['path']}` - {size_kb:.1f} KB {priority}{minification_note}\n"

        report += "\n---\n\n"

        # Priority 1: Quick Wins
        report += "## 🚀 PRIORITY 1: Quick Wins (High Impact, Low Effort)\n\n"

        if unminified_css or unminified_js:
            report += "### 1.1 Minify CSS & JavaScript\n\n"

            total_unminified = sum(f['size'] for f in unminified_css) + sum(f['size'] for f in unminified_js)
            estimated_savings = total_unminified * 0.32

            report += f"**Current Impact:** +{total_unminified/1024:.1f} KB unminified\n"
            report += f"**Potential Savings:** ~{estimated_savings/1024:.1f} KB (32% reduction)\n"
            report += f"**Effort:** 15-20 minutes\n\n"

            if unminified_css:
                report += "**CSS Files to Minify:**\n"
                for f in unminified_css:
                    report += f"- `{f['path']}` ({f['size']/1024:.1f} KB → ~{f['size']*0.68/1024:.1f} KB)\n"
                report += "\n"

            if unminified_js:
                report += "**JavaScript Files to Minify:**\n"
                for f in unminified_js:
                    report += f"- `{f['path']}` ({f['size']/1024:.1f} KB → ~{f['size']*0.65/1024:.1f} KB)\n"
                report += "\n"

            report += "**Implementation:**\n```bash\n"
            report += "# CSS Minification\n"
            for f in unminified_css[:3]:  # Show first 3
                base_name = f['path'].replace('.css', '')
                report += f"npx csso {f['path']} -o {base_name}.min.css\n"

            report += "\n# JavaScript Minification\n"
            for f in unminified_js[:3]:  # Show first 3
                base_name = f['path'].replace('.js', '')
                report += f"npx terser {f['path']} -o {base_name}.min.js -c -m\n"
            report += "```\n\n"

        # Image optimization
        large_images = [f for f in breakdown['Images']['files'] if f['size'] > 100000]  # > 100KB
        if large_images:
            report += "### 1.2 Optimize Large Images\n\n"
            report += f"**Found {len(large_images)} images over 100 KB**\n\n"

            for img in sorted(large_images, key=lambda x: x['size'], reverse=True)[:5]:
                estimated_optimized = img['size'] * 0.4
                report += f"- `{img['path']}` ({img['size']/1024:.1f} KB → ~{estimated_optimized/1024:.1f} KB with compression)\n"

            report += "\n**Tools:**\n"
            report += "- [TinyPNG](https://tinypng.com/) for lossless compression\n"
            report += "- [Squoosh](https://squoosh.app/) for WebP conversion\n"
            report += "- ImageOptim (Mac) for batch optimization\n\n"

        report += "---\n\n"

        # Priority 2: Medium Impact
        report += "## 🎯 PRIORITY 2: Medium Impact Optimizations\n\n"

        report += "### 2.1 Implement Modern Image Formats (WebP/AVIF)\n\n"
        report += "**Benefit:** 30-40% reduction in image file sizes\n\n"
        report += "**Implementation:**\n```html\n"
        report += "<picture>\n"
        report += "  <source srcset=\"image.avif\" type=\"image/avif\">\n"
        report += "  <source srcset=\"image.webp\" type=\"image/webp\">\n"
        report += "  <img src=\"image.jpg\" alt=\"Description\">\n"
        report += "</picture>\n```\n\n"

        report += "### 2.2 Lazy Load Below-the-Fold Images\n\n"
        report += "**Benefit:** Faster initial page load, reduced initial bandwidth\n\n"
        report += "**Implementation:**\n```html\n"
        report += "<img src=\"image.jpg\" loading=\"lazy\" alt=\"Description\">\n```\n\n"

        # Check if fonts exist
        if breakdown['Fonts']['count'] > 0:
            report += "### 2.3 Font Loading Optimization\n\n"
            report += "**Current:** Font files detected\n"
            report += "**Improvement:** Add `font-display: swap` to prevent invisible text\n\n"
            report += "```css\n@font-face {\n"
            report += "  font-family: 'YourFont';\n"
            report += "  src: url('font.woff2') format('woff2');\n"
            report += "  font-display: swap; /* Prevents FOIT */\n"
            report += "}\n```\n\n"

        report += "---\n\n"

        # Priority 3: Advanced
        report += "## 🔧 PRIORITY 3: Advanced Optimizations\n\n"

        report += "### 3.1 Critical CSS Extraction\n\n"
        report += "**Benefit:** Eliminate render-blocking CSS, faster First Contentful Paint\n\n"
        report += "**Process:**\n"
        report += "1. Extract above-the-fold CSS\n"
        report += "2. Inline critical CSS in `<head>`\n"
        report += "3. Async load full stylesheet\n\n"

        report += "### 3.2 JavaScript Code Splitting\n\n"
        report += "**Benefit:** Load only necessary code for initial render\n\n"

        report += "### 3.3 Enable HTTP/2 Server Push\n\n"
        report += "**Benefit:** Preload critical resources\n\n"

        report += "---\n\n"

        # Implementation Checklist
        report += "## ✅ Implementation Checklist\n\n"

        report += "### Phase 1: Immediate (This Week)\n"
        if unminified_css:
            report += "- [ ] Minify all CSS files\n"
        if unminified_js:
            report += "- [ ] Minify all JavaScript files\n"
        if large_images:
            report += "- [ ] Compress large images (>100KB)\n"
        report += "- [ ] Add lazy loading to below-fold images\n"
        report += "- [ ] Test website functionality\n\n"

        if unminified_css or unminified_js:
            total_phase1_savings = (sum(f['size'] for f in unminified_css) * 0.3 +
                                    sum(f['size'] for f in unminified_js) * 0.35)
            savings_percent = (total_phase1_savings / total_size) * 100
            report += f"**Expected Impact:** -{savings_percent:.1f}% page weight (~{total_phase1_savings/1024:.1f} KB savings)\n\n"

        report += "### Phase 2: Short-term (Next 2 Weeks)\n"
        report += "- [ ] Convert images to WebP with fallbacks\n"
        report += "- [ ] Implement font-display: swap\n"
        report += "- [ ] Review and remove unused CSS\n"
        report += "- [ ] Set up proper caching headers\n\n"

        report += "### Phase 3: Long-term (Next Month)\n"
        report += "- [ ] Extract critical CSS\n"
        report += "- [ ] Implement JavaScript code splitting\n"
        report += "- [ ] Set up build process automation\n"
        report += "- [ ] Consider CDN for static assets\n\n"

        report += "---\n\n"

        # Tools
        report += "## 🛠 Recommended Tools\n\n"
        report += "### Analysis Tools:\n"
        report += "- **Google PageSpeed Insights** - Overall performance score\n"
        report += "- **WebPageTest** - Detailed loading waterfall\n"
        report += "- **Lighthouse** (Chrome DevTools) - Comprehensive audit\n\n"

        report += "### Optimization Tools:\n"
        report += "- **csso** - CSS minification: `npm install -g csso-cli`\n"
        report += "- **terser** - JS minification: `npm install -g terser`\n"
        report += "- **Squoosh** - Image optimization (web-based)\n"
        report += "- **TinyPNG** - PNG/JPG compression\n\n"

        report += "---\n\n"

        report += "## 📝 Notes\n\n"
        report += "- ✅ Always backup before making changes\n"
        report += "- ✅ Test thoroughly after each optimization\n"
        report += "- ✅ Monitor Core Web Vitals post-deployment\n"
        report += "- ✅ Update index.html references after creating minified versions\n\n"

        report += "**Next Steps:** Start with Priority 1 quick wins for immediate impact!\n"

        return report

def main():
    # Set UTF-8 encoding for Windows console
    import sys
    if sys.platform == 'win32':
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

    print("=" * 60)
    print("PATA Website - Cleanup & Speed Optimization Analysis")
    print("=" * 60)
    print()

    # Initialize analyzer with current directory
    root_path = Path.cwd()
    analyzer = WebsiteAnalyzer(root_path)

    # Step 1: Scan directory
    analyzer.scan_directory()

    # Step 2: Build dependency tree
    analyzer.build_dependency_tree('index.html')

    # Step 3: Generate unused files report
    print()
    analyzer.generate_unused_files_report()

    # Step 4: Generate speed optimization report
    analyzer.analyze_performance()

    print()
    print("=" * 60)
    print("✅ ANALYSIS COMPLETE!")
    print("=" * 60)
    print()
    print("📄 Generated Reports:")
    print("  1. UNUSED_FILES_REPORT.md")
    print("  2. SPEED_OPTIMIZATION_REPORT.md")
    print()
    print("Next Steps:")
    print("  1. Review UNUSED_FILES_REPORT.md")
    print("  2. Confirm which files to delete")
    print("  3. Review SPEED_OPTIMIZATION_REPORT.md")
    print("  4. Implement Priority 1 optimizations")
    print()

if __name__ == "__main__":
    main()
