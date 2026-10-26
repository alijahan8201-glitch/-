document.addEventListener('DOMContentLoaded', () => {
    
    // ۱. افکت اسکرول (کارت‌ها با پایین رفتن، نرم ظاهر میشن)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // فقط یک بار انیمیشن پخش بشه
            }
        });
    }, observerOptions);

    // هر وقت کارت جدیدی ساخته شد، به این لیست اضافه میشه
    const observeCards = () => {
        document.querySelectorAll('.project-card, .podium-card, .dev-card, .leaderboard-table-wrapper').forEach(el => {
            el.classList.add('fade-up-element');
            observer.observe(el);
        });
    };
    
    // اجرای اولیه
    setTimeout(observeCards, 500); // کمی صبر میکنیم تا main.js کارت‌ها رو بسازه

    // ۲. افکت لمس برای دکمه‌ها (Ripple)
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-primary, .filter-btn, .rate-btn, .project-card');
        if (!btn) return;

        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple-touch');

        const ripple = btn.getElementsByClassName('ripple-touch')[0];
        if (ripple) { ripple.remove(); }

        btn.appendChild(circle);
    });

    // ۳. کانفتی از دو طرف
    const originalConfetti = window.confetti;
    window.confetti = function(options) {
        if (options && options.particleCount === 150) { 
            const duration = 2500;
            const end = Date.now() + duration;

            (function frame() {
                originalConfetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24'] });
                originalConfetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24'] });
                if (Date.now() < end) requestAnimationFrame(frame);
            }());
        } else {
            originalConfetti(options);
        }
    };
});
