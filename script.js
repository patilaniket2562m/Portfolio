// Init animations
AOS.init({ duration: 1000, once: true });

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Active nav link highlight
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(section => {
    if (pageYOffset >= section.offsetTop - 250) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// Contact form simple validation
document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  alert('✅ Thank you for your message! I will contact you soon.');
  e.target.reset();
});

// Typing effect in hero
const heroText = document.querySelector('.hero h1');
const originalText = heroText.textContent;
let index = 0;
function typeWriter() {
  if (index < originalText.length) {
    heroText.textContent = originalText.substring(0, index + 1);
    index++;
    setTimeout(typeWriter, 80);
  }
}
window.addEventListener('load', () => {
  heroText.textContent = '';
  setTimeout(typeWriter, 500);
});

// AOS Init
AOS.init({ duration: 1000, once: true });

function setActiveLink() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  let current = "";

  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 100) {
      current = sec.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
}

// Run on scroll
window.addEventListener("scroll", setActiveLink);

// Run also on page load (refresh)
window.addEventListener("load", setActiveLink);

