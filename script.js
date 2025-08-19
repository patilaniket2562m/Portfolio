// JS same as your demo portfolio (copy-paste here)
// Initialize AOS animations
AOS.init({
  duration: 1000,
  once: true
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Active nav link highlight
window.addEventListener('scroll', function() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (pageYOffset >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

// Contact form validation
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Thank you for your message! I will get back to you soon.');
  this.reset();
});

// Typing effect in hero section
const heroText = document.querySelector('.hero h1');
const originalText = heroText.textContent;
let index = 0;
function typeWriter() {
  if (index < originalText.length) {
    heroText.textContent = originalText.substring(0, index + 1);
    index++;
    setTimeout(typeWriter, 100);
  }
}
window.addEventListener('load', function() {
  heroText.textContent = '';
  setTimeout(typeWriter, 500);
});
