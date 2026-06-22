const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

global.modapk_sessions = global.modapk_sessions || {};

// URL එකක් කෙටි කරගැනීම සඳහා වන සරල Function එකක්
async function shortUrl(longUrl) {
    try {
        const res = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
        return res.data.shorturl || longUrl;
    } catch {
        return longUrl; // මොකක් හරි අවුලක් වුනොත් ඔරිජිනල් ලින්ක් එකම දෙනවා
    }
}

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
        // APK එක ලබාගන්නා කොටස (.modapk file <number>)
        // -------------------------------------------------------------
        if (inputQuery.toLowerCase().startsWith("file")) {
            const numIndex = parseInt(inputQuery.replace(/file/i, "").trim()) - 1;
            const session = global.modapk_sessions[m.sender];

            if (!session || !session.links || !session.links[numIndex]) {
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply("❌ කරුණාකර ප්‍රථමයෙන් ඇප් එකක් සර්ච් කර ලබාගත් ලැයිස්තුවේ ඇති වලංගು අංකයක් ලබාදෙන්න.");
            }

            const selectedApp = session.links[numIndex];
            const targetUrl = selectedApp.link || selectedApp.url || selectedApp.download_link;

            if (!targetUrl) {
                await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
                return await m.reply("❌ මෙම ඇප් එක සඳහා බාගත කිරීමේ මූලාශ්‍ර ලින්ක් එකක් සොයාගත නොහැකි විය.");
            }

            // ඔයාගේ API ඩවුන්ලෝඩ් එන්ඩ්පොයින්ට් එක
            const downloadApiUrl = `https://api.zanta-mini.store/api/modapk/dl?apiKey=${apiKey}&url=${encodeURIComponent(targetUrl)}`;

            await client.sendMessage(m.jid, { react: { text: "🔗", key: m.key } });
            await m.reply(`⏳ *ඔබ තෝරාගත් "${selectedApp.title || 'App'}" සඳහා සෘජු බාගත කිරීමේ කෙටි ලින්ක් එකක් සකසමින් පවතී...*`);

            // [BEST FIX] - සර්වර් එක ක්‍රෑෂ් කරගන්නේ නැතුව, ලින්ක් එක කෙටි කරලා යූසර්ට දෙනවා කෙලින්ම බාගන්න
            const shortDownloadLink = await shortUrl(downloadApiUrl);

            const downloadSuccessMsg = `
📦 *${selectedApp.title || 'Mod App'}* Mod APK

ℹ️ *Size:* ${selectedApp.size || 'N/A'}
📌 *Version:* ${selectedApp.version || 'N/A'}

🚀 *සර්වර් බාධාවන් මඟහැරීම සඳහා ඔබගේ සෘජු බාගත කිරීමේ ලින්ක් එක සූදානම් කර ඇත!* 

👇 *පහත ලින්ක් එක එක පාරක් ක්ලික් කර බ්‍රවුසර් එක හරහා ඉතාම වේගයෙන් APK එක ඩවුන්ලෝඩ් කරගන්න:*
🔗 ${shortDownloadLink}

> Powered by ${botName}
`;
            
            await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
            return await m.reply(downloadSuccessMsg);
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
            return await m.reply(`❌ *කණගාටුයි, එම නමින් කිසිදු Mod APK එකක් සොයාගැනීමට නොහැකි විය.*`);
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
            if (apk.version) apkText += `📌 *Version:* ${apk.version}\n`;
            apkText += `📥 *Download Command:* \`\`\`${prefix}modapk file ${i + 1}\`\`\`\n\n`;
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

*💡 බාගත කරගන්නේ කෙසේද?*
ඉහත ලැයිස්තුවේ ඔබට අවශ්‍ය ඇප් එකට යටින් ඇති \`📥 Download Command\` එක (උදා: \`${prefix}modapk file 1\`) ක්ලික් කර Copy කරගෙන චැට් එකට යවන්න (Send කරන්න).

• _*ඔබගේ සේවාව සදහා X KADIYA MD සැමවිටම සූදානම්.❤️‍🩹*_
`;

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });
        await m.reply(status);

    } catch (err) {
        console.error("❌ ModAPK Error:", err);
        try { await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } }); } catch {}
        await m.reply("❌ *Mod APK සෙවීමේදී දෝෂයක් ඇතිවිය:* " + err.message);
    }
});
