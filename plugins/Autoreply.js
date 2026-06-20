const { Sparky, isPublic } = require("../lib");
const fs = require("fs");
const path = require("path");

// 📂 Database file
const DATA_FILE = path.join(__dirname, "../database/autoreplies.json");

// 🧠 Memory cache
let autoReplies = [];

// -------------------------
// LOAD DATA
// -------------------------
function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
        }
        autoReplies = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } catch (err) {
        console.error("❌ Load error:", err);
        autoReplies = [];
    }
}

// -------------------------
// SAVE DATA
// -------------------------
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(autoReplies, null, 2));
    } catch (err) {
        console.error("❌ Save error:", err);
    }
}

// Load on start
loadData();


// ======================================================
// ➕ ADD AUTO REPLY
// ======================================================
Sparky({
    name: "addreply",
    alias: ["ar"],
    category: "tools",
    fromMe: isPublic,
    desc: "Add auto reply keyword"
}, async ({ m, text }) => {
    try {

        const input = (text || "").trim();

        if (!input.includes("|")) {
            return m.reply("❌ Usage:\n.addreply keyword|message");
        }

        const parts = input.split("|");

        if (parts.length < 2) {
            return m.reply("❌ Usage:\n.addreply keyword|message");
        }

        const keyword = parts[0].trim().toLowerCase();
        const reply = parts.slice(1).join("|").trim();

        if (!keyword || !reply) {
            return m.reply("❌ Keyword or reply missing!");
        }

        // duplicate check
        const exists = autoReplies.find(r => r.keyword === keyword);
        if (exists) {
            return m.reply("⚠️ This keyword already exists!");
        }

        autoReplies.push({
            keyword,
            reply,
            createdAt: Date.now()
        });

        saveData();

        return m.reply(
            `✅ Auto reply saved!\n\n🔑 Keyword: ${keyword}\n💬 Reply: ${reply}`
        );

    } catch (err) {
        console.error("AddReply Error:", err);
        m.reply("❌ Error adding reply");
    }
});


// ======================================================
// 🗑️ DELETE AUTO REPLY
// ======================================================
Sparky({
    name: "delreply",
    alias: ["dr"],
    category: "tools",
    fromMe: isPublic,
    desc: "Delete auto reply keyword"
}, async ({ m, text }) => {
    try {

        const key = (text || "").trim().toLowerCase();

        if (!key) {
            return m.reply("❌ Usage:\n.delreply keyword");
        }

        const before = autoReplies.length;

        autoReplies = autoReplies.filter(r => r.keyword !== key);

        if (before === autoReplies.length) {
            return m.reply("❌ Keyword not found!");
        }

        saveData();

        return m.reply(`🗑️ Deleted: ${key}`);

    } catch (err) {
        console.error("DelReply Error:", err);
        m.reply("❌ Error deleting reply");
    }
});


// ======================================================
// 📜 LIST AUTO REPLIES
// ======================================================
Sparky({
    name: "listreply",
    alias: ["lr"],
    category: "tools",
    fromMe: isPublic,
    desc: "Show all auto replies"
}, async ({ m }) => {
    try {

        if (!autoReplies.length) {
            return m.reply("📭 No auto replies found!");
        }

        let msg = "📌 *AUTO REPLIES LIST*\n\n";

        autoReplies.forEach((r, i) => {
            msg += `${i + 1}. 🔑 ${r.keyword}\n💬 ${r.reply}\n\n`;
        });

        return m.reply(msg);

    } catch (err) {
        console.error("ListReply Error:", err);
        m.reply("❌ Error fetching list");
    }
});


// ======================================================
// 🤖 AUTO REPLY LISTENER
// ======================================================
Sparky({
    on: "text",
    fromMe: isPublic
}, async ({ m, text }) => {
    try {

        const msg = (text || "").toLowerCase().trim();
        if (!msg) return;

        // exact match first (better performance)
        let rule = autoReplies.find(r => msg === r.keyword);

        // fallback partial match
        if (!rule) {
            rule = autoReplies.find(r => msg.includes(r.keyword));
        }

        if (rule) {
            return await m.reply(rule.reply);
        }

    } catch (err) {
        console.error("AutoReply Error:", err);
    }
});
