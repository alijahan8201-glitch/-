@import url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');

:root {
  --bg-dark: #06080f;
  --primary: #8b5cf6;
  --secondary: #3b82f6;
  --accent: #fbbf24;
  --glass-bg: rgba(20, 27, 45, 0.5);
  --glass-border: rgba(255, 255, 255, 0.08);
  --smooth: cubic-bezier(0.25, 0.8, 0.25, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Vazirmatn', sans-serif; -webkit-tap-highlight-color: transparent; }

/* پس‌زمینه زنده */
body { 
  background-color: var(--bg-dark);
  background-image: 
    radial-gradient(at 10% 20%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
    radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
  color: #f8fafc; 
  min-height: 100vh; 
  position: relative; 
  overflow-x: hidden; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  background-attachment: fixed;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }

@keyframes cardEntry {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* لوگوها */
.main-logo { width: 150px; margin: 0 auto 25px auto; display: block; border-radius: 24px; background: white; padding: 12px; box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3); transition: transform 0.4s var(--smooth); }
.main-logo:hover { transform: scale(1.05) rotate(2deg); }
.small-logo { width: 90px; margin: 0 auto 15px auto; display: block; border-radius: 20px; background: white; padding: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
.header-logo { width: 100px; margin: 0 auto 20px auto; display: block; border-radius: 20px; background: white; padding: 10px; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.4); }

/* کانتینر شیشه‌ای */
.glass-container { 
  width: 100%; max-width: 480px; 
  background: var(--glass-bg); 
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); 
  border: 1px solid var(--glass-border); 
  padding: 40px 30px; 
  border-radius: 32px; 
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1); 
  text-align: center; margin: 20px; 
  animation: cardEntry 0.8s var(--smooth) backwards;
}

.glass-container h1 { font-size: 1.8rem; margin-bottom: 15px; color: #fff; font-weight: 800; letter-spacing: -0.5px; }
.glass-container p { color: #94a3b8; margin-bottom: 25px; line-height: 1.8; font-size: 1rem; }
.welcome-list { text-align: right; list-style: none; margin-bottom: 30px; color: #cbd5e1; line-height: 2.2; font-size: 0.95rem; }
.welcome-list li { position: relative; padding-right: 25px; }
.welcome-list li::before { content: '✦'; position: absolute; right: 0; color: var(--primary); text-shadow: 0 0 10px var(--primary); }

/* فرم‌ها */
.form-group { margin-bottom: 18px; }
.form-input { width: 100%; padding: 16px 20px; background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); border-radius: 16px; color: white; font-size: 1rem; transition: all 0.3s var(--smooth); }
.form-input:focus { outline: none; border-color: var(--primary); background: rgba(0,0,0,0.5); box-shadow: 0 0 20px rgba(139, 92, 246, 0.2); }
.form-input::placeholder { color: #64748b; }

/* دکمه‌های لاکچری */
.btn-primary { 
  width: 100%; padding: 16px; 
  background: linear-gradient(135deg, var(--primary), var(--secondary)); 
  color: white; border: none; border-radius: 16px; 
  font-size: 1.1rem; font-weight: 800; cursor: pointer; 
  transition: all 0.3s var(--smooth); 
  box-shadow: 0 8px 25px -5px rgba(139, 92, 246, 0.5); 
  position: relative; overflow: hidden;
}
.btn-primary::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: 0.5s;
  transform: skewX(-20deg);
}
.btn-primary:hover::after { left: 200%; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px -5px rgba(139, 92, 246, 0.7); }
.btn-primary:active { transform: scale(0.97); }
.btn-primary:disabled { background: #334155; box-shadow: none; cursor: not-allowed; color: #94a3b8; }

/* افکت موج */
.ripple-touch {
  position: absolute; border-radius: 50%; transform: scale(0);
  animation: ripple-anim 0.6s linear; background-color: rgba(255, 255, 255, 0.3);
  pointer-events: none; z-index: 10;
}
@keyframes ripple-anim { to { transform: scale(4); opacity: 0; } }

/* صفحه اصلی */
.main-container { width: 100%; max-width: 1250px; padding: 40px 20px; display: none; }
.main-header { text-align: center; margin-bottom: 40px; }
.main-header h2 { font-size: 2.8rem; background: linear-gradient(135deg, #a78bfa, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; font-weight: 900; }
.main-header p { color: #94a3b8; font-size: 1.1rem; }

/* بنر سازنده */
.dev-banner { display: flex; align-items: center; background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 24px; padding: 25px; margin-bottom: 50px; gap: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); max-width: 850px; margin-left: auto; margin-right: auto; transition: all 0.4s var(--smooth); }
.dev-banner-img-wrapper { flex: 0 0 220px; }
.dev-banner-img { width: 100%; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
.dev-banner-info { flex: 1; text-align: right; }
.dev-banner-info h3 { color: #fff; font-size: 1.4rem; margin-bottom: 10px; }
.dev-banner-info p { color: #cbd5e1; font-size: 1rem; line-height: 1.7; margin-bottom: 12px; }
.creator-btn { background: linear-gradient(135deg, #f59e0b, #d97706) !important; border: none !important; color: white !important; padding: 10px 25px !important; font-size: 0.95rem !important; border-radius: 12px !important; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.3) !important; }

/* تب‌های فیلتر */
.filter-tabs { display: flex; justify-content: center; gap: 15px; margin-bottom: 50px; flex-wrap: wrap; }
.filter-btn { padding: 12px 28px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border); color: #cbd5e1; border-radius: 30px; cursor: pointer; font-size: 1.05rem; font-weight: bold; transition: all 0.3s var(--smooth); position: relative; overflow: hidden; }
.filter-btn:hover { background: rgba(255, 255, 255, 0.08); transform: translateY(-2px); }
.filter-btn.active { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border-color: transparent; box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4); }
.leaderboard-btn { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border-color: transparent; box-shadow: 0 5px 20px rgba(245, 158, 11, 0.3); }

/* کارت پروژه‌ها (با تنظیمات ویژه برای افکت 3D) */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 35px; }
.project-card { 
  background: var(--glass-bg); 
  backdrop-filter: blur(16px); 
  border: 1px solid var(--glass-border); 
  border-radius: 24px; 
  overflow: hidden; 
  cursor: pointer; 
  display: flex; flex-direction: column; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
  position: relative;
  transform-style: preserve-3d; /* بسیار مهم برای افکت 3D */
  transform: perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1); /* وضعیت اولیه */
  animation: cardEntry 0.6s var(--smooth) backwards;
}

/* افکت نور دنبال کننده موس */
.project-card::before {
  content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%);
  z-index: 1; pointer-events: none; opacity: 0; transition: opacity 0.3s;
}
.project-card:hover::before { opacity: 1; }

/* محتوای داخلی کارت با عمق */
.project-content { z-index: 2; position: relative; height: 100%; display: flex; flex-direction: column; transform: translateZ(30px); }

/* پروژه سازنده با حاشیه طلایی */
.creator-card { border: 2px solid #fbbf24; box-shadow: 0 10px 30px rgba(251, 191, 36, 0.15); }
.crown-icon { position: absolute; top: 15px; right: 15px; font-size: 2.2rem; z-index: 10; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.5)); }

.project-image { width: 100%; height: 230px; object-fit: contain; background-color: #ffffff; padding: 15px; }
.project-body { padding: 25px; flex: 1; display: flex; flex-direction: column; }
.project-title { font-size: 1.4rem; color: #fff; margin-bottom: 8px; font-weight: 800; }
.project-team { font-size: 0.95rem; color: #94a3b8; margin-bottom: 20px; display: flex; align-items: center; gap: 5px; }
.project-score { margin-top: auto; display: inline-flex; align-items: center; gap: 5px; background: rgba(245, 158, 11, 0.1); color: var(--accent); padding: 8px 16px; border-radius: 30px; font-weight: 800; font-size: 1rem; border: 1px solid rgba(245, 158, 11, 0.3); width: fit-content; }

/* سکوی قهرمانی */
.podium-wrapper { display: flex; justify-content: center; align-items: flex-end; gap: 20px; height: 400px; margin-top: 50px; }
.podium-card { background: var(--glass-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: 24px 24px 0 0; width: 250px; text-align: center; padding: 30px 20px; position: relative; transition: all 0.4s var(--smooth); box-shadow: 0 -10px 30px rgba(0,0,0,0.3); animation: cardEntry 0.6s var(--smooth) backwards; }
.podium-card.first { height: 350px; background: linear-gradient(to top, rgba(30, 41, 59, 0.9), rgba(245, 158, 11, 0.2)); border-color: #fbbf24; z-index: 2; }
.podium-card.second { height: 280px; background: linear-gradient(to top, rgba(30, 41, 59, 0.9), rgba(148, 163, 184, 0.2)); border-color: #94a3b8; }
.podium-card.third { height: 230px; background: linear-gradient(to top, rgba(30, 41, 59, 0.9), rgba(180, 83, 9, 0.2)); border-color: #b45309; }
.podium-medal { font-size: 4rem; position: absolute; top: -45px; left: 50%; transform: translateX(-50%); filter: drop-shadow(0 10px 10px rgba(0,0,0,0.5)); }
.podium-title { font-size: 1.3rem; font-weight: 800; color: #fff; margin-top: 25px; margin-bottom: 5px; }
.podium-team { font-size: 0.95rem; color: #cbd5e1; margin-bottom: 20px; }
.podium-score { font-size: 1.8rem; font-weight: 900; color: var(--accent); }

/* جدول رده‌بندی */
.leaderboard-table-wrapper { width: 100%; overflow-x: auto; background: var(--glass-bg); border-radius: 24px; border: 1px solid var(--glass-border); box-shadow: 0 15px 35px rgba(0,0,0,0.4); margin-bottom: 50px; backdrop-filter: blur(16px); }
.leaderboard-table-wrapper .participant-table { width: 100%; border-collapse: collapse; color: white; }
.leaderboard-table-wrapper .participant-table th, .leaderboard-table-wrapper .participant-table td { border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 20px 15px; text-align: center; font-size: 1.05rem; transition: background 0.2s; }
.leaderboard-table-wrapper .participant-table th { background: rgba(0, 0, 0, 0.2); color: #a78bfa; font-weight: bold; }
.leaderboard-table-wrapper .participant-table tbody tr:hover { background: rgba(139, 92, 246, 0.1); }

/* فوتر */
.developer-footer { margin-top: 80px; display: flex; justify-content: center; padding-bottom: 40px; }
.dev-card { display: flex; flex-direction: column; align-items: center; background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); padding: 35px; border-radius: 28px; max-width: 800px; width: 100%; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); transition: transform 0.4s var(--smooth); }
.dev-image-wrapper { width: 100%; display: flex; justify-content: center; margin-bottom: 30px; }
.dev-image { width: 100%; max-width: 600px; height: auto; border-radius: 20px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
.dev-info { text-align: center; }
.dev-info h3 { font-size: 1.5rem; color: #fff; margin-bottom: 12px; }
.dev-info p { font-size: 1.05rem; color: #cbd5e1; line-height: 1.8; max-width: 600px; margin: 0 auto; }

/* مودال‌ها */
.modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(5, 8, 16, 0.8); backdrop-filter: blur(8px); z-index: 2000; justify-content: center; align-items: center; padding: 20px; }
.modal-content { background: #12182b; border: 1px solid var(--glass-border); border-radius: 28px; width: 100%; max-width: 750px; max-height: 90vh; overflow-y: auto; padding: 40px; position: relative; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7); animation: cardEntry 0.4s var(--smooth); }
.close-modal { position: absolute; top: 20px; left: 20px; background: rgba(255,255,255,0.05); color: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; transition: all 0.3s var(--smooth); display: flex; align-items: center; justify-content: center; }
.close-modal:hover { background: #ef4444; transform: rotate(90deg); }
#modal-title { color: #fff; margin-bottom: 20px; font-size: 1.8rem; font-weight: 800; }
#modal-video-container { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 16px; margin-bottom: 25px; overflow: hidden; display: none; }
#modal-video-container iframe, #modal-video-container video { width: 100%; height: 100%; border: none; }
#modal-desc { font-size: 1.05rem; line-height: 1.9; color: #cbd5e1; margin-bottom: 30px; text-align: justify; }

/* بخش امتیازدهی */
.rating-section { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 25px; }
.rating-section h3 { color: #fff; margin-bottom: 20px; font-size: 1.2rem; }
.rating-buttons { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 25px; }
.rate-btn { width: 50px; height: 50px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); font-size: 1.2rem; font-weight: bold; color: #cbd5e1; cursor: pointer; transition: all 0.3s var(--smooth); position: relative; overflow: hidden; }
.rate-btn:hover { background: rgba(139, 92, 246, 0.2); border-color: var(--primary); transform: translateY(-3px); }
.rate-btn.selected { background: linear-gradient(135deg, var(--primary), var(--secondary)); border-color: transparent; color: white; transform: scale(1.1); box-shadow: 0 10px 20px rgba(139, 92, 246, 0.4); }
#already-rated-msg { text-align: center; color: #34d399; font-weight: bold; font-size: 1.1rem; background: rgba(16, 185, 129, 0.1); padding: 15px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.2); }

/* پیام شناور (Toast) */
.toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: #1e293b; color: white; padding: 16px 30px; border-radius: 16px; font-weight: bold; transition: transform 0.4s var(--smooth); z-index: 3000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid var(--glass-border); }
.toast.show { transform: translateX(-50%) translateY(0); }
.toast.success { background: rgba(16, 185, 129, 0.9); border-color: #34d399; }
.toast.error { background: rgba(239, 68, 68, 0.9); border-color: #f87171; }

/* پاپ‌آپ تشکر */
.thank-you-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(5, 8, 16, 0.9); backdrop-filter: blur(10px); z-index: 5000; justify-content: center; align-items: center; padding: 20px; }
.thank-you-content { background: #12182b; border: 1px solid var(--glass-border); border-radius: 28px; width: 100%; max-width: 450px; padding: 40px 30px; text-align: center; position: relative; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8); animation: cardEntry 0.5s var(--smooth); }
.star-icon { font-size: 4rem; margin-bottom: 15px; }
.thank-you-content h2 { color: #34d399; font-size: 1.6rem; margin-bottom: 10px; }
.thanks-text { color: #cbd5e1; font-size: 1.05rem; margin-bottom: 20px; line-height: 1.7; }
.lottery-badge { background: rgba(245, 158, 11, 0.1); color: var(--accent); border: 1px solid rgba(245, 158, 11, 0.3); padding: 12px; border-radius: 12px; font-weight: bold; margin-bottom: 25px; display: inline-block; }
.social-section { background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 16px; margin-bottom: 20px; }
.social-section p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 15px; line-height: 1.6; }
.insta-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: linear-gradient(45deg, #f09433, #dc2743, #bc1888); color: white; text-decoration: none; padding: 14px 20px; border-radius: 14px; font-weight: bold; transition: all 0.3s var(--smooth); width: 100%; position: relative; overflow: hidden; }
.insta-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(220, 39, 67, 0.4); }
.footer-note { color: #cbd5e1; font-size: 1rem; margin-bottom: 20px; }
.close-thanks-btn { background: rgba(255, 255, 255, 0.05); color: white; border: 1px solid var(--glass-border); padding: 14px 30px; border-radius: 14px; font-weight: bold; cursor: pointer; transition: all 0.3s; width: 100%; position: relative; overflow: hidden; }
.close-thanks-btn:hover { background: rgba(255, 255, 255, 0.1); }

/* ==================== تنظیمات اختصاصی گوشی (Mobile) ==================== */
@media (max-width: 768px) {
  .glass-container { padding: 30px 20px; margin: 10px; width: 95%; }
  .main-header h2 { font-size: 2rem; }
  .modal-content { padding: 25px; border-radius: 24px; }
  .rating-buttons { gap: 8px; }
  .rate-btn { width: 45px; height: 45px; font-size: 1.1rem; }
  
  .projects-grid { grid-template-columns: 1fr; gap: 25px; }
  .filter-tabs { gap: 10px; }
  .filter-btn { padding: 10px 20px; font-size: 0.95rem; }

  /* در موبایل افکت سه بعدی خاموش میشه تا روون باشه */
  .project-card { transform: none !important; }
  .project-card::before { display: none; }
  .project-content { transform: none; }
  
  /* افکت لمس (Tap) */
  .project-card:active { transform: scale(0.98) !important; }
  .btn-primary:active { transform: scale(0.96); }
  .filter-btn:active { transform: scale(0.95); }
  .rate-btn:active { transform: scale(0.9); }

  /* چیدمان سکوی قهرمانی در موبایل */
  .podium-wrapper { flex-direction: column; height: auto; align-items: center; gap: 40px; }
  .podium-card { width: 100%; max-width: 320px; height: auto !important; border-radius: 24px; }
  .podium-card.first { order: -1; } 
  .podium-medal { top: -40px; font-size: 3.5rem; }
  
  .dev-banner { flex-direction: column; text-align: center; }
  .dev-banner-img-wrapper { width: 100%; max-width: 280px; margin-bottom: 20px; }
  .dev-banner-info { text-align: center; }
}
