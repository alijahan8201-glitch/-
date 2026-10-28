const API_URL = '/api';
let currentProjects = []; 

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function openTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if(btnElement) btnElement.classList.add('active');
  
  if (tabId === 'tab-participants') loadParticipants();
  if (tabId === 'tab-leaderboard') {
    document.getElementById('btn-admin-lb-robot').classList.add('active');
    document.getElementById('btn-admin-lb-game').classList.remove('active');
    loadAdminLeaderboard('robot', document.getElementById('btn-admin-lb-robot'));
  }
  if (tabId === 'tab-qr-teams') loadTeamsForQR(); 
}

let savedPassword = sessionStorage.getItem('admin_password') || '';

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'در حال ذخیره...';

  const formData = new FormData();
  formData.append('password', document.getElementById('password').value);
  formData.append('title', document.getElementById('title').value.trim());
  formData.append('team_name', document.getElementById('team').value.trim());
  formData.append('description', document.getElementById('description').value.trim());
  formData.append('image_url_text', document.getElementById('image_url_text').value.trim());
  formData.append('video_url', document.getElementById('video_url').value.trim());
  formData.append('category', document.getElementById('category').value);
  formData.append('is_creator', document.getElementById('is_creator').value);
  
  const imageFile = document.getElementById('image_file').files[0];
  if (imageFile) formData.append('image', imageFile);

  try {
    const response = await fetch(`${API_URL}/admin/add`, { method: 'POST', body: formData });
    const data = await response.json();

    if (data.success) {
      showToast('پروژه اضافه شد ✅', 'success');
      savedPassword = document.getElementById('password').value;
      sessionStorage.setItem('admin_password', savedPassword);
      document.getElementById('add-form').reset();
      document.getElementById('password').value = savedPassword;
      loadProjectsList();
    } else { showToast(data.message, 'error'); }
  } catch (err) { showToast('خطا در ارتباط با سرور', 'error'); }
  btn.disabled = false;
  btn.textContent = '➕ افزودن پروژه';
});

async function loadProjectsList() {
  const container = document.getElementById('admin-list');
  try {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json();
    currentProjects = data;

    if (data.length === 0) { container.innerHTML = '<div>هیچ پروژه‌ای نیست</div>'; return; }

    container.innerHTML = data.map(p => `
      <div class="admin-project-item">
        <div>
          <strong>${p.title}</strong> <span style="color:#8b5cf6; margin-right:10px;">(میانگین: ${p.avg_score})</span>
          ${p.is_creator == 1 ? '<span style="color:#fbbf24; margin-right:10px; font-weight:bold;">👑 سازنده</span>' : ''}
        </div>
        <div style="display:flex; gap:8px;">
          <button onclick="openEditModal(${p.id})" style="background:#f59e0b; color:white; border:none; padding:8px 14px; border-radius:8px; cursor:pointer;">ویرایش ✏️</button>
          <button class="delete-btn" onclick="deleteProject(${p.id})">حذف</button>
        </div>
      </div>
    `).join('');
  } catch (e) { container.innerHTML = '<div style="color:#ef4444;">خطا در بارگذاری</div>'; }
}

// ==================== تب QR شرکت‌کننده‌ها ====================
async function loadTeamsForQR() {
  const container = document.getElementById('teams-list');
  container.innerHTML = '<div>در حال بارگذاری...</div>';
  
  try {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json();
    
    const teamNames = data.map(p => p.team_name ? p.team_name.trim() : '').filter(t => t !== '');
    const uniqueTeams = [...new Set(teamNames)];
    
    if (uniqueTeams.length === 0) {
      container.innerHTML = '<div>هیچ شرکت‌کننده‌ای یافت نشد.</div>';
      return;
    }

    container.innerHTML = uniqueTeams.map(team => `
      <button onclick="showTeamQR('${team}')" style="padding: 15px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); color: white; border-radius: 12px; cursor: pointer; font-family: inherit; font-size: 1rem; transition: 0.3s; text-align: center;">
        <span style="display: block; font-size: 1.5rem; margin-bottom: 5px;">👤</span>
        ${team}
      </button>
    `).join('');
  } catch (e) {
    container.innerHTML = '<div style="color:#ef4444;">خطا در بارگذاری لیست</div>';
  }
}

