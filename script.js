// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
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

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.style.boxShadow = 'none';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
    }
    
    lastScroll = currentScroll;
});

// Active navigation link highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = 'var(--accent)';
        } else {
            link.style.color = 'var(--text-secondary)';
        }
    });
});

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all major elements
document.querySelectorAll('.project-card, .skill-category, .about-content, .contact-links').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Typewriter effect for hero subtitle (non-destructive)
document.addEventListener('DOMContentLoaded', () => {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const fullText = subtitle.textContent.trim();
    // If there's no text or it's already empty, do nothing
    if (!fullText) return;

    // Clear current text and prepare cursor style (insert once)
    subtitle.textContent = '';
    if (!document.getElementById('typewriter-cursor-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'typewriter-cursor-style';
        styleEl.innerHTML = `
            .typewriter-cursor { display: inline-block; width: 0.6ch; animation: tw-blink 1s steps(2,end) infinite; }
            @keyframes tw-blink { 50% { opacity: 0 } }
        `;
        document.head.appendChild(styleEl);
    }

    let i = 0;
    const speed = 60; // milliseconds per character (tweak as needed)

    function type() {
        if (i <= fullText.length) {
            subtitle.innerHTML = fullText.slice(0, i) + '<span class="typewriter-cursor">|</span>';
            i++;
            setTimeout(type, speed);
        } else {
            // finished typing — remove the cursor after a short pause
            setTimeout(() => { subtitle.innerHTML = fullText; }, 600);
        }
    }

    // Start typing shortly after DOM is ready to allow hero layout to settle
    setTimeout(type, 300);
});
