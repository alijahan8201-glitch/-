const API_URL = 'http://localhost:3000/api';

function getVoterId() {
    let voterId = localStorage.getItem('voter_id');
    if (!voterId) {
        voterId = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('voter_id', voterId);
    }
    return voterId;
}
const VOTER_ID = getVoterId();

// ذخیره اطلاعات کاربر
let userInfo = JSON.parse(localStorage.getItem('user_info') || 'null');

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// مرحله ۱ به ۲
document.getElementById('to-info-btn').addEventListener('click', () => {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('info-screen').style.display = 'block';
});

// مرحله ۲ به ۳ (ثبت نام و رفتن به پروژه‌ها)
document.getElementById('start-btn').addEventListener('click', () => {
    const fname = document.getElementById('reg-firstname').value.trim();
    const lname = document.getElementById('reg-lastname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();

    if (!fname || !lname || !phone) {
        showToast('لطفاً همه فیلدها را پر کنید', 'error');
        return;
    }

    // ذخیره اطلاعات در حافظه مرورگر
    userInfo = { first_name: fname, last_name: lname, phone_number: phone };
    localStorage.setItem('user_info', JSON.stringify(userInfo));

    document.getElementById('info-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    loadProjects();
});

// اگر کاربر قبلا ثبت نام کرده بود، مستقیم بره به پروژه‌ها
if (userInfo) {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    loadProjects();
}

function getVotedProjects() { return JSON.parse(localStorage.getItem('voted_projects') || '[]'); }
function markAsVoted(projectId) {
    const voted = getVotedProjects();
    if (!voted.includes(projectId)) {
        voted.push(projectId);
        localStorage.setItem('voted_projects', JSON.stringify(voted));
    }
}

function getVideoHtml(url) {
    if (!url) return '';
    if (url.includes('uploads/') || url.endsWith('.mp4')) {
        return `<video src="http://localhost:3000/${url}" controls></video>`;
    }
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) embedUrl = url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
    if (url.includes('aparat.com/v/')) {
        const id = url.split('/v/')[1].split('/')[0];
        embedUrl = `https://www.aparat.com/video/video/embed/videohash/${id}/vt/frame`;
    }
    return `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
}

let allProjects = [];
let currentSelectedScore = 0;
let currentProjectId = null;

function renderProjects(projects) {
    allProjects = projects;
    const container = document.getElementById('projects');

    if (!projects || projects.length === 0) {
        container.innerHTML = '<div style="text-align:center; grid-column:1/-1; color:#cbd5e1;">هنوز پروژه‌ای اضافه نشده است.</div>';
        return;
    }

    container.innerHTML = projects.map((p) => {
        const imgSrc = p.image_url ? (p.image_url.includes('uploads/') ? `http://localhost:3000/${p.image_url}` : p.image_url) : null;
        return `
      <div class="project-card" onclick="openModal(${p.id})">
        ${imgSrc ? `<img src="${imgSrc}" class="project-image" onerror="this.style.display='none';">` : `<div class="project-image">🤖</div>`}
        <div class="project-body">
          <h3 class="project-title">${escapeHtml(p.title)}</h3>
          <div class="project-team">👥 ${escapeHtml(p.team_name || 'تیم ناشناس')}</div>
          <div class="project-score">⭐ امتیاز: ${p.avg_score} از ۱۰ (${p.vote_count} رأی)</div>
        </div>
      </div>
    `;
    }).join('');
}

function openModal(projectId) {
    currentProjectId = projectId;
    const project = allProjects.find(p => p.id === projectId);
    if (!project) return;

    document.getElementById('modal-title').textContent = project.title;
    document.getElementById('modal-desc').textContent = project.description;

    const videoContainer = document.getElementById('modal-video-container');
    if (project.video_url) {
        videoContainer.innerHTML = getVideoHtml(project.video_url);
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }

    const voted = getVotedProjects();
    if (voted.includes(projectId)) {
        document.getElementById('rating-section').style.display = 'none';
        document.getElementById('already-rated-msg').style.display = 'block';
    } else {
        document.getElementById('rating-section').style.display = 'block';
        document.getElementById('already-rated-msg').style.display = 'none';
        currentSelectedScore = 0;
        document.getElementById('submit-rating-btn').disabled = true;
        document.querySelectorAll('.rate-btn').forEach(btn => btn.classList.remove('selected'));
    }

    document.getElementById('project-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('project-modal').style.display = 'none';
    document.getElementById('modal-video-container').innerHTML = '';
}

document.getElementById('project-modal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

function selectScore(score) {
    currentSelectedScore = score;
    document.querySelectorAll('.rate-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    document.getElementById('submit-rating-btn').disabled = false;
}

async function submitRating() {
    const btn = document.getElementById('submit-rating-btn');
    btn.disabled = true;
    btn.textContent = 'در حال ثبت...';

    try {
        const response = await fetch(`${API_URL}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: currentProjectId,
                voter_id: VOTER_ID,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                phone_number: userInfo.phone_number,
                score: currentSelectedScore
            })
        });
        const data = await response.json();

        if (data.success) {
            showToast('امتیاز شما با موفقیت ثبت شد! ✅', 'success');
            markAsVoted(currentProjectId);
            closeModal();
            loadProjects();
        } else {
            showToast(data.message, 'error');
            btn.disabled = false;
            btn.textContent = 'ثبت امتیاز';
        }
    } catch (e) {
        showToast('خطا در ارتباط با سرور', 'error');
        btn.disabled = false;
        btn.textContent = 'ثبت امتیاز';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`);
        const data = await response.json();
        renderProjects(data);
    } catch (e) {
        document.getElementById('projects').innerHTML = '<div style="text-align:center; grid-column:1/-1; color:#ef4444;">خطا در بارگذاری پروژه‌ها</div>';
    }
}