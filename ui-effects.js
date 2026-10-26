// افکت‌های ظاهری (هیچ ربطی به دیتابیس نداره و کاملا امنه)
document.addEventListener('DOMContentLoaded', () => {
    
    // ۱. افکت سه بعدی برای کارت‌ها (فقط روی کامپیوتر)
    document.body.addEventListener('mousemove', (e) => {
        const card = e.target.closest('.project-card');
        if (!card) return;
        
        // چک کردن اینکه کاربر با موس کار میکنه یا لمس
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // حداکثر 10 درجه
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'none';
            
            // افکت نور دنبال کننده موس
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.project-card');
        if (!card) return;
        
        card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        card.style.transition = 'all 0.5s ease';
    });

    // ۲. افکت موج (Ripple) برای دکمه‌ها در هنگام کلیک
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-primary, .filter-btn, .rate-btn');
        if (!btn) return;

        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - radius}px`;
        circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - radius}px`;
        circle.classList.add('ripple');

        const ripple = btn.getElementsByClassName('ripple')[0];
        if (ripple) { ripple.remove(); }

        btn.appendChild(circle);
    });

    // ۳. تغییر افکت کانفتی به حالت خفن (از دو طرف صفحه)
    const originalConfetti = window.confetti;
    window.confetti = function(options) {
        if (options && options.particleCount === 150) { 
            // اگر کانفتی مربوط به ثبت رای بود
            const duration = 2000;
            const end = Date.now() + duration;

            (function frame() {
                originalConfetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24']
                });
                originalConfetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#8b5cf6', '#3b82f6', '#10b981', '#fbbf24']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        } else {
            originalConfetti(options);
        }
    };
});
