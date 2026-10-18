
const welcome = document.getElementById("welcome");
const postInput = document.getElementById("postInput");
const feed = document.getElementById("feed");
const searchInput = document.getElementById("searchInput");

// Ambil username yang disimpan saat login
const username = sessionStorage.getItem("vibespaceUser");

if (username) {
    welcome.textContent = `Selamat datang, ${username}! 👋`;
}

// Fungsi membuat postingan
function addPost() {
    const text = postInput.value.trim();

    if (text === "") {
        alert("Tulis sesuatu dulu, bro!");
        return;
    }

    const post = document.createElement("article");
    post.className = "post";

    const heading = document.createElement("h4");
    heading.textContent = username || "Aditya";

    const handle = document.createElement("span");
    handle.textContent = " @user";

    heading.appendChild(handle);

    const paragraph = document.createElement("p");
    paragraph.textContent = text;

    const likeButton = document.createElement("button");
    likeButton.className = "like-btn";
    likeButton.append("♡ Like ");

    const count = document.createElement("span");
    count.textContent = "0";
    likeButton.appendChild(count);

    likeButton.addEventListener("click", function () {
        likePost(likeButton);
    });

    post.append(heading, paragraph, likeButton);

    // Masukkan postingan baru di urutan paling atas
    const firstPost = feed.querySelector(".post");

    if (firstPost) {
        feed.insertBefore(post, firstPost);
    } else {
        feed.appendChild(post);
    }

    postInput.value = "";
}

// Fungsi Like dan Unlike
function likePost(button) {
    const count = button.querySelector("span");
    let likes = Number(count.textContent);

    if (button.classList.contains("liked")) {
        likes--;
        button.classList.remove("liked");
        button.firstChild.textContent = "♡ Like ";
    } else {
        likes++;
        button.classList.add("liked");
        button.firstChild.textContent = "♥ Liked ";
    }

    count.textContent = likes;
}

// Fungsi Follow dan Unfollow
function followUser(button) {
    if (button.textContent === "Follow") {
        button.textContent = "Following";
        button.style.background = "#e9e6ff";
        button.style.color = "#6c5ce7";
    } else {
        button.textContent = "Follow";
        button.style.background = "#6c5ce7";
        button.style.color = "white";
    }
}

// Fungsi pencarian postingan
searchInput.addEventListener("input", function () {
    const keyword = searchInput.value.toLowerCase();
    const posts = feed.querySelectorAll(".post");

    posts.forEach(function (post) {
        const content = post.textContent.toLowerCase();

        if (content.includes(keyword)) {
            post.style.display = "";
        } else {
            post.style.display = "none";
        }
    });
});

// Fungsi Logout
function logout() {
    const confirmLogout = confirm("Yakin mau logout?");

    if (confirmLogout) {
        sessionStorage.removeItem("vibespaceUser");
        window.location.href = "login.html";
    }
}


const themeToggle = document.getElementById("themeToggle");

function applyTheme() {
    const savedTheme = localStorage.getItem("vibespaceTheme") || "light";

    document.body.classList.toggle(
        "dark-mode",
        savedTheme === "dark"
    );

    if (themeToggle) {
        themeToggle.textContent =
            savedTheme === "dark"
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";
    }
}

applyTheme();

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem(
            "vibespaceTheme",
            isDark ? "light" : "dark"
        );
        applyTheme();
    });
}


