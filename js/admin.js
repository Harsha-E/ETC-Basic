// js/admin.js
import { auth, db } from './config.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- STATE MANAGEMENT ---
let currentTab = 'announcements';

// --- UI HELPERS ---
const toggleDisplay = (elementId, show) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
};

// --- AUTHENTICATION STATE ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in
        toggleDisplay('login-screen', false);
        toggleDisplay('dashboard', true);
        fetchItems('announcements'); // Load default tab data
    } else {
        // User is logged out
        toggleDisplay('login-screen', true);
        toggleDisplay('dashboard', false);
    }
});

// --- LOGIN LOGIC ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (err) {
            alert("Login failed: " + err.message);
        }
    });
}

// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => signOut(auth));
}

// --- TAB NAVIGATION ---
window.switchTab = (tabName) => {
    currentTab = tabName;

    // 1. Hide all tab contents
    const annTab = document.getElementById('tab-announcements');
    const prmTab = document.getElementById('tab-prompts');
    
    if(annTab) annTab.classList.add('hidden');
    if(prmTab) prmTab.classList.add('hidden');

    // 2. Show selected tab content
    const selectedTab = document.getElementById(`tab-${tabName}`);
    if(selectedTab) selectedTab.classList.remove('hidden');

    // 3. Update Button Styles
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Highlight the clicked button (finding by onclick attribute content)
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(b => {
        if(b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabName)) {
            b.classList.add('active');
        }
    });

    // 4. Refresh Data
    fetchItems(tabName);
};

// --- POST DATA ---
window.postData = async (collectionName) => {
    try {
        let data = { createdAt: serverTimestamp() };

        if (collectionName === 'announcements') {
            const content = document.getElementById('ann-content');
            if(!content.value.trim()) return alert("Content cannot be empty");
            data.content = content.value;
            content.value = ''; // Clear form
        } 
        else if (collectionName === 'prompts') {
            const title = document.getElementById('prompt-title');
            const cat = document.getElementById('prompt-cat');
            const content = document.getElementById('prompt-content');
            
            if(!title.value || !content.value) return alert("All fields are required");
            
            data.title = title.value;
            data.category = cat.value;
            data.content = content.value;
            
            // Clear forms
            title.value = ''; 
            content.value = '';
        } 

        await addDoc(collection(db, collectionName), data);
        fetchItems(collectionName); // Refresh list immediately
        alert("Posted successfully!");

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
};

// --- FETCH & RENDER ITEMS ---
async function fetchItems(collectionName) {
    const listContainer = document.getElementById(`list-${collectionName}`);
    if (!listContainer) return;
    
    listContainer.innerHTML = '<p style="text-align:center; color:#64748b;">Loading...</p>';

    try {
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            listContainer.innerHTML = '<p style="text-align:center; color:#64748b;">No items found.</p>';
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            const item = doc.data();
            const date = item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Just now';
            
            // Generate HTML based on the new Design
            html += `
                <div class="list-item">
                    <div class="item-content">
                        <h4>
                            ${collectionName === 'prompts' ? `<span class="tag-badge">${item.category}</span>` : ''} 
                            ${collectionName === 'prompts' ? item.title : 'Announcement'}
                        </h4>
                        <p>${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</p>
                        <small style="color:#94a3b8; font-size:0.75rem;">${date}</small>
                    </div>
                    <button class="btn-delete" onclick="deleteItem('${collectionName}', '${doc.id}')">
                        Delete
                    </button>
                </div>
            `;
        });

        listContainer.innerHTML = html;

    } catch (error) {
        console.error("Error fetching:", error);
        listContainer.innerHTML = '<p style="color:red; text-align:center;">Error loading data.</p>';
    }
}

// --- DELETE DATA ---
window.deleteItem = async (collectionName, docId) => {
    if(!confirm("Are you sure you want to delete this? This cannot be undone.")) return;

    try {
        await deleteDoc(doc(db, collectionName, docId));
        fetchItems(collectionName); // Refresh list
    } catch (error) {
        alert("Error deleting: " + error.message);
    }
};