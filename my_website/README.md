# Alex Chen Portfolio

A minimalist portfolio site with journal, built with [Eleventy](https://www.11ty.dev/).

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```
   The site will be available at `http://localhost:8080`

3. **Build for production:**
   ```bash
   npm run build
   ```
   Output will be in the `_site` directory.

## Project Structure

```
├── src/
│   ├── _data/          # Global data (site.json)
│   ├── _includes/      # Layout templates (base.njk, nav.njk, footer.njk)
│   ├── journal/        # Markdown blog posts
│   ├── index.njk       # Homepage
│   └── journal.njk     # Journal listing page
├── css/
│   └── styles.css      # All styles
├── js/
│   └── script.js       # Navigation toggle + scroll effects
├── img/
│   └── hero.jpg        # Add your hero image here
├── archive/            # Previous static version
├── .eleventy.js        # Eleventy configuration
└── package.json
```

## Adding Journal Posts

Create a new Markdown file in `src/journal/` with the following format:

```markdown
---
title: Your Post Title
date: 2026-01-15
excerpt: A brief description that appears in listings.
---

# Your Post Title

Your content here...
```

The filename should follow the pattern: `YYYY-MM-DD-slug.md`

## Customization

### Site Metadata
Edit `src/_data/site.json` to update:
- Site title and author name
- Email address
- Social media links

### Hero Image
Replace `img/hero.jpg` with your own image. Recommended size: 1920x1080 or larger.

### Colors
The accent color (#e63946) can be changed in `css/styles.css`. Search for `#e63946` and replace with your preferred color.

## Deployment

The `_site` folder contains static HTML and can be deployed to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- Any web server

## Archive

The previous static version (plain HTML/CSS) is preserved in the `archive/` directory.
