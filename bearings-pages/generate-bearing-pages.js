/**
 * Perfect Bearing - Static SEO Page Generator
 * ============================================
 * Run: node generate-bearing-pages.js
 * Output: ./bearings/ folder with one HTML per bearing model
 * 
 * Upload the entire /bearings/ folder to your website root.
 * URL will be: perfectbearing.co.in/bearings/5408a.html
 */

const fs = require("fs");
const path = require("path");

// ── Config ────────────────────────────────────────────────────────────────────
const DB_FILE = "latest db 1.json";       // your JSON database
const OUTPUT_DIR = "./bearings";           // folder to create pages in
const SITE_URL = "https://www.perfectbearing.co.in";
const WA_NUMBER = "918460640113";

// Type fallback images (same as your script.js)
const typeFallback = {
  "steel-balls": "sb.jpg",
  "housing-&-bearing": "h&b.jpg",
  "four-point-contact-ball-bearing": "DP1.jpg",
  "single-row-tapered-roller-bearing": "tp1.avif",
  "single-row-tapered-roller-bearing": "tp1.avif",
  "double-row-tapered-roller-bearing": "drt1.avif",
  "cylindrical-roller-bearing": "cr1.avif",
  "double-row-cylindrical-roller-bearing": "cr1.avif",
  "spherical-roller-bearing": "spr1.jpeg",
  "spherical-roller-thrust-bearing": "spr1.jpeg",
  "thrust-bearing": "thrust.webp",
  "deep-groove-ball-bearing": "db1.avif",
  "angular-contact-ball-bearing": "db1.avif",
  "self-aligning-ball-bearing": "db1.avif",
  "needle-roller-bearing": "cr1.avif",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(model) {
  return String(model).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-\.]/g, "");
}

