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

    let texts;
    try {
        texts = JSON.parse(subtitle.dataset.texts || '[]');
    } catch {
        texts = [];
    }

    if (!Array.isArray(texts)) {
        texts = [];
    }

    texts = texts
        .filter((text) => typeof text === 'string')
        .map((text) => text.trim())
        .filter(Boolean);

    if (texts.length <= 1) {
        subtitle.textContent = texts[0] || subtitle.textContent.trim();
        return;
    }

    const displayedText = document.createTextNode('');
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = '|';
    subtitle.replaceChildren(displayedText, cursor);

    let textIndex = 0;
    let characterIndex = 0;
    let deleting = false;

    const typeSpeed = 55;
    const deleteSpeed = 35;
    const pauseAfterTyping = 1500;
    const pauseAfterDeleting = 350;

    function typeCycle() {
        const currentText = texts[textIndex];

        if (!deleting) {
            characterIndex++;
            displayedText.textContent = currentText.slice(0, characterIndex);

            if (characterIndex === currentText.length) {
                deleting = true;
                setTimeout(typeCycle, pauseAfterTyping);
            } else {
                setTimeout(typeCycle, typeSpeed);
            }
            return;
        }

        characterIndex--;
        displayedText.textContent = currentText.slice(0, characterIndex);

        if (characterIndex === 0) {
            deleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(typeCycle, pauseAfterDeleting);
        } else {
            setTimeout(typeCycle, deleteSpeed);
        }
    }

    setTimeout(typeCycle, 600);
});
