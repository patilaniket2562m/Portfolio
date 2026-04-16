/* ============================================
   PORTFOLIO SCRIPT — MODERN INTERACTIONS
   ============================================ */

// ── Theme Toggle ─────────────────────────────
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ── Custom Cursor ─────────────────────────────
const cursor   = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

if (cursor && follower) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
  });

  function animateFollower() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    follower.style.transform = `translate(${followerX - 18}px, ${followerY - 18}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  document.querySelectorAll('a, button, .tag, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform += ' scale(2)';
      follower.style.width = '60px';
      follower.style.height = '60px';
      follower.style.opacity = '0.25';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = '36px';
      follower.style.height = '36px';
      follower.style.opacity = '0.5';
    });
  });
}

// ── Navbar ────────────────────────────────────
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveNav();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ── Active Nav on Scroll ──────────────────────
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  let currentId  = '';

  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) currentId = section.id;
  });

  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === currentId);
  });
}

// ── AOS (Animate On Scroll) ───────────────────
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.aosDelay || 0);
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
}
initAOS();

// ── Hero Title Stagger ────────────────────────
window.addEventListener('load', () => {
  const lines = document.querySelectorAll('.hero-title .line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateY(30px)';
    line.style.transition = `opacity 0.7s ease ${i * 0.15}s, transform 0.7s ease ${i * 0.15}s`;
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
    }, 200 + i * 150);
  });
});

// ── Contact Form ──────────────────────────────
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit span');
    const originalText = btn.textContent;
    btn.textContent = 'Message Sent!';
    contactForm.querySelector('.btn-submit').style.background = '#22c55e';
    setTimeout(() => {
      btn.textContent = originalText;
      contactForm.querySelector('.btn-submit').style.background = '';
      contactForm.reset();
    }, 3000);
  });
}

// ── Smooth Parallax for Blobs ─────────────────
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const blob1   = document.querySelector('.blob-1');
  const blob2   = document.querySelector('.blob-2');
  if (blob1) blob1.style.transform = `translate(${scrollY * 0.04}px, ${scrollY * 0.06}px)`;
  if (blob2) blob2.style.transform = `translate(${-scrollY * 0.03}px, ${-scrollY * 0.04}px)`;
});

// ── Tag hover pulse ───────────────────────────
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('mouseenter', () => {
    tag.style.transition = 'all 0.2s ease';
  });
});
