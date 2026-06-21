const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

// සයිට් එකෙන් ෆิල්ම් එක සර්ච් කරලා පළමු ලින්ක් එක ගන්නා ශ්‍රිතය
async function searchSinhalaSub(movieName) {
    try {
        // WordPress සර්ච් URL එක
        const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(movieName)}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = response.data;
        
        // HTML එකෙන් පළවෙනිම ෆිල්ම් පෝස්ට් එකේ ලින්ක් එක වෙන් කරගැනීම (Regex භාවිතයෙන්)
        const matches = html.match(/href="(https:\/\/sinhalasub\.lk\/movies\/[^"]+)"/);
        
        if (matches && matches[1]) {
            return matches[1]; // පළමු ලින්ක් එක රිටර්න් කරයි
        }
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
    desc: "Sinhalasub.lk වෙබ් අඩවියෙන් නම මගින් චිත්‍රපට සහ උපසිරැසි ලබාගැනීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "SADEW-MINI";
        const prefix = m.prefix || ".";
        
        // දෝෂය නිවැරදි කිරීම: args කියන්නේ array එකක්ද string එකක්ද කියලා බලලා text එක වෙන් කරගැනීම
        let movieQuery = "";
        if (args) {
            movieQuery = Array.isArray(args) ? args.join(" ").trim() : args.toString().trim();
        }
        
        // මැසේජ් එකක් reply කරලා තිබ්බොත් ඒකෙ text එක ගන්න
        if (!movieQuery && m.quoted && m.quoted.text) movieQuery = m.quoted.text.trim();
        
        if (!movieQuery) {
            return await m.reply(`*⚠️ කරුණාකර චිත්‍රපටයේ නම ලබාදෙන්න!*\n\n*භාවිතය:* \n${prefix}sinhalasub kishkindha kaandam`);
        }

        await m.reply(`🔍 *"${movieQuery}" චිත්‍රපටය Sinhalasub හි සොයමින් පවතිනවා... කරුණාකර රැඳී සිටින්න.*`);

        // 1. සයිට් එකෙන් ලින්ක් එක සර්ච් කරලා සොයාගැනීම
        let targetUrl = movieQuery;
        if (!movieQuery.startsWith("https://sinhalasub.lk/")) {
            targetUrl = await searchSinhalaSub(movieQuery);
        }

        if (!targetUrl) {
            return await m.reply("❌ කණගාටුයි, එම නමින් චිත්‍රපටයක් සොයාගැනීමට නොහැකි විය. කරුණාකර නම නිවැරදිව type කරන්න.");
        }

        // 2. සොයාගත් ලින්ක් එක ඔයාගේ API එකට යවා බයිපාස් ලින්ක් එක ලබාගැනීම
        const apiKey = 'zan_w8lSd1pK_t79f2pa52p'; // ඔයාගේ API Key එක
        const apiUrl = `https://api.zanta-mini.store/api/sinhalasub/dl?apiKey=${apiKey}&text=${encodeURIComponent(targetUrl)}`;

        const response = await axios.get(apiUrl);
        let downloadLink = response.data;

        if (typeof downloadLink === 'object' && downloadLink.result) {
            downloadLink = downloadLink.result;
        }

        if (!downloadLink || !downloadLink.toString().startsWith('http')) {
            return await m.reply("❌ කණගාටුයි, මෙම චිත්‍රපටයට අදාළ ඩවුන්ලෝඩ් ලින්ක් එක ලබාගැනීමට නොහැකි විය.");
        }

        // ෆිල්ම් එකේ නම පෝස්ට් ලින්ක් එකෙන් ලස්සනට වෙන් කරගැනීම
        const displayTitle = targetUrl.split("/movies/")[1]?.replace(/-/g, " ").replace(/\//g, "").toUpperCase() || movieQuery.toUpperCase();

        // 3. මැසේජ් එක සැකසීම
        const status = `
╭───────────────◉
│ *🎬 SINHALASUB DOWNLOADER*
├───────────────◉
│✨ *Movie:* ${displayTitle}
│📥 Status: Link Generated!
│
│🔗 *Download Link:* ${downloadLink}
╰────────────────◉
> ${botName} WhatsApp Bot

*Reply with:*
1️⃣ .menu (ප්‍රධාන මෙනුවට යාමට)
2️⃣ Direct Link එක මැසේජ් එකක් ලෙස ලබාගැනීමට

• ඔබගේ සේවාව සදහා X KADIYA MD සැමවිටම සූදානම්.❤️‍🩹
`;

        // මැසේජ් එක සෙන්ඩ් කිරීම
        await client.sendMessage(m.jid, {
            image: {
                url: "https://res.cloudinary.com/dqlh378fb/image/upload/v1780800370/zanta_media_uploads/y2qrw8srsw1v4dsu5wxv.jpg"
            },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true
            }
        }, { quoted: m });

        // 4. Interactive Reply Filter
        const filter = (msg) => {
            if (!msg?.message) return false;
            if (msg.key.remoteJid !== m.jid) return false;
            if (msg.key.fromMe) return false;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            return ["1", "2"].includes(text.trim());
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
            }, 30000);
        });

        if (!replyMsg) return;

        const replyText = (
            replyMsg.message.conversation ||
            replyMsg.message.extendedTextMessage?.text ||
            ""
        ).trim();

        // 5. Reply එක අනුව ක්‍රියා කිරීම
        if (replyText === "1") {
            const fakeMsg = {
                ...replyMsg,
                message: {
                    conversation: `${prefix}menu`
                }
            };

            client.ev.emit("messages.upsert", {
                messages: [fakeMsg],
                type: "notify"
            });
        } else if (replyText === "2") {
            await client.sendMessage(m.jid, {
                text: `${downloadLink}`
            }, { quoted: m });
        }

    } catch (err) {
        console.error("❌ Sinhalasub cmd error:", err);
        await m.reply("❌ Download command එකේ දෝෂයක්: " + err.message);
    }
});