function titleCase(str) {
  return str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getFallbackImg(type) {
  const key = (type || "").toLowerCase().trim();
  return typeFallback[key] || "default.jpg";
}

function getImageSrc(bearing) {
  const imageBase = bearing.image || slugify(bearing.Model);
  return `../photos/${imageBase}.avif`;
}

function getFallbackSrc(bearing) {
  const imageBase = bearing.image || slugify(bearing.Model);
  const catFallback = getFallbackImg(bearing.Type);
  // We'll try jpg first, then category fallback
  return `../photos/${imageBase}.jpg`;
}

function buildDescription(bearing) {
  const brand = (bearing.brand || "").trim();
  const model = bearing.Model;
  const type = titleCase(bearing.Type || "Industrial Bearing");
  const id = bearing["Inner Diamater (mm)"];
  const od = bearing["Outer Diamater (mm)"];
  const w = bearing["Width (mm)"];
  return `Buy ${model} ${brand} ${type} – ID: ${id}mm, OD: ${od}mm, Width: ${w}mm. New stock available. Inquire on WhatsApp from Perfect Bearing, Bhavnagar, Gujarat.`;
}

function buildSchema(bearing) {
  const brand = (bearing.brand || "").trim();
  const model = bearing.Model;
  const type = titleCase(bearing.Type || "Industrial Bearing");
  const slug = slugify(model);
  return JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${model} ${brand} ${type}`,
    "model": model,
    "brand": { "@type": "Brand", "name": brand },
    "description": bearing.description || buildDescription(bearing),
    "sku": model,
    "mpn": model,
    "image": `${SITE_URL}/photos/${bearing.image || slug}.avif`,
    "url": `${SITE_URL}/bearings/${slug}.html`,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "priceCurrency": "INR",
      "price": "0",
      "priceValidUntil": "2027-12-31",
      "url": `${SITE_URL}/bearings/${slug}.html`,
      "seller": {
        "@type": "Organization",
        "name": "Perfect Bearing",
        "url": SITE_URL
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        }
      }
    },
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Inner Diameter", "value": `${bearing["Inner Diamater (mm)"]}mm` },
      { "@type": "PropertyValue", "name": "Outer Diameter", "value": `${bearing["Outer Diamater (mm)"]}mm` },
      { "@type": "PropertyValue", "name": "Width", "value": `${bearing["Width (mm)"]}mm` },
      { "@type": "PropertyValue", "name": "Weight", "value": bearing.weight || "N/A" },
      { "@type": "PropertyValue", "name": "Condition", "value": bearing.Condition || "New" }
    ]
  });
}

function buildSpecRows(bearing) {
  const skip = ["Name", "image", "description"];
  return Object.entries(bearing)
    .filter(([k]) => !skip.includes(k))
    .map(([k, v]) => `
        <tr>
          <th>${k}</th>
          <td>${v !== null && v !== undefined ? v : "—"}</td>
        </tr>`).join("");
}

function buildRelated(allData, bearing, count = 6) {
  return allData
    .filter(b => b.Type === bearing.Type && b.Model !== bearing.Model)
    .slice(0, count)
    .map(b => {
      const slug = slugify(b.Model);
      const imgSrc = `../photos/${b.image || slug}.avif`;
      const fallback = getFallbackImg(b.Type);
      return `
        <a class="related-card" href="${slug}.html">
          <div class="related-img">
            <img src="${imgSrc}" 
                 onerror="this.onerror=null;this.src='../photos/${fallback}'"
                 alt="${b.Model}" loading="lazy">
          </div>
          <div class="related-name">${b.Model}</div>
          <div class="related-brand">${(b.brand || "").trim()}</div>
        </a>`;
    }).join("");
}

// ── HTML Template ─────────────────────────────────────────────────────────────
function buildPage(bearing, allData) {
  const model = bearing.Model;
  const slug = slugify(model);
  const brand = (bearing.brand || "").trim();
  const type = titleCase(bearing.Type || "Industrial Bearing");
  const pageTitle = `${model} ${brand} ${type} | Perfect Bearing`;
  const metaDesc = buildDescription(bearing);
  const canonicalUrl = `${SITE_URL}/bearings/${slug}.html`;
  const imageBase = bearing.image || slug;
  const fallbackImg = getFallbackImg(bearing.Type);
  const relatedHtml = buildRelated(allData, bearing);
  const descLines = (bearing.description || "").replace(/\r\n/g, "\n").split("\n").filter(Boolean);
  const waMsg = encodeURIComponent(`Hi, I need ${model} bearing. Please share price and availability.`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BPXS15KG0K"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-BPXS15KG0K');
  </script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDesc}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph -->
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${metaDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="product">
  <meta property="og:image" content="${SITE_URL}/photos/${imageBase}.avif">
  <meta property="og:site_name" content="Perfect Bearing">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${metaDesc}">

  <!-- Schema.org Product Markup -->
  <script type="application/ld+json">${buildSchema(bearing)}</script>

  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Bearings", "item": `${SITE_URL}/index.html#bearings` },
      { "@type": "ListItem", "position": 3, "name": type, "item": `${SITE_URL}/type.html?Type=${bearing.Type}` },
      { "@type": "ListItem", "position": 4, "name": model, "item": canonicalUrl }
    ]
  })}</script>

  <!-- Favicon -->
  <link rel="icon" href="../photos/favicon.ico" type="image/x-icon">
  <link rel="shortcut icon" href="../photos/favicon.ico" type="image/x-icon">
  <link rel="icon" href="../photos/logo.jpg" type="image/jpeg">
  <link rel="apple-touch-icon" href="../photos/logo.jpg">
  <link rel="stylesheet" href="../styles.css">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    /* ── Page-specific styles ── */
    .breadcrumb {
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .breadcrumb a { color: var(--accent-color); }
    .breadcrumb span { opacity: 0.5; }

    .detail-layout {
      display: grid;
      grid-template-columns: 1fr 1.4fr;
      gap: 48px;
      align-items: start;
    }
    @media(max-width: 768px) {
      .detail-layout { grid-template-columns: 1fr; gap: 24px; }
    }

    .detail-img-wrap {
      position: sticky;
      top: calc(var(--header-height) + var(--strip-height) + 20px);
      background: var(--bg-surface);
      border-radius: var(--radius);
      border: 1px solid var(--border-color);
      overflow: hidden;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .detail-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .detail-brand-badge {
      display: inline-block;
      background: var(--accent-color);
      color: #fff;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 4px;
      margin-bottom: 12px;
    }
    .detail-title {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 6px;
      color: var(--text-primary);
    }
    .detail-type {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 24px;
    }

    .quick-specs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    .qs-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 14px 12px;
      text-align: center;
    }
    .qs-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .qs-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--accent-color);
    }

    .spec-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 0.875rem; }
    .spec-table tr { border-bottom: 1px solid var(--border-color); }
    .spec-table tr:last-child { border-bottom: none; }
    .spec-table th {
      text-align: left;
      padding: 10px 12px;
      font-weight: 500;
      color: var(--text-muted);
      width: 42%;
      background: var(--bg-surface);
    }
    .spec-table td { padding: 10px 12px; color: var(--text-primary); }

    .desc-section { margin-bottom: 28px; }
    .desc-section h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 12px; }
    .desc-section ul { list-style: none; padding: 0; }
    .desc-section ul li {
      padding: 6px 0;
      padding-left: 18px;
      position: relative;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .desc-section ul li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: var(--accent-color);
      font-size: 0.8rem;
    }

    .btn-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: #25D366;
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      padding: 14px 24px;
      border-radius: var(--radius);
      text-decoration: none;
      transition: var(--transition);
      margin-bottom: 12px;
    }
    .btn-whatsapp:hover { background: #1ebe5d; transform: translateY(-1px); }
    .btn-call {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      font-weight: 500;
      font-size: 0.9rem;
      padding: 12px 24px;
      border-radius: var(--radius);
      text-decoration: none;
      transition: var(--transition);
    }
    .btn-call:hover { border-color: var(--accent-color); color: var(--accent-color); }

    /* Related */
    .related-section { margin-top: 64px; border-top: 1px solid var(--border-color); padding-top: 40px; }
    .related-section h2 { font-size: 1.2rem; font-weight: 600; margin-bottom: 24px; }
    .related-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
    }
    .related-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 16px 12px 12px;
      text-align: center;
      display: block;
      transition: var(--transition);
      text-decoration: none;
      color: var(--text-primary);
    }
    .related-card:hover { border-color: var(--accent-color); transform: translateY(-2px); }
    .related-img { height: 90px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    .related-img img { max-height: 100%; max-width: 100%; object-fit: contain; }
    .related-name { font-size: 0.85rem; font-weight: 600; margin-bottom: 2px; }
    .related-brand { font-size: 0.75rem; color: var(--text-muted); }
  </style>
</head>
<body>

  <!-- Brand Strip -->
  <div class="brand-strip">
    <div class="brand-track">
      <img src="../brand/0da87c97-11f2-4ae8-a583-8063a579bf4f.jfif" alt="Brand">
      <img src="../brand/14b271dc-e77a-4816-9a73-fa080289d56f.jfif" alt="Brand">
      <img src="../brand/248272e0-96ec-4fe2-ad79-bac7f6be0e3c.jfif" alt="Brand">
      <img src="../brand/3118dbc0-9f90-468a-9eba-777ec55b1c8a.jfif" alt="Brand">
      <img src="../brand/448f547f-3252-4bb1-824b-48411f23c400.jfif" alt="Brand">
      <img src="../brand/5b879822-abde-438a-b13d-e882582c45a7.jfif" alt="Brand">
      <img src="../brand/5bc43425-fc9a-421f-a6a5-c728ad8e5a57.jfif" alt="Brand">
      <img src="../brand/64292b88-5638-4194-9d54-b3d2407f1eba.jfif" alt="Brand">
      <img src="../brand/701fd9f3-acfa-49e8-921e-74073918bae6.jfif" alt="Brand">
      <img src="../brand/73aaf318-c29f-4fb5-9269-462f5b3c891b.jfif" alt="Brand">
      <img src="../brand/89d203db-f7dc-4281-9b2a-08822a569213.jfif" alt="Brand">
      <img src="../brand/ac20be57-0789-4818-96a0-b44205ea2550.jfif" alt="Brand">
      <img src="../brand/dd1a83a7-d242-4079-803b-fe6798af12cc.jfif" alt="Brand">
      <img src="../brand/e6e78d62-1760-44c7-94c4-d150e13d5e07.jfif" alt="Brand">
      <img src="../brand/0da87c97-11f2-4ae8-a583-8063a579bf4f.jfif" alt="Brand">
      <img src="../brand/14b271dc-e77a-4816-9a73-fa080289d56f.jfif" alt="Brand">
      <img src="../brand/248272e0-96ec-4fe2-ad79-bac7f6be0e3c.jfif" alt="Brand">
      <img src="../brand/3118dbc0-9f90-468a-9eba-777ec55b1c8a.jfif" alt="Brand">
      <img src="../brand/448f547f-3252-4bb1-824b-48411f23c400.jfif" alt="Brand">
      <img src="../brand/5b879822-abde-438a-b13d-e882582c45a7.jfif" alt="Brand">
      <img src="../brand/5bc43425-fc9a-421f-a6a5-c728ad8e5a57.jfif" alt="Brand">
      <img src="../brand/64292b88-5638-4194-9d54-b3d2407f1eba.jfif" alt="Brand">
      <img src="../brand/701fd9f3-acfa-49e8-921e-74073918bae6.jfif" alt="Brand">
      <img src="../brand/73aaf318-c29f-4fb5-9269-462f5b3c891b.jfif" alt="Brand">
      <img src="../brand/89d203db-f7dc-4281-9b2a-08822a569213.jfif" alt="Brand">
      <img src="../brand/ac20be57-0789-4818-96a0-b44205ea2550.jfif" alt="Brand">
      <img src="../brand/dd1a83a7-d242-4079-803b-fe6798af12cc.jfif" alt="Brand">
      <img src="../brand/e6e78d62-1760-44c7-94c4-d150e13d5e07.jfif" alt="Brand">
    </div>
  </div>

  <header class="header">
    <div class="container nav-container">
      <a href="../index.html" class="brand">
        <i class="fas fa-cog fa-spin" style="animation-duration: 10s;"></i> Perfect Bearing
      </a>
      <nav class="nav-menu">
        <a href="../index.html" class="nav-link">Home</a>
        <a href="../index.html#bearings" class="nav-link">Bearings</a>
        <a href="../index.html#about" class="nav-link">About Us</a>
        <a href="../index.html#contact" class="nav-link">Contact</a>
      </nav>
      <div class="nav-tools">
        <div class="search-wrapper">
          <input type="text" class="search-input" id="model-search-input" placeholder="Search model..." autocomplete="off">
          <ul class="autocomplete-list" id="autocomplete-list"></ul>
        </div>
        <div class="hamburger" id="hamburger"><i class="fas fa-bars"></i></div>
      </div>
    </div>
  </header>

  <div class="container section">

    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="breadcrumb">
      <a href="../index.html">Home</a>
      <span>›</span>
      <a href="../index.html#bearings">Bearings</a>
      <span>›</span>
      <a href="../type.html?Type=${bearing.Type}">${type}</a>
      <span>›</span>
      <span>${model}</span>
    </nav>

    <div class="detail-layout">

      <!-- Image -->
      <div>
        <div class="detail-img-wrap">
          <img id="main-img"
               src="../photos/${imageBase}.avif"
               onerror="this.setAttribute('data-r','0');this.onerror=null;tryNext(this)"
               alt="${model} ${brand} ${type}">
        </div>
      </div>

      <!-- Info -->
      <div class="detail-info">
        <span class="detail-brand-badge">${brand}</span>
        <h1 class="detail-title">${model}</h1>
        <p class="detail-type">${type}</p>

        <!-- Quick Specs -->
        <div class="quick-specs">
          <div class="qs-box">
            <div class="qs-label">Inner Dia</div>
            <div class="qs-value">${bearing["Inner Diamater (mm)"]}mm</div>
          </div>
          <div class="qs-box">
            <div class="qs-label">Outer Dia</div>
            <div class="qs-value">${bearing["Outer Diamater (mm)"]}mm</div>
          </div>
          <div class="qs-box">
            <div class="qs-label">Width</div>
            <div class="qs-value">${bearing["Width (mm)"]}mm</div>
          </div>
        </div>

        <!-- Description -->
        ${descLines.length ? `
        <div class="desc-section">
          <h3>Features & Details</h3>
          <ul>
            ${descLines.map(line => `<li>${line.trim()}</li>`).join("")}
          </ul>
        </div>` : ""}

        <!-- Full Spec Table -->
        <table class="spec-table" aria-label="Bearing Specifications">
          <tbody>
            ${buildSpecRows(bearing)}
          </tbody>
        </table>

        <!-- CTA Buttons -->
        <a href="https://wa.me/${WA_NUMBER}?text=${waMsg}" target="_blank" rel="noopener" class="btn-whatsapp">
          <i class="fab fa-whatsapp"></i> Inquire on WhatsApp
        </a>
        <a href="tel:+${WA_NUMBER}" class="btn-call">
          <i class="fas fa-phone"></i> +91 84606 40113
        </a>
      </div>

    </div>

    <!-- Related Bearings -->
    ${relatedHtml ? `
    <div class="related-section">
      <h2>More ${type}s</h2>
      <div class="related-grid">
        ${relatedHtml}
      </div>
    </div>` : ""}

  </div>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h3>Perfect Bearing</h3>
          <p>Trusted Partner and Leading Supplier of Industrial Bearings.</p>
        </div>
        <div class="footer-col">
          <h3>Quick Links</h3>
          <a href="../index.html#home">Home</a>
          <a href="../index.html#bearings">Products</a>
          <a href="../index.html#about">About Us</a>
          <a href="../index.html#contact">Contact</a>
        </div>
        <div class="footer-col">
          <h3>Get in Touch</h3>
          <p><i class="fas fa-map-marker-alt"></i> Opp. Bank Of Baroda, Lokhandbazar, Bhavnagar, Gujarat - 364006</p>
          <p><i class="fas fa-phone"></i> +91 8460640113</p>
          <p><i class="fas fa-envelope"></i> <a href="mailto:perfectbearingbvn@gmail.com">perfectbearingbvn@gmail.com</a></p>
          <p><i class="fab fa-instagram"></i> <a href="https://instagram.com/perfectbearing_" target="_blank">@perfectbearing_</a></p>
          <p><i class="fab fa-facebook"></i> <a href="https://www.facebook.com/share/1AEKKCo8ei/?mibextid=wwXIfr" target="_blank">Perfect Bearing</a></p>
        </div>
      </div>
      <div class="copyright">&copy; 2024 Perfect Bearing. All rights reserved.</div>
    </div>
  </footer>

  <a href="#" class="float-btn float-top" id="scrollToTop" title="Top"><i class="fas fa-arrow-up"></i></a>
  <a href="https://wa.me/${WA_NUMBER}" target="_blank" class="float-btn float-wa" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>

  <script>
    // Image fallback chain
    const FALLBACKS = ['jpg','webp','png','jpeg'];
    const CAT_FALLBACK = '${fallbackImg}';
    const IMG_BASE = '${imageBase}';
    function tryNext(img) {
      const r = parseInt(img.getAttribute('data-r') || '0');
      if (r < FALLBACKS.length) {
        img.setAttribute('data-r', r + 1);
        img.onerror = () => tryNext(img);
        img.src = '../photos/' + IMG_BASE + '.' + FALLBACKS[r];
      } else {
        img.onerror = null;
        img.src = '../photos/' + CAT_FALLBACK;
      }
    }

    // Search autocomplete - fetch from root db
    const searchInput = document.getElementById("model-search-input");
    const autocompleteList = document.getElementById("autocomplete-list");
    let bearingData = [];
    fetch("../latest db 1.json").then(r=>r.json()).then(d=>{ bearingData=d; }).catch(()=>{});
    if (searchInput) {
      searchInput.addEventListener("input", function() {
        const val = this.value.toLowerCase().trim();
        autocompleteList.innerHTML = "";
        if (!val) { autocompleteList.style.display="none"; return; }
        const filtered = bearingData.filter(item => String(item.Model).toLowerCase().includes(val)).slice(0,10);
        if (filtered.length > 0) {
          filtered.forEach(item => {
            const li = document.createElement("li");
            const slug = item.Model.toLowerCase().replace(/\\s+/g,"-").replace(/[^a-z0-9\\-\\.]/g,"");
            li.innerHTML = '<a href="' + slug + '.html"><span>' + item.Model + '</span></a>';
            autocompleteList.appendChild(li);
          });
          autocompleteList.style.display="block";
        } else { autocompleteList.style.display="none"; }
      });
      document.addEventListener("click", e => {
        if (e.target !== searchInput) { autocompleteList.innerHTML=""; autocompleteList.style.display="none"; }
      });
      searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          e.preventDefault();
          const val = searchInput.value.trim();
          const slug = val.toLowerCase().replace(/\\s+/g,"-").replace(/[^a-z0-9\\-\\.]/g,"");
          if (val) window.location.href = slug + '.html';
        }
      });
    }

    // Scroll to top
    const scrollBtn = document.getElementById("scrollToTop");
    if (scrollBtn) {
      scrollBtn.style.opacity="0"; scrollBtn.style.visibility="hidden";
      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) { scrollBtn.style.opacity="1"; scrollBtn.style.visibility="visible"; }
        else { scrollBtn.style.opacity="0"; scrollBtn.style.visibility="hidden"; }
      });
      scrollBtn.addEventListener("click", e => { e.preventDefault(); window.scrollTo({top:0,behavior:"smooth"}); });
    }

    // Mobile menu
    const hamburger = document.getElementById("hamburger");
    const menu = document.querySelector(".nav-menu");
    if (hamburger && menu) {
      hamburger.addEventListener("click", () => {
        menu.classList.toggle("active");
        hamburger.querySelector("i").className = menu.classList.contains("active") ? "fas fa-times" : "fas fa-bars";
      });
    }

    // Dark mode
    if (localStorage.getItem("theme") === "dark") document.documentElement.setAttribute("data-theme","dark");
  </script>

