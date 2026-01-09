/* ==========================================================================
   Perfect Bearing - Main Script
   ========================================================================== */

let bearingData = [];

// Fetch data
fetch("latest db 1.json")
  .then(res => res.json())
  .then(data => {
    bearingData = data;
    console.log("Loaded bearings:", bearingData.length);
  })
  .catch(err => {
    console.error("Error loading DB:", err);
    if (window.location.protocol === 'file:') {
      console.warn("Fetch API requires a local server.");
    }
  });

/* ==========================================================================
   Autocomplete Search
   ========================================================================== */
const searchInput = document.getElementById("model-search-input");
const searchList = document.getElementById("autocomplete-list");

function showSuggestions(query) {
  if (!searchList) return;
  searchList.innerHTML = "";

  if (!query || bearingData.length === 0) {
    searchList.style.display = "none";
    return;
  }

  const matches = bearingData
    .filter(b => {
      const m = b.Model || b.model;
      return m && String(m).toLowerCase().includes(query);
    })
    .slice(0, 10);

  if (matches.length === 0) {
    searchList.style.display = "none";
    return;
  }

  matches.forEach(b => {
    const li = document.createElement("li");
    const m = b.Model || b.model;
    li.textContent = m;
    li.addEventListener("click", () => {
      window.location.href = `bearing.html?model=${encodeURIComponent(m)}`;
    });
    searchList.appendChild(li);
  });

  searchList.style.display = "block";
}

if (searchInput) {
  searchInput.addEventListener("input", () => {
    showSuggestions(searchInput.value.trim().toLowerCase());
  });

  // Close when clicking outside
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrapper")) {
      if (searchList) searchList.style.display = "none";
    }
  });

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (val) window.location.href = `bearing.html?model=${encodeURIComponent(val)}`;
    }
  });
}

/* ==========================================================================
   Smooth Scroll (with Offset)
   ========================================================================== */
document.querySelectorAll('a[href^="#"], a[href^="home.html#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    const targetId = href.includes('#') ? href.split('#')[1] : null;

    // Determine if we are on the home page
    const path = window.location.pathname;
    const page = path.split("/").pop();
    const isHome = page === "" || page === "index.html" || page === "home.html";

    if (targetId && isHome) {
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

        // Close mobile menu
        const navMenu = document.getElementById("nav-menu");
        const hamburger = document.getElementById("hamburger");
        if (navMenu && navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
          if (hamburger) hamburger.querySelector("i").className = "fas fa-bars";
        }
      }
    }
  });
});

/* ==========================================================================
   Mobile Menu
   ========================================================================== */
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu"); // Make sure this ID exists in HTML

if (hamburger) {
  // Mobile menu logic usually requires a target sidebar or dropdown
  // My HTML had .nav-menu as the class for links, let's verify if I added an ID?
  // Looking at home.html, <nav class="nav-menu">... but no ID.
  // The minimal script I wrote earlier targeted classList.toggle on navMenu variable.
  // I need to make sure the selector is correct. 
  // In home.html: <nav class="nav-menu"> 
  // I should select by class or add ID. Let's select by class for safety.

  const menu = document.querySelector(".nav-menu");

  hamburger.addEventListener("click", () => {
    if (menu) {
      menu.classList.toggle("active");
      const icon = hamburger.querySelector("i");
      if (menu.classList.contains("active")) {
        icon.className = "fas fa-times";
      } else {
        icon.className = "fas fa-bars";
      }
    }
  });
}

/* ==========================================================================
   Scroll Animations
   ========================================================================== */
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.card, .feature-box, .section-title, .detail-layout').forEach(el => {
  el.classList.add('fade-up');
  observer.observe(el);
});

/* ==========================================================================
   Dark Mode
   ========================================================================== */
const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

if (localStorage.getItem("theme") === "dark") {
  htmlEl.setAttribute("data-theme", "dark");
  if (themeToggle) themeToggle.querySelector("i").className = "fas fa-sun";
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = htmlEl.getAttribute("data-theme") === "dark";
    if (isDark) {
      htmlEl.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      themeToggle.querySelector("i").className = "fas fa-moon";
    } else {
      htmlEl.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      themeToggle.querySelector("i").className = "fas fa-sun";
    }
  });
}

/* ==========================================================================
   Scroll To Top
   ========================================================================== */
const scrollBtn = document.getElementById("scrollToTop");
if (scrollBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      scrollBtn.style.opacity = "1";
      scrollBtn.style.visibility = "visible";
    } else {
      scrollBtn.style.opacity = "0";
      scrollBtn.style.visibility = "hidden";
    }
  });
  scrollBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==========================================================================
   Contact Form (EmailJS)
   ========================================================================== */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const btn = contactForm.querySelector("button[type='submit']");
    const originalText = btn.innerText;

    btn.innerText = "Sending...";
    btn.disabled = true;

    // IDs
    const serviceID = "service_tk8c84y";
    const templateID = "template_pvascme";

    emailjs.sendForm(serviceID, templateID, this)
      .then(() => {
        btn.innerText = "Sent Successfully!";
        btn.style.background = "#22c55e";
        contactForm.reset();
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = "";
          btn.disabled = false;
        }, 3000);
      }, (err) => {
        console.error("EmailJS Error:", err);
        // alert("Failed to send. Please check console."); // Optional
        btn.innerText = "Failed";
        btn.style.background = "#ef4444";
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.background = "";
          btn.disabled = false;
        }, 3000);
      });
  });
}
