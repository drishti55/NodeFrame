document.addEventListener("DOMContentLoaded", () => {
    // Fade-in, slide-in, and glow effect on scroll
    const animatedElements = document.querySelectorAll(".fade-in, .slide-in, .glow");

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));

    // Parallax effect on scroll for specific sections
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.parallax').forEach((el) => {
            let speed = el.getAttribute('data-speed');
            el.style.transform = `translateY(${window.scrollY * speed}px)`;
        });
    });

    // Hover effect that follows mouse for a futuristic glow
    document.querySelectorAll('.hover-effect').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            button.style.setProperty('--x', e.clientX - rect.left + 'px');
            button.style.setProperty('--y', e.clientY - rect.top + 'px');
        });
    });
});

// Tooltip setup
document.querySelectorAll('.tooltip-trigger').forEach(element => {
    element.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - rect.height / 2}px`;
    });

    element.addEventListener('mouseleave', () => {
        document.querySelector('.tooltip').remove();
    });
});

// Highlight active section in navbar
document.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav a");

    let currentSection = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 60) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${currentSection}`) {
            link.classList.add("active");
        }
    });
});
