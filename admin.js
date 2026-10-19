const API_URL = 'http://localhost:3000/api';

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');

    if (tabId === 'tab-participants') loadParticipants();
}

let savedPassword = sessionStorage.getItem('admin_password') || '';

document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'در حال آپلود و ذخیره...';

    const formData = new FormData();
    formData.append('password', document.getElementById('password').value);
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('team_name', document.getElementById('team').value.trim());
    formData.append('description', document.getElementById('description').value.trim());

    const imageFile = document.getElementById('image').files[0];
    const videoFile = document.getElementById('video').files[0];

    if (imageFile) formData.append('image', imageFile);
    if (videoFile) formData.append('video', videoFile);

    try {
        const response = await fetch(`${API_URL}/admin/add`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.success) {
            showToast('پروژه با موفقیت اضافه شد ✅', 'success');
            savedPassword = document.getElementById('password').value;
            sessionStorage.setItem('admin_password', savedPassword);
            document.getElementById('add-form').reset();
            document.getElementById('password').value = savedPassword;
            loadProjectsList();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('خطا در ارتباط با سرور', 'error');
    }

    btn.disabled = false;
    btn.textContent = '➕ افزودن پروژه';
});

async function loadProjectsList() {
    const container = document.getElementById('admin-list');
    try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json();

        if (data.length === 0) {
            container.innerHTML = '<div>هیچ پروژه‌ای وجود ندارد</div>';
            return;
        }

        container.innerHTML = data.map(p => `
      <div class="admin-project-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-radius:12px; margin-bottom:10px; background:rgba(255,255,255,0.05);">
        <div>
          <strong>${p.title}</strong>
          <span style="color:#8b5cf6; margin-right:10px;">(میانگین: ${p.avg_score})</span>
        </div>
        <button class="delete-btn" onclick="deleteProject(${p.id})">حذف</button>
      </div>
    `).join('');
    } catch (e) {
        container.innerHTML = '<div style="color:#ef4444;">خطا در بارگذاری</div>';
    }
}

async function deleteProject(projectId) {
    const password = savedPassword || prompt('رمز ادمین را وارد کنید:');
    if (!password) return;
    if (!confirm(`پروژه حذف شود؟`)) return;

    try {
        const response = await fetch(`${API_URL}/admin/delete/${projectId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });
        const data = await response.json();

        if (data.success) {
            showToast('پروژه حذف شد', 'success');
            loadProjectsList();
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('خطا در سرور', 'error');
    }
}

async function loadParticipants() {
    const tbody = document.getElementById('participants-body');
    tbody.innerHTML = '<tr><td colspan="5">در حال بارگذاری...</td></tr>';
    try {
        const response = await fetch(`${API_URL}/admin/participants`);
        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">هنوز کسی شرکت نکرده است.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(v => `
      <tr>
        <td style="color:#fff;">${v.first_name}</td>
        <td style="color:#fff;">${v.last_name}</td>
        <td style="direction: ltr; color:#a78bfa; font-weight:bold;">${v.phone_number}</td>
        <td>${v.score}</td>
        <td style="font-size: 0.9rem;">${v.project_title}</td>
      </tr>
    `).join('');
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="color:red;">خطا در بارگذاری</td></tr>';
    }
}

// قرعه‌کشی جدید
async function startDraw() {
    const btn = document.getElementById('draw-btn');
    const nameDisplay = document.getElementById('winner-display');
    const phoneDisplay = document.getElementById('winner-phone');

    btn.disabled = true;
    btn.textContent = 'در حال انتخاب...';
    phoneDisplay.textContent = '';

    // افکت انیمیشن
    let counter = 0;
    const interval = setInterval(() => {
        nameDisplay.textContent = 'در حال انتخاب...';
        counter++;
        if (counter > 20) {
            clearInterval(interval);
            fetchWinner();
        }
    }, 100);
}

async function fetchWinner() {
    const btn = document.getElementById('draw-btn');
    const nameDisplay = document.getElementById('winner-display');
    const phoneDisplay = document.getElementById('winner-phone');

    try {
        const response = await fetch(`${API_URL}/admin/draw`);
        const data = await response.json();

        if (data.success) {
            nameDisplay.textContent = data.name;
            phoneDisplay.textContent = `شماره تماس: ${data.phone}`;
            showToast('برنده انتخاب شد! 🎉', 'success');
        } else {
            nameDisplay.textContent = 'شرکت‌کننده‌ای یافت نشد';
            showToast(data.message, 'error');
        }
    } catch (e) {
        nameDisplay.textContent = 'خطا';
        showToast('خطا در سرور', 'error');
    }
    btn.disabled = false;
    btn.textContent = '🎲 قرعه‌کشی مجدد';
}

if (savedPassword) document.getElementById('password').value = savedPassword;
loadProjectsList();