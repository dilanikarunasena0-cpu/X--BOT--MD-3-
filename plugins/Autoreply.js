const { Sparky, isPublic } = require("../lib");
const fs = require("fs");
const path = require("path");

// 📂 ලෙඩ දෙන database ෆෝල්ඩර් අයින් කරලා කෙලින්ම මේ ප්ලගින් එක තියෙන තැනම ෆයිල් එක හදමු
const DATA_FILE = path.join(__dirname, "autoreplies.json");

// 🧠 Memory cache
let autoReplies = [];

// -------------------------
// LOAD DATA
// -------------------------
function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
            console.log("📝 [AutoReply] New JSON file created at:", DATA_FILE);
        }
        const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
        autoReplies = JSON.parse(fileContent);
        console.log(`🧠 [AutoReply] Loaded ${autoReplies.length} rules successfully.`);
    } catch (err) {
        console.error("❌ [AutoReply] Load error:", err);
        autoReplies = [];
    }
}

// -------------------------
// SAVE DATA
// -------------------------
function saveData() {
    try {
        const fd = fs.openSync(DATA_FILE, "w");
        fs.writeFileSync(fd, JSON.stringify(autoReplies, null, 2), "utf-8");
        fs.fdatasyncSync(fd); // Storage එකටම ලියන්න බල කරනවා (Force write)
        fs.closeSync(fd);
        console.log("💾 [AutoReply] Data successfully flushed to disk.");
    } catch (err) {
        console.error("❌ [AutoReply] Save error:", err);
    }
}

// Load on start
loadData();


// ======================================================
// ➕ ADD AUTO REPLY (OWNER ONLY)
// ======================================================
Sparky({
    name: "addreply",
    alias: ["ar"],
    category: "tools",
    fromMe: false, // Owner Only
    desc: "Add auto reply keyword"
}, async ({ m, text }) => {
    try {
        let inputBody = text || m.text || m.body || "";
        
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
        loadData(); // සේව් කරන්න කලින් ෆයිල් එක ආයේ කියවමු
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
// 🗑️ DELETE AUTO REPLY (OWNER ONLY)
// ======================================================
Sparky({
    name: "delreply",
    alias: ["dr"],
    category: "tools",
    fromMe: false,
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

        loadData();
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
// 📜 LIST AUTO REPLIES (OWNER ONLY)
// ======================================================
Sparky({
    name: "listreply",
    alias: ["lr"],
    category: "tools",
    fromMe: false,
    desc: "Show all auto replies"
}, async ({ m }) => {
    try {
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
        const rawText = m.body || m.text || "";
        const msg = rawText.toLowerCase().trim();
        
        if (!msg || msg.startsWith(".")) return;

        // මැසේජ් එකක් ආවම ලිස්ට් එක අප්ඩේට් එකක්ද බලන්න ෆයිල් එක කියවනවා
        loadData();

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