function showTeamQR(teamName) {
  const siteUrl = window.location.origin + `/?team=${encodeURIComponent(teamName)}`;
  document.getElementById('qr-title').textContent = teamName;
  document.getElementById('qr-modal').style.display = 'flex';
  const qrContainer = document.getElementById('qrcode'); 
  qrContainer.innerHTML = '';
  
  new QRCode(qrContainer, { 
    text: siteUrl, width: 250, height: 250, 
    colorDark : "#0f172a", colorLight : "#ffffff", correctLevel : QRCode.CorrectLevel.H 
  });
}

// ==================== تابع ساخت فایل Word واقعی (docx) ====================
async function downloadWord() {
  const teamName = document.getElementById('qr-title').textContent;
  const qrImg = document.querySelector('#qrcode img');
  
  if (!qrImg) {
    showToast('خطا در دریافت تصویر QR', 'error');
    return;
  }

  // تبدیل عکس Base64 به بافر باینری
  const base64Data = qrImg.src.split(',')[1];
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }

  try {
    const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } = docx;

    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // اسم تیم (درشت، وسط چین و راست چین)
                new Paragraph({
                    children: [
                        new TextRun({
                            text: teamName,
                            bold: true,
                            size: 72, // سایز فونت (36pt)
                            font: "Tahoma",
                            color: "000000",
                            rightToLeft: true, // 👈 این خط جادوییه که مشکل به هم ریختگی اسم رو حل میکنه
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }, 
                }),
                // عکس QR Code (وسط چین)
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: bytes,
                            transformation: {
                                width: 400, 
                                height: 400, 
                            },
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${teamName}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('فایل Word دانلود شد ✅', 'success');
  } catch (error) {
    console.error(error);
    showToast('خطا در ساخت فایل Word', 'error');
  }
}
// ==================================================================

// ==================== جدول رده‌بندی ادمین ====================
async function loadAdminLeaderboard(category, btnElement) {
  document.querySelectorAll('#tab-leaderboard .filter-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  const tbody = document.getElementById('leaderboard-body');
  tbody.innerHTML = '<tr><td colspan="5">در حال بارگذاری...</td></tr>';
  
  try {
    const response = await fetch(`${API_URL}/projects`);
    const data = await response.json(); 
    let filtered = data.filter(p => p.category === category);
    
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">هیچ پروژه‌ای در این بخش وجود ندارد.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((p, index) => {
      let medal = index + 1;
      if (index === 0) medal = '🥇 ۱'; else if (index === 1) medal = '🥈 ۲'; else if (index === 2) medal = '🥉 ۳';
      return `<tr style="${index < 3 ? 'background: rgba(245, 158, 11, 0.15);' : ''}">
        <td style="font-size: 1.3rem; font-weight: bold;">${medal}</td>
        <td style="color:#fff; font-weight: bold; font-size:1.1rem;">${p.title}</td>
        <td style="color:#a78bfa;">${p.team_name || '-'}</td>
        <td style="color:#fbbf24; font-weight: bold; font-size: 1.2rem;">${p.avg_score}</td>
        <td>${p.vote_count} نفر</td>
      </tr>`;
    }).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="5" style="color:red;">خطا</td></tr>'; }
}

function openEditModal(projectId) {
  const project = currentProjects.find(p => p.id === projectId);
  if (!project) return;
  document.getElementById('edit-id').value = project.id;
  document.getElementById('edit-title').value = project.title;
  document.getElementById('edit-team').value = project.team_name || '';
  document.getElementById('edit-description').value = project.description;
  document.getElementById('edit-video').value = project.video_url || '';
  document.getElementById('edit-image-text').value = project.image_url || '';
  document.getElementById('edit-image-file').value = ''; 
  document.getElementById('edit-category').value = project.category || 'robot';
  document.getElementById('edit-is_creator').value = project.is_creator || '0';
  if (savedPassword) document.getElementById('edit-password').value = savedPassword;
  document.getElementById('edit-modal').style.display = 'flex';
}