// STORIES: lingkaran profil, tambah story foto/teks, viewer, dan simpan lokal.
(function initVibeSpaceStories() {
    const storiesContainer = document.getElementById("stories");
    const addButton = document.getElementById("addStoryButton");
    const imageInput = document.getElementById("storyImageInput");
    const modal = document.getElementById("storyModal");
    const closeButton = document.getElementById("closeStory");
    const viewerUser = document.getElementById("storyViewerUser");
    const viewerContent = document.getElementById("storyViewerContent");
    const viewerActions = document.getElementById("storyViewerActions");
    const progress = document.getElementById("storyProgress");
    const STORAGE_KEY = "vibespaceStories";
    const currentUser = sessionStorage.getItem("vibespaceUser") || "Aditya";
    let activeTimer = null;

    function readStories() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            const cutoff = Date.now() - 24 * 60 * 60 * 1000;
            const fresh = saved.filter(item => item && item.createdAt > cutoff);
            if (fresh.length !== saved.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
            return fresh;
        } catch (_) { return []; }
    }
    function saveStories(items) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
        catch (_) { alert("Penyimpanan browser penuh. Coba gunakan gambar yang lebih kecil."); }
    }
    function initials(name) { return (name.trim()[0] || "?").toUpperCase(); }
    function makeAvatar(name, group, hasUnseen) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "story" + (group.isOwn ? " story-add" : "");
        button.setAttribute("aria-label", "Lihat story " + name);
        const avatar = document.createElement("span");
        avatar.className = "story-avatar" + (hasUnseen ? " has-story" : "");
        if (group.avatar) {
            const img = document.createElement("img"); img.src = group.avatar; img.alt = ""; avatar.appendChild(img);
        } else avatar.textContent = initials(name);
        const label = document.createElement("span"); label.textContent = name;
        button.append(avatar, label);
        button.addEventListener("click", () => group.isOwn && !group.items.length ? imageInput.click() : openStoryGroup(name, group.items));
        return button;
    }
    function renderStories() {
        if (!storiesContainer) return;
        storiesContainer.querySelectorAll(".story:not(.story-add)").forEach(el => el.remove());
        const all = readStories();
        const byUser = new Map();
        all.forEach(item => {
            if (!byUser.has(item.username)) byUser.set(item.username, []);
            byUser.get(item.username).push(item);
        });
        const ownItems = (byUser.get(currentUser) || []).sort((a,b) => a.createdAt-b.createdAt);
        if (addButton) {
            const label = addButton.querySelector("span:last-child");
            if (label) label.textContent = ownItems.length ? "Story lu" : "Tambah";
            addButton.onclick = () => imageInput.click();
        }
        byUser.forEach((items, name) => {
            if (name === currentUser) return;
            const latest = items[items.length - 1];
            const group = {items: items.sort((a,b)=>a.createdAt-b.createdAt), avatar: latest.avatar || ""};
            storiesContainer.appendChild(makeAvatar(name, group, true));
        });
        if (ownItems.length && addButton) {
            addButton.querySelector(".story-avatar")?.classList.add("has-story");
            addButton.onclick = () => openStoryGroup(currentUser, ownItems);
        } else addButton?.querySelector(".story-avatar")?.classList.remove("has-story");
    }
    function openStoryGroup(name, items) {
        if (!items.length) { imageInput.click(); return; }
        let index = 0;
        modal.hidden = false;
        document.body.classList.add("story-open");
        function show() {
            if (index >= items.length) { closeStory(); return; }
            const item = items[index];
            viewerUser.textContent = name + " · " + new Date(item.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
            viewerContent.replaceChildren();
            if (item.image) { const img = document.createElement("img"); img.src = item.image; img.alt = "Story de " + name; viewerContent.appendChild(img); }
            if (item.text) { const caption = document.createElement("p"); caption.textContent = item.text; viewerContent.appendChild(caption); }
            viewerActions.replaceChildren();
            if (name === currentUser) {
                const del = document.createElement("button"); del.type="button"; del.textContent="Hapus story";
                del.addEventListener("click", () => { saveStories(readStories().filter(s => s.id !== item.id)); items.splice(index,1); renderStories(); if (!items.length) closeStory(); else show(); });
                viewerActions.appendChild(del);
            }
            progress.style.transition = "none"; progress.style.width = "0%";
            requestAnimationFrame(() => { progress.style.transition = "width 5s linear"; progress.style.width = "100%"; });
            clearTimeout(activeTimer); activeTimer = setTimeout(() => { index++; show(); }, 5000);
        }
        show();
    }
    function closeStory() {
        clearTimeout(activeTimer); modal.hidden = true; document.body.classList.remove("story-open");
        viewerContent.replaceChildren(); viewerActions.replaceChildren();
    }
    addButton?.addEventListener("click", () => imageInput.click());
    imageInput?.addEventListener("change", () => {
        const file = imageInput.files && imageInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("Pilih file gambar ya."); imageInput.value=""; return; }
        if (file.size > 2 * 1024 * 1024) { alert("Ukuran foto maksimal 2 MB supaya bisa disimpan di browser."); imageInput.value=""; return; }
        const reader = new FileReader();
        reader.onload = () => {
            const text = prompt("Tulis cerita (opsional):", "");
            const item = {id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), username: currentUser, image: reader.result, text: (text || "").trim(), createdAt: Date.now()};
            const stories = readStories(); stories.push(item); saveStories(stories); renderStories(); openStoryGroup(currentUser, [item]); imageInput.value="";
        };
        reader.readAsDataURL(file);
    });
    closeButton?.addEventListener("click", closeStory);
    modal?.addEventListener("click", event => { if (event.target === modal) closeStory(); });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && modal && !modal.hidden) closeStory(); });
    renderStories();
})();
