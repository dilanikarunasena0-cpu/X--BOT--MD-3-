const { Sparky } = require("../lib");

// Runtime එකේදී වචන තබා ගන්නා තාවකාලික Map එක (බොට් Restart වුවහොත් මැකී යයි)
global.customAutoReplies = global.customAutoReplies || {
    'hi': 'හලෝ මචං! කොහොමද?',
    'bot': 'ඔව් මචං, මම ඔන්ලයින් ඉන්නේ! කියන්න මොකක්ද වෙන්න ඕනේ?'
    'boot': 'boot status video ටිකක් මම තව ටිකකින් හොයලා දෙන්නම් ම්ම දැන් වැඩක කමක් නැද්ද',
};

// 1. 🤖 සාමාන්‍ය TEXT මැසේජ් කියවා රිප්ලයි කරන පද්ධතිය
Sparky({
    on: "text",
    fromMe: false,
    category: "utils",
    desc: "Command මඟින් ඇතුලත් කල වචන සඳහා පිළිතුරු සැපයීම"
}, async ({ client, m }) => {
    try {
        const msgText = m.text ? m.text.toLowerCase().trim() : "";

        if (global.customAutoReplies[msgText]) {
            const replyText = global.customAutoReplies[msgText];

            await client.sendMessage(m.jid, { react: { text: "✨", key: m.key } });

            const replyMessage = `╭─────────────────────────╮
  ✨  *AUTOMATED REPLY*
╰─────────────────────────╯

${replyText}

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

            await client.sendMessage(m.jid, { text: replyMessage }, { quoted: m });
        }
    } catch (err) {
        console.log("Auto reply trigger error:", err);
    }
});

// 2. ➕ අලුත් වචනයක් සහ පිළිතුරක් ඇතුලත් කරන Command එක (.addreply වචනය | රිප්ලයි එක)
Sparky({
    name: "addreply",
    alias: ["adr"],
    category: "tools",
    fromMe: true, // ඕනර්ට විතරක් ඇඩ් කරන්න පුළුවන් වෙන්න
    desc: "අලුත් ඔටෝ රිප්ලයි වචනයක් ඇතුලත් කිරීම"
}, async ({ client, m, args }) => {
    try {
        const input = Array.isArray(args) ? args.join(" ") : String(args || "");
        
        // වචනය සහ රිප්ලයි එක වෙන් කරගැනීමට | ලකුණ පාවිච්චි කරයි
        if (!input.includes("|")) {
            await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
            return await m.reply(`⚠️ *භාවිතා කරන ආකාරය වැරදියි!*
            
📌 *Format:*
.addreply [වචනය] | [යන්න ඕන රිප්ලයි එක]

💡 *Example:*
_.addreply gm | සුබ උදෑසනක් වේවා මචං!_

❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
        }

        const parts = input.split("|");
        const triggerWord = parts[0].trim().toLowerCase();
        const replyText = parts[1].trim();

        if (!triggerWord || !replyText) {
            return await m.reply("❌ වචනය හෝ රිප්ලයි එක හිස්ව තැබිය නොහැක.");
        }

        // List එකට එකතු කිරීම
        global.customAutoReplies[triggerWord] = replyText;

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
        await m.reply(`✅ *සාර්ථකව ඇතුලත් කලා මචං!*

📝 *වචනය :* ${triggerWord}
💬 *පිළිතුර :* ${replyText}

_(සටහන: බොට් Restart වුවහොත් මෙම දත්ත මැකී යයි)_`);

    } catch (err) {
        console.log("Add reply error:", err);
    }
});

// 3. ❌ ඇතුලත් කල වචනයක් නැවත අයින් කරන Command එක (.delreply වචනය)
Sparky({
    name: "delreply",
    alias: ["dlr"],
    category: "tools",
    fromMe: true,
    desc: "ඇතුලත් කල ඔටෝ රිප්ලයි වචනයක් ඉවත් කිරීම"
}, async ({ client, m, args }) => {
    try {
        const input = Array.isArray(args) ? args.join(" ") : String(args || "");
        const triggerWord = input.trim().toLowerCase();

        if (!triggerWord) return await m.reply("❌ කරුණාකර ඉවත් කිරීමට අවශ්‍ය වචනය ඇතුලත් කරන්න. (උදා: .delreply gm)");

        if (global.customAutoReplies[triggerWord]) {
            delete global.customAutoReplies[triggerWord];
            await client.sendMessage(m.jid, { react: { text: "🗑️", key: m.key } });
            await m.reply(`🗑️ *'${triggerWord}' වචනය සාර්ථකව ඉවත් කළා මචං.*`);
        } else {
            await m.reply("❌ ඔය වචනය ලිස්ට් එකේ නැහැ මචං.");
        }
    } catch (err) {
        console.log("Del reply error:", err);
    }
});

