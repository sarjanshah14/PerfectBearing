let bearingData = [];

fetch("latest db.json")
  .then(res => res.json())
  .then(data => {
    bearingData = data;
    console.log("Loaded bearings:", bearingData); // 🔍 check in browser console
  })
  .catch(err => console.error("Error loading latest db.json:", err));

const input = document.getElementById("model-search-input");
const list = document.getElementById("autocomplete-list");

function showSuggestions(query) {
  list.innerHTML = "";

  if (!query || bearingData.length === 0) {
    list.style.display = "none";
    return;
  }

  const matches = bearingData
    .filter(b => String(b.Model || b.model).toLowerCase().includes(query)) // support Model/model
    .slice(0, 10);

  if (matches.length === 0) {
    list.style.display = "none";
    return;
  }

  matches.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b.Model || b.model;
    li.addEventListener("click", () => {
      window.location.href = `bearing.html?model=${encodeURIComponent(li.textContent)}`;
    });
    list.appendChild(li);
  });

  list.style.display = "block";
}

input.addEventListener("input", () => {
  const query = input.value.trim().toLowerCase();
  showSuggestions(query);
});

document.addEventListener("click", e => {
  if (!e.target.closest(".autocomplete-wrapper")) {
    list.style.display = "none";
  }
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    const model = input.value.trim();
    if (model) {
      window.location.href = `bearing.html?model=${encodeURIComponent(model)}`;
    }
  }
});
 // Hamburger menu functionality
 const hamburger = document.getElementById("hamburger");
 const navMenu = document.getElementById("nav-menu");

 hamburger.addEventListener("click", () => {
     navMenu.classList.toggle("active");
     hamburger.classList.toggle("active");
 });

 // Close menu when clicking on a nav link
 document.querySelectorAll('.nav-link').forEach(link => {
     link.addEventListener('click', () => {
         navMenu.classList.remove("active");
         hamburger.classList.remove("active");
     });
 });

 // Smooth scrolling for anchor links
 document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener('click', function (e) {
         e.preventDefault();
         
         const targetId = this.getAttribute('href');
         if (targetId === '#') return;
         
         const targetElement = document.querySelector(targetId);
         if (targetElement) {
             window.scrollTo({
                 top: targetElement.offsetTop - 80,
                 behavior: 'smooth'
             });
         }
     });
 });

 