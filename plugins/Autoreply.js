const { Sparky, isPublic } = require("../lib");

// ======================================================
// ➕ ADD AUTO REPLY (OWNER ONLY)
// ======================================================
Sparky({
    name: "addreply",
    alias: ["ar"],
    category: "tools",
    fromMe: true, // දැන් ඔයාට විතරක් වැඩ කරයි (Locked වෙන්නේ නැත)
    desc: "Add auto reply keyword"
}, async ({ m, text, client }) => {
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

        // Bot එකේ දැනට තියෙන Database එකෙන් Auto Reply එකක් තියෙනවද බලනවා
        // (X-BOT-MD database එකට සෘජුවම සම්බන්ධයි)
        if (client.database && client.database.get) {
            let currentData = await client.database.get("auto_replies") || [];
            
            const exists = currentData.find(r => r.keyword === keyword);
            if (exists) {
                return m.reply("⚠️ This keyword already exists!");
            }

            currentData.push({ keyword, reply, createdAt: Date.now() });
            await client.database.set("auto_replies", currentData);
        } else {
            return m.reply("❌ Main database connection failed inside plugin!");
        }

        return m.reply(
            `✅ Auto reply saved to Cloud DB!\n\n🔑 Keyword: ${keyword}\n💬 Reply: ${reply}`
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
    fromMe: true, // Owner Only
    desc: "Delete auto reply keyword"
}, async ({ m, text, client }) => {
    try {
        let inputKey = text || m.text || m.body || "";
        if (inputKey.startsWith(".")) {
            inputKey = inputKey.replace(/^\.\w+\s+/, "");
        }

        const key = inputKey.trim().toLowerCase();

        if (!key) {
            return m.reply("❌ Usage:\n.delreply keyword");
        }

        if (client.database && client.database.get) {
            let currentData = await client.database.get("auto_replies") || [];
            const before = currentData.length;
            
            currentData = currentData.filter(r => r.keyword !== key);

            if (before === currentData.length) {
                return m.reply("❌ Keyword not found!");
            }

            await client.database.set("auto_replies", currentData);
            return m.reply(`🗑️ Deleted auto reply for: ${key}`);
        } else {
            return m.reply("❌ Database error!");
        }

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
    fromMe: true, // Owner Only
    desc: "Show all auto replies"
}, async ({ m, client }) => {
    try {
        if (!client.database || !client.database.get) {
            return m.reply("❌ Database connection error!");
        }

        let currentData = await client.database.get("auto_replies") || [];

        if (!currentData.length) {
            return m.reply("📭 No auto replies found in Database!");
        }

        let msg = "📌 *AUTO REPLIES LIST (CLOUD DB)*\n\n";
        currentData.forEach((r, i) => {
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
}, async ({ m, client }) => {
    try {
        const rawText = m.body || m.text || "";
        const msg = rawText.toLowerCase().trim();
        
        // Command එකක් නම් හෝ මැසේජ් එකක් නැත්නම් skip කරනවා
        if (!msg || msg.startsWith(".")) return;

        if (!client.database || !client.database.get) return;
        
        // මැසේජ් එකක් ආපු ගමන් Database එකෙන් ලිස්ට් එක ගන්නවා
        let currentData = await client.database.get("auto_replies") || [];

        // Exact match (හරියටම සමානද බලනවා)
        let rule = currentData.find(r => msg === r.keyword);

        // Fallback partial match (මැසේජ් එක ඇතුලේ වචනය තියෙනවද බලනවා)
        if (!rule) {
            rule = currentData.find(r => msg.includes(r.keyword));
        }

        if (rule) {
            return await m.reply(rule.reply);
        }

    } catch (err) {
        console.error("AutoReply Listener Error:", err);
    }
});

