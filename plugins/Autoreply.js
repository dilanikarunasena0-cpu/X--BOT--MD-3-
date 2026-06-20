const { Sparky, isPublic } = require("../lib");
const fs = require("fs");
const path = require("path");

// 📂 Database folder & file configuration
const DB_DIR = path.join(__dirname, "../database");
const DATA_FILE = path.join(DB_DIR, "autoreplies.json");

// 🧠 Memory cache
let autoReplies = [];

// -------------------------
// LOAD DATA
// -------------------------
function loadData() {
    try {
        // ෆෝල්ඩරය නැත්නම් ඔටෝ හදනවා (ලෙඩ එන එක නවතින්න)
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
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
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
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
        // text එක නැත්නම් m.text හෝ m.body වලින් backup එකක් ගන්නවා
        let inputBody = text || m.text || m.body || "";
        
        // කමාන්ඩ් එක අයින් කරලා ඉතුරු ටික විතරක් ගන්නවා (| එක තියෙන කොටස)
        if (inputBody.startsWith(".")) {
            inputBody = inputBody.replace(/^\.\w+\s+/, "");
        }

        const input = inputBody.trim();

        if (!input.includes("|")) {
            return m.reply("❌ Usage:\n.addreply keyword|message");
        }

        const parts = input.split("|");
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
        m.reply("❌ Error adding reply: " + err.message);
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
        let inputKey = text || m.text || m.body || "";
        if (inputKey.startsWith(".")) {
            inputKey = inputKey.replace(/^\.\w+\s+/, "");
        }

        const key = inputKey.trim().toLowerCase();

        if (!key) {
            return m.reply("❌ Usage:\n.delreply keyword");
        }

        const before = autoReplies.length;
        autoReplies = autoReplies.filter(r => r.keyword !== key);

        if (before === autoReplies.length) {
            return m.reply("❌ Keyword not found!");
        }

        saveData();
        return m.reply(`🗑️ Deleted auto reply for: ${key}`);

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
        // cache එක අප්ඩේට් වී ඇත්දැයි නැවත ෆයිල් එක කියවා තහවුරු කරගමු
        loadData();

        if (!autoReplies.length) {
            return m.reply("📭 No auto replies found!");
        }

        let msg = "📌 *AUTO REPLIES LIST*\n\n";
        autoReplies.forEach((r, i) => {
            msg += `${i + 1}. 🔑 *${r.keyword}* ➜ 💬 ${r.reply}\n\n`;
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
}, async ({ m }) => {
    try {
        // මෙතනදී m.body හෝ m.text කෙලින්ම භාවිතයෙන් ලෙඩ නැති කරගන්නවා
        const rawText = m.body || m.text || "";
        const msg = rawText.toLowerCase().trim();
        
        // කමාන්ඩ් එකක් නම් (තව ප්ලගින් එකක් රන් වෙන වෙලාවක) රිප්ලයි නොකර ඉන්න
        if (!msg || msg.startsWith(".")) return;

        // exact match first
        let rule = autoReplies.find(r => msg === r.keyword);

        // fallback partial match
        if (!rule) {
            rule = autoReplies.find(r => msg.includes(r.keyword));
        }

        if (rule) {
            return await m.reply(rule.reply);
        }

    } catch (err) {
        console.error("AutoReply Listener Error:", err);
    }
});

