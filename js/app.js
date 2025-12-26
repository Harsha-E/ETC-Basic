// js/app.js
import { db } from './config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 1. Theme Handling ---
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const icon = themeToggle.querySelector('.material-icons');

function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
}

const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
});

// --- 2. Data Fetching ---
const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

async function loadData() {
    try {
        // A. Fetch Announcements
        const annRef = collection(db, "announcements");
        const annq = query(annRef, orderBy("createdAt", "desc"));
        const annSnap = await getDocs(annq);
        
        const annContainer = document.getElementById('announcement-list');
        if (annSnap.empty) {
            annContainer.innerHTML = '<p style="color:var(--text-muted)">No announcements yet.</p>';
        } else {
            annContainer.innerHTML = annSnap.docs.map(doc => {
                const data = doc.data();
                return `
                <div class="card">
                    <p style="font-size: 1.1rem; margin-bottom:0.5rem;">${data.content}</p>
                    <small>${formatDate(data.createdAt)}</small>
                </div>`;
            }).join('');
        }

        // B. Fetch Prompts
        const promptRef = collection(db, "prompts");
        const promptQ = query(promptRef, orderBy("createdAt", "desc"));
        const promptSnap = await getDocs(promptQ);

        const promptContainer = document.getElementById('prompt-list');
        const promptsHTML = promptSnap.docs.map(doc => {
            const data = doc.data();
            return `
            <div class="card prompt-card" data-category="${data.category || 'other'}">
                <span class="tag">${data.category || 'General'}</span>
                <h3>${data.title}</h3>
                <p>${data.content}</p>
            </div>`;
        }).join('');
        promptContainer.innerHTML = promptsHTML || '<p>No prompts available.</p>';

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// --- 3. Filtering ---
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        const cards = document.querySelectorAll('.prompt-card');
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// --- 4. Animation Observer ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

loadData();
