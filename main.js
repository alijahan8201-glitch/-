// ==================== قفل کردن کل سایت ====================
document.addEventListener("DOMContentLoaded", function() {
    // این کد کل صفحه رو پاک می‌کنه و فقط پیام پایان مسابقه رو نشون میده
    document.body.innerHTML = `
      <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; background:#0f172a; color:white; text-align:center; font-family:Vazirmatn, sans-serif; padding: 20px;">
        <div style="font-size: 5rem; margin-bottom: 20px;">🏆</div>
        <h1 style="font-size: 2.5rem; margin-bottom: 15px; color: #a78bfa;">زمان رأی‌گیری به پایان رسیده است</h1>
        <p style="font-size: 1.2rem; color: #94a3b8;">از تمامی شرکت‌کنندگان و بازدیدکنندگان محترم سپاسگزاریم.</p>
        <p style="font-size: 1rem; color: #cbd5e1; margin-top: 30px;">نتایج به زودی از طریق مدیریت آموزشگاه اعلام می‌شود.</p>
      </div>
    `;
    // جلوگیری از هرگونه اکشن دیگه‌ای در پس‌زمینه
    document.body.style.overflow = 'hidden';
});