document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('edit-submit-btn');
  btn.disabled = true;
  btn.textContent = 'در حال ذخیره...';

  const id = document.getElementById('edit-id').value;
  const formData = new FormData();
  formData.append('password', document.getElementById('edit-password').value);
  formData.append('title', document.getElementById('edit-title').value.trim());
  formData.append('team_name', document.getElementById('edit-team').value.trim());
  formData.append('description', document.getElementById('edit-description').value.trim());
  formData.append('image_url_text', document.getElementById('edit-image-text').value.trim());
  formData.append('video_url', document.getElementById('edit-video').value.trim());
  formData.append('category', document.getElementById('edit-category').value);
  formData.append('is_creator', document.getElementById('edit-is_creator').value);
  
  const imageFile = document.getElementById('edit-image-file').files[0];
  if (imageFile) formData.append('image', imageFile);

  try {
    const response = await fetch(`${API_URL}/admin/edit/${id}`, { method: 'PUT', body: formData });
    const data = await response.json();
    if (data.success) {
      showToast('پروژه ویرایش شد ✅', 'success');
      savedPassword = document.getElementById('edit-password').value;
      sessionStorage.setItem('admin_password', savedPassword);
      document.getElementById('edit-modal').style.display = 'none';
      document.getElementById('edit-form').reset();
      loadProjectsList();
    } else { showToast(data.message, 'error'); }
  } catch (err) { showToast('خطا در سرور', 'error'); }
  btn.disabled = false;
  btn.textContent = '💾 ذخیره تغییرات';
});

async function deleteProject(projectId) {
  const password = savedPassword || prompt('رمز ادمین:');
  if (!password) return;
  if (!confirm(`پروژه حذف شود؟`)) return;
  try {
    const response = await fetch(`${API_URL}/admin/delete/${projectId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: password }) });
    const data = await response.json();
    if (data.success) { showToast('حذف شد', 'success'); loadProjectsList(); } else { showToast(data.message, 'error'); }
  } catch (err) { showToast('خطا', 'error'); }
}

async function loadParticipants() {
  const tbody = document.getElementById('participants-body');
  tbody.innerHTML = '<tr><td colspan="5">در حال بارگذاری...</td></tr>';
  try {
    const response = await fetch(`${API_URL}/admin/participants`);
    const data = await response.json();
    if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="5">کسی شرکت نکرده</td></tr>'; return; }
    tbody.innerHTML = data.map(v => `<tr><td style="color:#fff;">${v.first_name}</td><td style="color:#fff;">${v.last_name}</td><td style="direction: ltr; color:#a78bfa; font-weight:bold;">${v.phone_number}</td><td>${v.score}</td><td style="font-size: 0.9rem;">${v.project_title}</td></tr>`).join('');
  } catch (e) { tbody.innerHTML = '<tr><td colspan="5" style="color:red;">خطا</td></tr>'; }
}

async function startDraw() {
  const btn = document.getElementById('draw-btn'); const nameDisplay = document.getElementById('winner-display'); const phoneDisplay = document.getElementById('winner-phone');
  btn.disabled = true; btn.textContent = 'در حال انتخاب...'; phoneDisplay.textContent = '';
  let counter = 0;
  const interval = setInterval(() => {
    nameDisplay.textContent = 'در حال انتخاب...'; counter++;
    if (counter > 20) { clearInterval(interval); fetchWinner(); }
  }, 100);
}

async function fetchWinner() {
  const btn = document.getElementById('draw-btn'); const nameDisplay = document.getElementById('winner-display'); const phoneDisplay = document.getElementById('winner-phone');
  try {
    const response = await fetch(`${API_URL}/admin/draw`); const data = await response.json();
    if (data.success) { nameDisplay.textContent = data.name; phoneDisplay.textContent = `شماره: ${data.phone}`; showToast('برنده شد! 🎉', 'success'); } else { nameDisplay.textContent = 'یافت نشد'; showToast(data.message, 'error'); }
  } catch (e) { nameDisplay.textContent = 'خطا'; showToast('خطا', 'error'); }
  btn.disabled = false; btn.textContent = '🎲 قرعه‌کشی مجدد';
}

if (savedPassword) document.getElementById('password').value = savedPassword;
loadProjectsList();
