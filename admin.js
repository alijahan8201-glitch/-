const API_URL = '/api';
let currentProjects = []; 

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
  if (tabId === 'tab-leaderboard') loadLeaderboard();
}

let savedPassword = sessionStorage.getItem('admin_password') || '';

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'در حال ذخیره...';

  const dataToSend = {
    password: document.getElementById('password').value,
    title: document.getElementById('title').value.trim(),
    team_name: document.getElementById('team').value.trim(),
    description: document.getElementById('description').value.trim(),
    image_url: document.getElementById('image_url').value.trim(),
    video_url: document.getElementById('video_url').value.trim()
  };

  try {
    const response = await fetch(`${API_URL}/admin/add`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend) 
    });
    const data = await response.json();

    if (data.success) {
      showToast('پروژه با موفقیت اضافه شد ✅', 'success');
      savedPassword = dataToSend.password;
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
    currentProjects = data;

    if (data.length === 0) {
      container.innerHTML = '<div>هیچ پروژه‌ای وجود ندارد</div>';
      return;
    }

    container.innerHTML = data.map(p => `
      <div class="admin-project-item" style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-radius:12px; margin-bottom:10px; background:rgba(255,255,255,0.05); flex-wrap: wrap; gap: 10px;">
        <div>
          <strong>${p.title}</strong>
          <span style="color:#8b5cf6; margin-right:10px;">(میانگین: ${p.avg_score})</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button onclick="openEditModal(${p.id})" style="background:#f59e0b; color:white; border:none; padding:8px 14px; border-radius:8px; cursor:pointer;">ویرایش ✏️</button>
          <button onclick="showQRCode(${p.id})" style="background:#3b82f6; color:white; border:none; padding:8px 14px; border-radius:8px; cursor:pointer;">QR 📱</button>
          <button class="delete-btn" onclick="deleteProject(${p.id})">حذف</button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:#ef4444;">خطا در بارگذاری</div>';
  }
}

async function loadLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '<tr><td colspan="5">در حال بارگذاری...</td></tr>';
  
  try {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json(); 

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">هنوز پروژه‌ای وجود ندارد.</td></tr>';
      return;
    }

    tbody.innerHTML = data.map((p, index) => {
      let medal = index + 1;
      if (index === 0) medal = '🥇 ۱';
      else if (index === 1) medal = '🥈 ۲';
      else if (index === 2) medal = '🥉 ۳';

      return `
      <tr style="${index < 3 ? 'background: rgba(245, 158, 11, 0.1);' : ''}">
        <td style="font-size: 1.2rem; font-weight: bold;">${medal}</td>
        <td style="color:#fff; font-weight: bold;">${p.title}</td>
        <td style="color:#a78bfa;">${p.team_name || '-'}</td>
        <td style="color:#fbbf24; font-weight: bold; font-size: 1.1rem;">${p.avg_score}</td>
        <td>${p.vote_count} نفر</td>
      </tr>
    `}).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:red;">خطا در بارگذاری</td></tr>';
  }
}

function openEditModal(projectId) {
  const project = currentProjects.find(p => p.id === projectId);
  if (!project) return;

  document.getElementById('edit-id').value = project.id;
  document.getElementById('edit-title').value = project.title;
  document.getElementById('edit-team').value = project.team_name || '';
  document.getElementById('edit-description').value = project.description;
  document.getElementById('edit-image').value = project.image_url || '';
  document.getElementById('edit-video').value = project.video_url || '';
  
  if (savedPassword) document.getElementById('edit-password').value = savedPassword;
  
  document.getElementById('edit-modal').style.display = 'flex';
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('edit-submit-btn');
  btn.disabled = true;
  btn.textContent = 'در حال ذخیره...';

  const id = document.getElementById('edit-id').value;
  const dataToSend = {
    password: document.getElementById('edit-password').value,
    title: document.getElementById('edit-title').value.trim(),
    team_name: document.getElementById('edit-team').value.trim(),
    description: document.getElementById('edit-description').value.trim(),
    image_url: document.getElementById('edit-image').value.trim(),
    video_url: document.getElementById('edit-video').value.trim()
  };

  try {
    const response = await fetch(`${API_URL}/admin/edit/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    const data = await response.json();

    if (data.success) {
      showToast('پروژه با موفقیت ویرایش شد ✅', 'success');
      savedPassword = dataToSend.password;
      sessionStorage.setItem('admin_password', savedPassword);
      document.getElementById('edit-modal').style.display = 'none';
      document.getElementById('edit-form').reset();
      loadProjectsList();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('خطا در ارتباط با سرور', 'error');
  }

  btn.disabled = false;
  btn.textContent = '💾 ذخیره تغییرات';
});

function showQRCode(projectId) {
  const project = currentProjects.find(p => p.id === projectId);
  const teamName = project && project.team_name ? project.team_name : 'بدون نام';
  const siteUrl = window.location.origin + `/?p=${projectId}`;
  
  document.getElementById('qr-title').textContent = teamName;
  document.getElementById('qr-modal').style.display = 'flex';
  
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';
  
  new QRCode(qrContainer, {
    text: siteUrl, width: 250, height: 250,
    colorDark : "#0f172a", colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
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

async function startDraw() {
  const btn = document.getElementById('draw-btn');
  const nameDisplay = document.getElementById('winner-display');
  const phoneDisplay = document.getElementById('winner-phone');
  
  btn.disabled = true;
  btn.textContent = 'در حال انتخاب...';
  phoneDisplay.textContent = '';
  
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
