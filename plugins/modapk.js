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
    desc: "ඕනෑම ඇන්ඩ්‍රොයිඩ් ක්‍රීඩාවක හෝ ඇප් එකක Mod APK සංස්කරණ සොයා ගැනීම සහ බාගත කිරීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "X-KADIYA-MD";
        const prefix = m.prefix || ".";
        const apiKey = 'zan_w8lSd1pK_t79f2pa52p';
        
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
            
            // සර්ච් ප්‍රතිඵල වලින් ලැබෙන මූලාශ්‍ර පිටුවේ ලින්ක් එක (e.g. an1.com link)
            const targetUrl = selectedApp.link || selectedApp.url || selectedApp.download_link;

            if (!targetUrl) {
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply("❌ මෙම ඇප් එක සඳහා බාගත කිරීමේ මූලාශ්‍ර ලින්ක් එකක් සොයාගත නොහැකි විය.");
            }

            // ඔයා ලබාදුන් ආකාරයට API Endpoint එකට target URL එක එකතු කර සම්පූර්ණ Download URL එක සෑදීම
            const downloadApiUrl = `https://api.zanta-mini.store/api/modapk/dl?apiKey=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

            await client.sendMessage(m.jid, { react: { text: "📥", key: m.key } });
            await m.reply(`⏳ *ඔබ තෝරාගත් "${selectedApp.title || 'App'}" APK ෆයිල් එක WhatsApp වෙත අප්ලෝඩ් වෙමින් පවතී. කරුණාකර රැඳී සිටින්න...*`);

            try {
                // කිසිදු අමතර API Request එකක් නැතුව, කෙලින්ම API Download ලින්ක් එක WhatsApp document එකට ලබාදීම
                await client.sendMessage(m.jid, {
                    document: { url: downloadApiUrl },
                    mimetype: 'application/vnd.android.package-archive',
                    fileName: `${(selectedApp.title || "ModApp").replace(/[^a-zA-Z0-9]/g, "_")}_X_KADIYA.apk`,
                    caption: `📦 *${selectedApp.title || 'Mod App'}* Mod APK\n\n> Powered by ${botName}`
                }, { quoted: m });
                
                await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
                return;
            } catch (dlErr) {
                console.error("Direct APK download error:", dlErr.message);
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply(`❌ *WhatsApp හරහා ෆයිල් එක එවීමට නොහැකි විය!* (සර්වර් බාධාවක් හෝ ෆයිල් එක WhatsApp සීමාවට වඩා විශාල විය හැක).\n\n🔗 *නමුත් ඔබට මෙම ලින්ක් එකෙන් කෙලින්ම බාගත කරගත හැක:*\n${downloadApiUrl}`);
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

        const apiUrl = `https://api.zanta-mini.store/api/modapk/search?apiKey=${apiKey}&url=${encodeURIComponent(inputQuery)}`;

        const response = await axios.get(apiUrl);
        const resData = response.data;

        let results = [];
        if (Array.isArray(resData)) {
            results = resData;
        } else if (resData && Array.isArray(resData.results)) {
            results = resData.results;
        } else if (resData && resData.result && Array.isArray(resData.result)) {
            results = resData.result;
        }

        if (results.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply(`❌ *කණගාටුයි, එම නමින් කිසිදු Mod APK එකක් සොයාගැනීමට නොහැකි විය.*\n\n*Debug Info:* ${typeof resData === 'object' ? JSON.stringify(resData) : resData}`);
        }

        global.modapk_sessions[m.sender] = {
            query: inputQuery,
            links: results
        };

        let apkText = "";
        const maxResults = Math.min(results.length, 5);

        for (let i = 0; i < maxResults; i++) {
            const apk = results[i];
            apkText += `📍 *${i + 1}. ${apk.title || apk.name || "Unknown App"}*\n`;
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
        // Interactive Quick Reply Filter
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
            }, 60000);
        });

        if (!replyMsg) return;

        const replyText = (replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text || "").trim();

        if (!isNaN(replyText)) {
            const fakeMsg = { ...replyMsg, message: { conversation: `${prefix}modapk file ${replyText}` } };
            client.ev.emit("messages.upsert", { messages: [fakeMsg], type: "notify" });
        }

    } catch (err) {
        console.error("❌ ModAPK Error:", err);
        try { await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } }); } catch {}
        await m.reply("❌ *Mod APK සෙවීමේදී දෝෂයක් ඇතිවිය:* " + err.message);
    }
});

