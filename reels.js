
const reelsFeed = document.getElementById("reelsFeed");
const soundToggle = document.getElementById("soundToggle");

const videos = [
    {
        url: "Download.mp4",
        username: "@vibespace",
        caption: "Nikmati momen dan suasana baru ✨"
    },
    {
        url: "Download (1).mp4",
        username: "@dailyvibes",
        caption: "Hari ini waktunya menikmati perjalanan 🚗"
    },
    {
        url: "Download (2).mp4",
        username: "@funzone",
        caption: "Cari keseruan di setiap momen 🔥"
    },
    {
        url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        username: "@randomclips",
        caption: "Tonton sampai selesai 👀"
    },
    {
        url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        username: "@videohub",
        caption: "Video pilihan buat nemenin waktu santai 🎬"
    }
];

// Acak urutan video setiap halaman dibuka
videos.sort(() => Math.random() - 0.5);

let soundOn = false;

reelsFeed.innerHTML = "";

videos.forEach((video, index) => {
    const reel = document.createElement("section");
    reel.className = "reel";

    reel.innerHTML = `
        <video
            src="${video.url}"
            loop
            muted
            playsinline
            preload="${index === 0 ? "auto" : "metadata"}"
        ></video>

        <div class="reel-info">
            <h3>${video.username}</h3>
            <p>${video.caption}</p>
        </div>

        <div class="reel-actions">
            <button class="like-button" aria-label="Suka">♡</button>
            <button class="mute-button" aria-label="Suara">🔇</button>
        </div>
    `;

    const videoElement = reel.querySelector("video");
    const likeButton = reel.querySelector(".like-button");
    const muteButton = reel.querySelector(".mute-button");

    likeButton.addEventListener("click", () => {
        likeButton.classList.toggle("liked");

        if (likeButton.classList.contains("liked")) {
            likeButton.textContent = "♥";
        } else {
            likeButton.textContent = "♡";
        }
    });

    muteButton.addEventListener("click", () => {
        soundOn = !soundOn;

        document.querySelectorAll(".reel video").forEach((item) => {
            item.muted = !soundOn;
        });

        updateSoundButtons();
    });

    reelsFeed.appendChild(reel);
});

function updateSoundButtons() {
    document.querySelectorAll(".mute-button").forEach((button) => {
        button.textContent = soundOn ? "🔊" : "🔇";
    });

    soundToggle.textContent = soundOn ? "🔊 Suara" : "🔇 Suara";
}

soundToggle.addEventListener("click", () => {
    soundOn = !soundOn;

    document.querySelectorAll(".reel video").forEach((video) => {
        video.muted = !soundOn;
    });

    updateSoundButtons();
});

// Video yang terlihat akan diputar; yang lain dijeda
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const video = entry.target.querySelector("video");

        if (entry.isIntersecting) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    });
}, {
    root: reelsFeed,
    threshold: 0.65
});

document.querySelectorAll(".reel").forEach((reel) => {
    observer.observe(reel);
});
