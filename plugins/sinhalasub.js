const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

// Global object එකක් මගින් තාවකාලිකව ජනනය වූ ලින්ක්ස් මතක තබා ගැනීම (Session Cache)
global.sinhalasub_sessions = global.sinhalasub_sessions || {};

// සයිට් එකෙන් ෆිල්ම් එක සර්ච් කරලා පළමු ලින්ක් එක ගන්නා ශ්‍රිතය
async function searchSinhalaSub(movieName) {
    try {
        const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(movieName)}`;
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const html = response.data;
        const matches = html.match(/href="(https:\/\/sinhalasub\.lk\/movies\/[^"]+)"/);
        if (matches && matches[1]) return matches[1];
        return null;
    } catch (error) {
        console.error("Search Error:", error.message);
        return null;
    }
}

Sparky({
    name: "sinhalasub",
    alias: ["ssub", "dl", "movie"],
    category: "download",
    fromMe: isPublic,
    desc: "Sinhalasub.lk වෙබ් අඩවියෙන් චිත්‍රපට සහ උපසිරැසි ලබාගැනීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "SADEW-MINI";
        const prefix = m.prefix || ".";
        
        let inputQuery = "";
        if (args) {
            inputQuery = Array.isArray(args) ? args.join(" ").trim() : args.toString().trim();
        }
        if (!inputQuery && m.quoted && m.quoted.text) inputQuery = m.quoted.text.trim();

        // -------------------------------------------------------------
        // උප-විධානය (Sub-command) පරික්ෂාව: .sinhalasub download <number>
        // -------------------------------------------------------------
        if (inputQuery.toLowerCase().startsWith("download")) {
            const numIndex = parseInt(inputQuery.replace(/download/i, "").trim()) - 1;
            const session = global.sinhalasub_sessions[m.sender];

            if (!session || !session.links || !session.links[numIndex]) {
                return await m.reply("❌ කරුණාකර ප්‍රථමයෙන් චිත්‍රපටයක් සර්ච් කර ලබාගත් ලැයිස්තුවේ ඇති වලංගු අංකයක් ලබාදෙන්න.");
            }

            const selectedLink = session.links[numIndex];
            await m.reply(`⏳ *ඔබ තෝරාගත් "${selectedLink.quality} (${selectedLink.size})" ෆයිල් එක WhatsApp වෙත අප්ලෝඩ් කරමින් පවතී. කරුණාකර රැඳී සිටින්න...*`);

            try {
                // WhatsApp එකට වීඩියෝ/ඩොකියුමන්ට් එකක් ලෙස කෙලින්ම සෙන්ඩ් කිරීම
                await client.sendMessage(m.jid, {
                    document: { url: selectedLink.direct_link },
                    mimetype: 'video/mp4',
                    fileName: `${session.title || "Movie"}_${selectedLink.quality}_${selectedLink.size}.mp4`,
                    caption: `🎬 *${session.title}*\n🎯 Quality: ${selectedLink.quality} (${selectedLink.size})\n\n> Powered by ${botName}`
                }, { quoted: m });
                return;
            } catch (dlErr) {
                console.error("Direct download error:", dlErr.message);
                return await m.reply(`❌ WhatsApp හරහා ෆයිල් එක එවීමට නොහැකි විය. (විශාල ෆයිල් එකක් හෝ සර්වර් බාධාවක් විය හැක).\n\n🔗 කරුණාකර මෙම ලින්ක් එකෙන් කෙලින්ම බාගත කරගන්න:\n${selectedLink.direct_link}`);
            }
        }

        // -------------------------------------------------------------
        // ප්‍රධාන සර්ච් ක්‍රියාවලිය (Main Search Logic)
        // -------------------------------------------------------------
        if (!inputQuery) {
            return await m.reply(`*⚠️ කරුණාකර චිත්‍රපටයේ නම ලබාදෙන්න!*\n\n*භාවිතය:* \n${prefix}sinhalasub kishkindha kaandam`);
        }

        await m.reply(`🔍 *"${inputQuery}" චිත්‍රපටය Sinhalasub හි සොයමින් පවතිනවා... කරුණාකර රැඳී සිටින්න.*`);

        let targetUrl = inputQuery;
        if (!inputQuery.startsWith("https://sinhalasub.lk/")) {
            targetUrl = await searchSinhalaSub(inputQuery);
        }

        if (!targetUrl) {
            return await m.reply("❌ කණගාටුයි, එම නමින් චිත්‍රපටයක් සොයාගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව type කරන්න.");
        }

        const apiKey = 'zan_w8lSd1pK_t79f2pa52p'; 
        const apiUrl = `https://api.zanta-mini.store/api/sinhalasub/dl?apiKey=${apiKey}&text=${encodeURIComponent(targetUrl)}`;

        const response = await axios.get(apiUrl);
        const resData = response.data;

        if (!resData || !resData.success || !resData.results || !resData.results.links) {
            return await m.reply("❌ කණගාටුයි, මෙම චිත්‍රපටයට අදාළ ඩවුන්ලෝඩ් ලින්ක්ස් ලබාගැනීමට නොහැකි විය.");
        }

        const results = resData.results;
        const linksArray = results.links;
        const displayTitle = targetUrl.split("/movies/")[1]?.replace(/-/g, " ").replace(/\//g, "").toUpperCase() || inputQuery.toUpperCase();
        const imagePoster = results.thumbnail ? results.thumbnail.trim() : "https://res.cloudinary.com/dqlh378fb/image/upload/v1780800370/zanta_media_uploads/y2qrw8srsw1v4dsu5wxv.jpg";

        // යූසර්ගේ Session එක සේව් කර ගැනීම (පසුව ඩවුන්ලෝඩ් කරගැනීම සඳහා)
        global.sinhalasub_sessions[m.sender] = {
            title: displayTitle,
            links: linksArray
        };

        let linksText = "";
        linksArray.forEach((link, index) => {
            linksText += `📍 *${index + 1}. ${link.quality} (${link.size})*\n🔗 ${link.direct_link}\n\n`;
        });

        const status = `
╭───────────────◉
│ *🎬 SINHALASUB DOWNLOADER*
├───────────────◉
│✨ *Movie:* ${displayTitle}
│⭐ *Rating:* ${results.rating || "N/A"}
│📥 *Status:* Links Generated Successfully!
╰────────────────◉

*📥 DOWNLOAD LINKS:*
${linksText}
> ${botName} WhatsApp Bot

*Reply with:*
✅ _වලංගු ලින්ක් අංකය (උදා: 4) - ෆයිල් එක කෙලින්ම ලබාගැනීමට._

✅ _.menu (ප්‍රධාන මෙනුවට යාමට)_

• _*ඔබගේ සේවාව සදහා X KADIYA MD සැමවිටම සූදානම්.❤️‍🩹*_
`;

        await client.sendMessage(m.jid, {
            image: { url: imagePoster },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true
            }
        }, { quoted: m });

        // -------------------------------------------------------------
        // Interactive Quick Reply Filter (අංකය විතරක් ගැහුවොත් වැඩ කරන කොටස)
        // -------------------------------------------------------------
        const filter = (msg) => {
            if (!msg?.message) return false;
            if (msg.key.remoteJid !== m.jid) return false;
            if (msg.key.fromMe) return false;
            const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            // '1' (menu) හෝ ලින්ක්ස් ප්‍රමාණය ඇතුලත අංකයක්දැයි බැලීම
            return text === "1" || (!isNaN(text) && parseInt(text) > 0 && parseInt(text) <= linksArray.length);
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
            }, 60000); // කාලය තත්පර 60 දක්වා වැඩි කරන ලදී
        });

        if (!replyMsg) return;

        const replyText = (replyMsg.message.conversation || replyMsg.message.extendedTextMessage?.text || "").trim();

        if (replyText === "1") {
            const fakeMsg = { ...replyMsg, message: { conversation: `${prefix}menu` } };
            client.ev.emit("messages.upsert", { messages: [fakeMsg], type: "notify" });
        } else if (!isNaN(replyText)) {
            // අංකය විතරක් ගැහුවොත්, .sinhalasub download <num> ලෙස විධානය නැවත ක්‍රියාත්මක කිරීම
            const fakeMsg = { ...replyMsg, message: { conversation: `${prefix}sinhalasub download ${replyText}` } };
            client.ev.emit("messages.upsert", { messages: [fakeMsg], type: "notify" });
        }

    } catch (err) {
        console.error("❌ Sinhalasub cmd error:", err);
        await m.reply("❌ Download command එකේ දෝෂයක්: " + err.message);
    }
});

