
const loginForm = document.getElementById("loginForm");
const themeToggle = document.getElementById("themeToggle");

// Fungsi login
if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (username === "" || password === "") {
            alert("Username dan password harus diisi!");
            return;
        }

        sessionStorage.setItem("vibespaceUser", username);
        window.location.href = "home.html";
    });
}

// Fungsi menerapkan tema
function applyTheme() {
    const savedTheme =
        localStorage.getItem("vibespaceTheme") || "dark";

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

// Terapkan tema saat halaman dibuka
applyTheme();

// Fungsi tombol tema
if (themeToggle) {
    themeToggle.addEventListener("click", function () {
        const isDark =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            "vibespaceTheme",
            isDark ? "light" : "dark"
        );

        applyTheme();
    });
}
