const username = sessionStorage.getItem("vibespaceUser");
if (!username) window.location.href = "login.html";
const POSTS_KEY = "vibespacePosts";
const SAVED_KEY = "vibespaceSaved_" + username;
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profileAvatar = document.getElementById("profileAvatar");
const profileBio = document.getElementById("profileBio");
const postCount = document.getElementById("postCount");
const photoGrid = document.getElementById("photoGrid");
const emptyMessage = document.getElementById("emptyMessage");
const tabs = document.querySelectorAll(".tab");
const staticCards = Array.from(document.querySelectorAll(".photo-card"));
let activeTab = "posts";
let savedProfile = JSON.parse(localStorage.getItem("vibespaceProfile_" + username) || "{}");

function readPosts() { try { return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]"); } catch { return []; } }
function readSaved() { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); } catch { return []; } }
function renderProfile() {
    const name = savedProfile.name || username;
    profileName.textContent = name;
    profileUsername.textContent = "@" + username.toLowerCase().replace(/\s+/g, "");
    profileAvatar.textContent = name.charAt(0).toUpperCase();
    if (savedProfile.bio) profileBio.textContent = savedProfile.bio;
    postCount.textContent = staticCards.length + readPosts().filter(p => p.author === username).length;
}
renderProfile();

const editModal = document.getElementById("editModal");
const profileForm = document.getElementById("profileForm");
document.getElementById("editProfile").addEventListener("click", () => {
    document.getElementById("editName").value = savedProfile.name || username;
    document.getElementById("editBio").value = savedProfile.bio || "";
    editModal.hidden = false;
});
document.getElementById("closeModal").addEventListener("click", () => editModal.hidden = true);
editModal.addEventListener("click", event => { if (event.target === editModal) editModal.hidden = true; });
profileForm.addEventListener("submit", event => {
    event.preventDefault();
    savedProfile.name = document.getElementById("editName").value.trim();
    savedProfile.bio = document.getElementById("editBio").value.trim();
    if (!savedProfile.name) { alert("Nama tidak boleh kosong."); return; }
    localStorage.setItem("vibespaceProfile_" + username, JSON.stringify(savedProfile));
    renderProfile(); editModal.hidden = true;
});

function renderDynamicCards() {
    photoGrid.querySelectorAll(".dynamic-photo-card").forEach(card => card.remove());
    const allPosts = readPosts();
    let items = [];
    if (activeTab === "posts") items = allPosts.filter(post => post.author === username);
    if (activeTab === "saved") items = allPosts.filter(post => readSaved().includes(post.id));
    items.slice().reverse().forEach(post => {
        const card = document.createElement("article");
        card.className = "photo-card dynamic-photo-card";
        card.style.cssText = "min-height:190px;display:flex;flex-direction:column;justify-content:space-between;padding:18px;background:linear-gradient(145deg,#241b50,#11152d);border:1px solid #7957ff55;border-radius:14px;overflow-wrap:anywhere";
        const author = document.createElement("strong"); author.textContent = "@" + post.author;
        const content = document.createElement("p"); content.textContent = post.text; content.style.cssText = "margin:14px 0;color:inherit;white-space:pre-wrap";
        const footer = document.createElement("div"); footer.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px";
        const likes = document.createElement("span"); likes.textContent = "♥ " + (post.likes || 0);
        footer.appendChild(likes);
        if (post.author === username) {
            const remove = document.createElement("button"); remove.textContent = "🗑️ Hapus"; remove.style.cssText = "padding:7px 10px;background:#a83258;color:white;border:0;border-radius:8px;cursor:pointer";
            remove.addEventListener("click", () => {
                if (!confirm("Hapus postingan ini?")) return;
                localStorage.setItem(POSTS_KEY, JSON.stringify(readPosts().filter(item => item.id !== post.id)));
                renderProfile(); renderDynamicCards();
            });
            footer.appendChild(remove);
        }
        card.append(author, content, footer); photoGrid.appendChild(card);
    });
    staticCards.forEach(card => { card.hidden = activeTab !== "posts"; });
    const staticVisible = activeTab === "posts" ? staticCards.length : 0;
    emptyMessage.hidden = staticVisible + items.length !== 0;
    postCount.textContent = staticCards.length + allPosts.filter(p => p.author === username).length;
}
function selectTab(tab) {
    activeTab = tab;
    tabs.forEach(item => item.classList.toggle("active", item.dataset.tab === tab));
    renderDynamicCards();
}
tabs.forEach(tab => tab.addEventListener("click", () => selectTab(tab.dataset.tab)));

// Search existing sample photos and dynamic posts.
document.getElementById("searchInput").addEventListener("input", event => {
    const query = event.target.value.trim().toLowerCase();
    staticCards.forEach(card => { card.hidden = activeTab !== "posts" || !card.querySelector("img").alt.toLowerCase().includes(query); });
    photoGrid.querySelectorAll(".dynamic-photo-card").forEach(card => { card.hidden = !card.textContent.toLowerCase().includes(query); });
});

document.querySelectorAll("[data-highlight]").forEach(button => button.addEventListener("click", () => alert("Highlight " + button.dataset.highlight + " masih contoh.")));
document.getElementById("addHighlight").addEventListener("click", () => alert("Fitur Story Highlight bisa dikembangkan berikutnya."));
renderDynamicCards();
