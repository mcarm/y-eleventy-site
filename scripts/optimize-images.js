const Image = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");

const heroImages = [
  "img/hero-1.png",
  "img/hero-2.png",
  "img/hero-3.png",
  "img/hero-4.png",
  "img/hero-5.png",
  "img/hero-6.png",
];

const galleryDir = "img/gallery";

async function optimizeHeroImages() {
  console.log("Optimizing hero images...");
  
  for (const src of heroImages) {
    if (!fs.existsSync(src)) {
      console.log(`Skipping ${src} - file not found`);
      continue;
    }
    
    console.log(`Processing ${src}...`);
    
    await Image(src, {
      widths: [800, 1200, 1920],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/img/optimized/",
      urlPath: "/img/optimized/",
      filenameFormat: function (id, src, width, format) {
        const name = path.basename(src, path.extname(src));
        return `${name}-${width}w.${format}`;
      },
      sharpJpegOptions: {
        quality: 80,
        progressive: true,
      },
      sharpWebpOptions: {
        quality: 80,
      },
    });
    
    console.log(`  ✓ ${src} optimized`);
  }
}

async function optimizeGalleryImages() {
  console.log("\nOptimizing gallery images...");
  
  if (!fs.existsSync(galleryDir)) {
    console.log("Gallery directory not found, skipping...");
    return;
  }
  
  const files = fs.readdirSync(galleryDir).filter(f => 
    /\.(png|jpg|jpeg|webp)$/i.test(f)
  );
  
  for (const file of files) {
    const src = path.join(galleryDir, file);
    console.log(`Processing ${src}...`);
    
    await Image(src, {
      widths: [400, 800, 1200],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/img/optimized/gallery/",
      urlPath: "/img/optimized/gallery/",
      filenameFormat: function (id, src, width, format) {
        const name = path.basename(src, path.extname(src));
        return `${name}-${width}w.${format}`;
      },
      sharpJpegOptions: {
        quality: 80,
        progressive: true,
      },
      sharpWebpOptions: {
        quality: 80,
      },
    });
    
    console.log(`  ✓ ${file} optimized`);
  }
}

async function main() {
  console.log("=== Image Optimization Script ===\n");
  
  const outputDir = "./_site/img/optimized";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  await optimizeHeroImages();
  await optimizeGalleryImages();
  
  console.log("\n✓ All images optimized!");
}

main().catch(console.error);