</body>
</html>`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log("📦 Perfect Bearing - Static Page Generator");
  console.log("==========================================");

  // Read DB
  if (!fs.existsSync(DB_FILE)) {
    console.error(`❌ Database file not found: ${DB_FILE}`);
    console.error(`   Make sure "${DB_FILE}" is in the same folder as this script.`);
    process.exit(1);
  }

  const allData = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  console.log(`✅ Loaded ${allData.length} bearings from database`);

  // Create output dir
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output folder: ${OUTPUT_DIR}`);
  }

  let success = 0;
  let skipped = 0;

  for (const bearing of allData) {
    if (!bearing.Model) { skipped++; continue; }
    const slug = slugify(String(bearing.Model));
    if (!slug) { skipped++; continue; }

    const html = buildPage(bearing, allData);
    const filePath = path.join(OUTPUT_DIR, `${slug}.html`);
    fs.writeFileSync(filePath, html, "utf8");
    success++;

    if (success % 100 === 0) {
      console.log(`   ... ${success} pages generated`);
    }
  }

  console.log(`\n✅ Done! ${success} pages generated → ./${OUTPUT_DIR}/`);
  if (skipped > 0) console.log(`⚠️  ${skipped} records skipped (missing Model field)`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Upload the entire /bearings/ folder to your website root`);
  console.log(`      → Your site root already has: index.html, styles.css, photos/, etc.`);
  console.log(`      → Place /bearings/ alongside them`);
  console.log(`   2. Test: https://perfectbearing.co.in/bearings/5408a.html`);
  console.log(`   3. Submit sitemap in Google Search Console`);
  console.log(`      → https://perfectbearing.co.in/sitemap.xml`);
})();
