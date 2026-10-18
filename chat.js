
const contactList = document.getElementById("contactList");
const searchContact = document.getElementById("searchContact");
const chatHeader = document.getElementById("chatHeader");
const messageList = document.getElementById("messageList");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChatBtn = document.getElementById("newChatBtn");

const STORAGE_KEY = "vibespace_chats_v1";

const contacts = [
    { id: "apri", name: "Apri" },
    { id: "rizky", name: "Rizky" },
    { id: "dina", name: "Dina" }
];

let chats = {};

try {
    chats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
} catch {
    chats = {};
}

let activeContact = null;

function saveChats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function getContact(id) {
    return contacts.find(contact => contact.id === id);
}

function getMessages(id) {
    if (!Array.isArray(chats[id])) {
        chats[id] = [];
    }

    return chats[id];
}

function renderContacts() {
    const keyword = searchContact.value.trim().toLowerCase();

    contactList.innerHTML = "";

    contacts
        .filter(contact => contact.name.toLowerCase().includes(keyword))
        .forEach(contact => {
            const messages = getMessages(contact.id);
            const lastMessage = messages[messages.length - 1];

            const button = document.createElement("button");
            button.className = "contact";

            if (activeContact === contact.id) {
                button.classList.add("active");
            }

            const avatar = document.createElement("span");
            avatar.className = "avatar";
            avatar.textContent = contact.name.charAt(0).toUpperCase();

            const info = document.createElement("span");
            info.className = "contact-info";

            const name = document.createElement("strong");
            name.textContent = contact.name;

            const preview = document.createElement("small");
            preview.textContent = lastMessage
                ? lastMessage.text
                : "Mulai percakapan";

            info.append(name, preview);
            button.append(avatar, info);

            button.addEventListener("click", () => {
                openChat(contact.id);
            });

            contactList.appendChild(button);
        });
}

function openChat(id) {
    const contact = getContact(id);

    if (!contact) return;

    activeContact = id;

    chatHeader.innerHTML = "";

    const title = document.createElement("h3");
    title.textContent = contact.name;

    const subtitle = document.createElement("p");
    subtitle.textContent = "Percakapan pribadi";

    chatHeader.append(title, subtitle);

    messageInput.disabled = false;
    sendButton.disabled = false;

    renderMessages();
    renderContacts();
    messageInput.focus();
}

function renderMessages() {
    messageList.innerHTML = "";

    if (!activeContact) return;

    const messages = getMessages(activeContact);

    if (messages.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-chat";

        const title = document.createElement("h3");
        title.textContent = "Mulai obrolan 👋";

        const text = document.createElement("p");
        text.textContent = "Kirim pesan pertama lo.";

        empty.append(title, text);
        messageList.appendChild(empty);
        return;
    }

    messages.forEach(message => {
        const bubble = document.createElement("div");
        bubble.className = `message ${
            message.sender === "me" ? "sent" : "received"
        }`;

        const text = document.createElement("p");
        text.textContent = message.text;

        const time = document.createElement("small");
        time.textContent = message.time;

        bubble.append(text, time);
        messageList.appendChild(bubble);
    });

    messageList.scrollTop = messageList.scrollHeight;
}

messageForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!activeContact) return;

    const text = messageInput.value.trim();

    if (!text) return;

    const now = new Date();

    getMessages(activeContact).push({
        sender: "me",
        text,
        time: now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        })
    });

    saveChats();

    messageInput.value = "";

    renderMessages();
    renderContacts();
});

searchContact.addEventListener("input", renderContacts);

newChatBtn.addEventListener("click", () => {
    const name = prompt("Masukkan nama teman baru:");

    if (!name || !name.trim()) return;

    const cleanName = name.trim();

    if (contacts.some(contact =>
        contact.name.toLowerCase() === cleanName.toLowerCase()
    )) {
        alert("Nama teman tersebut sudah ada.");
        return;
    }

    const id = "contact_" + Date.now();

    contacts.push({
        id,
        name: cleanName
    });

    renderContacts();
    openChat(id);
});

renderContacts();
