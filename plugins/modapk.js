const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

// Global object එකක් මගින් තාවකාලිකව ජනනය වූ ලින්ක්ස් මතක තබා ගැනීම (Session Cache)
global.modapk_sessions = global.modapk_sessions || {};

Sparky({
    name: "modapk",
    alias: ["apkmod", "hackapk"],
    category: "download",
    fromMe: isPublic,
    desc: "ඕනෑම ඇන්ඩ්‍රොයිඩ් ක්‍රීඩාවක හෝ ඇප් එකක Mod APK (Hacked) සංස්කරණ සොයා ගැනීම සහ බාගත කිරීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "X-KADIYA-MD";
        const prefix = m.prefix || ".";
        
        let inputQuery = "";
        if (args) {
            inputQuery = Array.isArray(args) ? args.join(" ").trim() : args.toString().trim();
        }
        if (!inputQuery && m.quoted && m.quoted.text) inputQuery = m.quoted.text.trim();

        // -------------------------------------------------------------
        // උප-විධානය (Sub-command) පරික්ෂාව: .modapk file <number>
        // -------------------------------------------------------------
        if (inputQuery.toLowerCase().startsWith("file")) {
            const numIndex = parseInt(inputQuery.replace(/file/i, "").trim()) - 1;
            const session = global.modapk_sessions[m.sender];

            if (!session || !session.links || !session.links[numIndex]) {
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply("❌ කරුණාකර ප්‍රථමයෙන් ඇප් එකක් සර්ච් කර ලබාගත් ලැයිස්තුවේ ඇති වලංගු අංකයක් ලබාදෙන්න.");
            }

            const selectedApp = session.links[numIndex];
            const dlLink = selectedApp.download_link || selectedApp.link;

            await client.sendMessage(m.jid, { react: { text: "📥", key: m.key } });
            await m.reply(`⏳ *ඔබ තෝරාගත් "${selectedApp.title}" APK ෆයිල් එක සර්වර් එකෙන් බාගත කරමින් පවතී. කරුණාකර රැඳී සිටින්න...*`);

            try {
                // APK ෆයිල් එක කෙලින්ම WhatsApp Document එකක් ලෙස යැවීම
                await client.sendMessage(m.jid, {
                    document: { url: dlLink },
                    mimetype: 'application/vnd.android.package-archive',
                    fileName: `${selectedApp.title.replace(/[^a-zA-Z0-9]/g, "_")}_X_KADIYA.apk`,
                    caption: `📦 *${selectedApp.title}* Mod APK\n\n> Powered by ${botName}`
                }, { quoted: m });
                
                await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
                return;
            } catch (dlErr) {
                console.error("Direct APK upload error:", dlErr.message);
                // ෆයිල් එක ලොකු වැඩි නම් හෝ සර්වර් බ්ලොක් එකක් නම් ඩිරෙක්ට් ලින්ක් එක දෙනවා
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply(`❌ *WhatsApp හරහා ෆයිල් එක එවීමට නොහැකි විය!* (ෆයිල් එක WhatsApp සීමාවට වඩා විශාල විය හැක).\n\n🔗 *නමුත් ඔබට මෙම ලින්ක් එකෙන් කෙලින්ම බාගත කරගත හැක:*\n${dlLink}`);
            }
        }

        // -------------------------------------------------------------
        // ප්‍රධාන සර්ච් ක්‍රියාවලිය (Main Search Logic)
        // -------------------------------------------------------------
        if (!inputQuery) {
            await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
            return await m.reply(`*⚠️ කරුණාකර ඇප් එකේ හෝ ගේම් එකේ නම ලබාදෙන්න!*\n\n*භාවිතය:* \n${prefix}modapk Hill Climb Racing`);
        }

        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });
        await m.reply(`🔍 *"${inputQuery}" සඳහා Mod APK සංස්කරණ සොයමින් පවතිනවා...*`);

        const apiKey = 'zan_w8lSd1pK_t79f2pa52p';
        const apiUrl = `https://api.zanta-mini.store/api/modapk/search?apiKey=${apiKey}&url=${encodeURIComponent(inputQuery)}`;

        const response = await axios.get(apiUrl);
        const resData = response.data;

        if (!resData || !resData.success || !resData.results || resData.results.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *කණගාටුයි, එම නමින් කිසිදු Mod APK එකක් සොයාගැනීමට නොහැකි විය.*");
        }

        const results = resData.results;
        
        // යූසර්ගේ Session එක සේව් කර ගැනීම (පසුව ඩවුන්ලෝඩ් කරගැනීම සඳහා)
        global.modapk_sessions[m.sender] = {
            query: inputQuery,
            links: results
        };

        let apkText = "";
        const maxResults = Math.min(results.length, 5);

        for (let i = 0; i < maxResults; i++) {
            const apk = results[i];
            apkText += `📍 *${i + 1}. ${apk.title || "Unknown App"}*\n`;
            if (apk.size) apkText += `ℹ️ *Size:* ${apk.size} | `;
            if (apk.version) apkText += `📌 *Version:* ${apk.version}`;
            apkText += `\n\n`;
        }

        const status = `
╭───────────────◉
│ *🤖 MOD APK DOWNLOADER*
├───────────────◉
│✨ *Search:* ${inputQuery.toUpperCase()}
│📥 *Status:* Premium Mod Links Found!
╰────────────────◉

*📥 AVAILABLE MOD LIST:*
${apkText}
> ${botName} WhatsApp Bot

*Reply with:*
🔢 වලංගු ඇප් අංකය (උදා: 1) - APK එක කෙලින්ම ලබාගැනීමට.

• _*ඔබගේ සේවාව සදහා X KADIYA MD සැමවිටම සූදානම්.❤️‍🩹*_
`;

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
        await m.reply(status);

        // -------------------------------------------------------------
        // Interactive Quick Reply Filter (අංකය විතරක් ගැහුවොත් වැඩ කරන කොටස)
        // -------------------------------------------------------------
        const filter = (msg) => {
            if (!msg?.message) return false;
            if (msg.key.remoteJid !== m.jid) return false;
            if (msg.key.fromMe) return false;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            return (!isNaN(text) && parseInt(text) > 0 && parseInt(text) <= maxResults);
        };

        const replyMsg = await new Promise((resolve) => {
            const handler = (chatUpdate) => {
                const msg = chatUpdate.messages?.[0];
                if (filter(msg)) {
                    client.ev.off("messages.upsert", handler);
                    resolve(msg);
                }
            };
            client.ev.on("messages.upsert", handler);
            setTimeout(() => {
                client.ev.off("messages.upsert", handler);
                resolve(null);
            }, 60000); // තත්පර 60ක් වලංගුයි
        });

        if (!replyMsg) return;

        const replyText = (replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text || "").trim();

        if (!isNaN(replyText)) {
            // අංකය විතරක් ගැහුවොත්, .modapk file <num> ලෙස විධානය පසුබිමෙන් ක්‍රියාත්මක කරයි
            const fakeMsg = { ...replyMsg, message: { conversation: `${prefix}modapk file ${replyText}` } };
            client.ev.emit("messages.upsert", { messages: [fakeMsg], type: "notify" });
        }

    } catch (err) {
        console.error("❌ ModAPK Error:", err);
        try { await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } }); } catch {}
        await m.reply("❌ *Mod APK සෙවීමේදී දෝෂයක් ඇතිවිය:* " + err.message);
    }
});
