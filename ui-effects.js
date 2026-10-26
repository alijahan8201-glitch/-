document.addEventListener('DOMContentLoaded', () => {
    // فقط روی دسکتاپ (هاور) افکت سه بعدی اجرا بشه تا روی گوشی خراب نشه
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        
        document.body.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8; // حداکثر 8 درجه
            const rotateY = ((x - centerX) / centerX) * 8;
            
            // خاموش کردن انیمیشن موقع حرکت برای اینکه دقیقا دنبال موس باشه
            card.style.transition = 'none';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            
            // انتقال مختصات موس به CSS برای افکت نور
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });

        document.body.addEventListener('mouseout', (e) => {
            const card = e.target.closest('.project-card');
            if (!card) return;
            
            // روشن کردن انیمیشن برگشت (فنری و نرم) موقع خروج موس
            card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s ease, border-color 0.3s ease';
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
            
            // برگردوندن نور به حالت اول
            card.style.setProperty('--mouse-x', `-1000px`);
            card.style.setProperty('--mouse-y', `-1000px`);
        });
    }

    // افکت موج (Ripple) برای دکمه‌ها
    document.body.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn-primary, .filter-btn, .rate-btn, .creator-btn, .insta-btn, .close-thanks-btn');
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
});
