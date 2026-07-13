/* ==========================================================================
   Premium CSE Portfolio Interaction Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all subsystems
  initTheme();
  initCustomCursor();
  initMobileMenu();
  initHeaderScroll();
  initTypingEffect();
  initCanvasBackground();
  initScrollReveal();
  initProjectFilter();
  initContactForm();
});

/* ==========================================================================
   Theme Switching (Dark / Light)
   ========================================================================== */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Retrieve saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Dispatch custom event to let other systems (like Canvas) know the theme changed
    window.dispatchEvent(new CustomEvent('themechanged', { detail: newTheme }));
  });
}

/* ==========================================================================
   Custom Cursor Trailing
   ========================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorDot = document.getElementById('custom-cursor-dot');
  
  if (!cursor || !cursorDot) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth trail calculation
  function animateCursor() {
    // Custom cursor (outer ring) interpolation (lag effect)
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Inner dot interpolation (faster follow)
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    cursorDot.style.left = `${dotX}px`;
    cursorDot.style.top = `${dotY}px`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Scale up and glow on interactive elements
  const hoverables = document.querySelectorAll('a, button, .project-card, .filter-btn, .form-input, .social-btn');
  hoverables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    item.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
}

/* ==========================================================================
   Mobile Menu Navigation
   ========================================================================== */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!mobileToggle || !navMenu) return;

  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = mobileToggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.className = 'fa-solid fa-xmark';
    } else {
      icon.className = 'fa-solid fa-bars';
    }
  });

  // Close menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });
}

/* ==========================================================================
   Header Scroll State
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

/* ==========================================================================
   Typing Animation Subtitle
   ========================================================================== */
function initTypingEffect() {
  const subtitleEl = document.getElementById('hero-subtitle');
  if (!subtitleEl) return;

  const roles = [
    'MERN Stack Developer',
    'Software Developer',
    'CSE Undergraduate Student',
    'Founder of Ismam Studio'
  ];

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      subtitleEl.innerHTML = `&gt; ${currentRole.substring(0, charIndex)}<span class="text-gradient">|</span>`;
      charIndex--;
      typingSpeed = 50;
    } else {
      subtitleEl.innerHTML = `&gt; ${currentRole.substring(0, charIndex)}<span class="text-gradient">|</span>`;
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex > currentRole.length) {
      isDeleting = true;
      typingSpeed = 2000; // Pause at full text
    } else if (isDeleting && charIndex < 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   Canvas Nodes Particles Background
   ========================================================================== */
function initCanvasBackground() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Particle configuration
  let particles = [];
  let particleCount = window.innerWidth < 768 ? 40 : 100;
  const connectionDistance = 120;
  const mouse = { x: null, y: null, radius: 150 };

  // Set particle colors based on active theme
  let themeColor = {
    particle: 'rgba(59, 130, 246, 0.4)',  // Accent blue
    line: 'rgba(168, 85, 247, 0.08)'      // Accent purple
  };

  function updateThemeColors() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      themeColor.particle = 'rgba(59, 130, 246, 0.4)';
      themeColor.line = 'rgba(168, 85, 247, 0.08)';
    } else {
      themeColor.particle = 'rgba(37, 99, 235, 0.25)';
      themeColor.line = 'rgba(139, 92, 246, 0.06)';
    }
  }
  updateThemeColors();

  // Listen to theme change to reload colors
  window.addEventListener('themechanged', updateThemeColors);

  // Resize handler
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particleCount = window.innerWidth < 768 ? 40 : 100;
    createParticles();
  }

  // Particle Class
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2 + 1.5;
    }

    update() {
      // Movement
      this.x += this.vx;
      this.y += this.vy;

      // Bounce on edges
      if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
      if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

      // Mouse interactive push/pull
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          // Slowly push particles away
          this.x -= dx / dist * force * 1.5;
          this.y -= dy / dist * force * 1.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = themeColor.particle;
      ctx.fill();
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw connecting network lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        
        if (dist < connectionDistance) {
          // Opacity decreases as distance increases
          const alpha = (1 - dist / connectionDistance) * 0.7;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = themeColor.line.replace('0.08', (alpha * 0.1).toFixed(3));
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawConnections();
    animationFrameId = requestAnimationFrame(animate);
  }

  // Attach Mouse events
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resizeCanvas);

  // Initialize
  resizeCanvas();
  animate();
}

/* ==========================================================================
   Scroll Reveal & Skill Bars Animate on Scroll
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  const skillBarFills = document.querySelectorAll('.skill-bar-fill');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Reveal elements on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Animate once
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Animate skill progress bars
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const targetPercent = fill.getAttribute('data-percent');
        fill.style.width = targetPercent;
        skillObserver.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });

  skillBarFills.forEach(fill => skillObserver.observe(fill));

  // Update active navigation link on scroll
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

  sections.forEach(section => navObserver.observe(section));
}

/* ==========================================================================
   Project Filter Interaction
   ========================================================================== */
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active filter button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterVal === 'all' || cardCategory === filterVal) {
          // Show project card with entry animation
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          // Hide project card
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300); // Wait for transition out
        }
      });
    });
  });
}

/* ==========================================================================
   Contact Form Validation & Processing
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  if (!form || !statusEl) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    statusEl.className = 'form-status';
    statusEl.innerHTML = '';

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Basic Validation
    if (!name || !email || !message) {
      statusEl.classList.add('error');
      statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> All fields are required.';
      return;
    }

    if (!validateEmail(email)) {
      statusEl.classList.add('error');
      statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter a valid email address.';
      return;
    }

    // Visual loading indicator on button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Transmitting...';

    // Simulate network transmission delay
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;

      // Render success feedback
      statusEl.classList.add('success');
      statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Connection established! Message successfully transmitted.';
      
      // Reset fields
      form.reset();
    }, 1500);
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
