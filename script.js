// Dot-and-ring cursor for mouse and trackpad users
const customCursor = document.querySelector('.custom-cursor');
const cursorRing = document.querySelector('.custom-cursor-ring');
const cursorDot = document.querySelector('.custom-cursor-dot');

if (customCursor && cursorRing && cursorDot && window.matchMedia('(pointer: fine)').matches) {
    document.body.classList.add('custom-cursor-enabled');

    document.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') return;

        const position = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
        cursorRing.style.transform = position;
        cursorDot.style.transform = position;
        customCursor.classList.add('visible');
    });

    document.addEventListener('pointerleave', () => {
        customCursor.classList.remove('visible');
    });

    document.addEventListener('pointerdown', () => {
        cursorRing.style.transform += ' scale(0.8)';
    });

    document.addEventListener('pointerup', () => {
        cursorRing.style.transform = cursorRing.style.transform.replace(' scale(0.8)', '');
    });
}

// Mobile navigation
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Navbar scroll shadow
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinkItems = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = '';

    sections.forEach(section => {
        if (scrollPos >= section.offsetTop) {
            current = section.id;
        }
    });

    navLinkItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Typewriter effect for hero subtitle
document.addEventListener('DOMContentLoaded', () => {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const fullText = subtitle.textContent.trim();
    if (!fullText) return;

    subtitle.textContent = '';
    let i = 0;
    const speed = 55;

    function type() {
        if (i <= fullText.length) {
            subtitle.innerHTML = fullText.slice(0, i) + '<span class="typewriter-cursor">|</span>';
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(() => { subtitle.textContent = fullText; }, 500);
        }
    }

    setTimeout(type, 600);
});
