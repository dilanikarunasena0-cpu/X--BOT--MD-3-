const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

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
        
        if (matches && matches[1]) {
            return matches[1];
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
        
        let movieQuery = "";
        if (args) {
            movieQuery = Array.isArray(args) ? args.join(" ").trim() : args.toString().trim();
        }
        
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

        // 2. සොයාගත් ලින්ක් එක ඔයාගේ API එකට යැවීම
        const apiKey = 'zan_w8lSd1pK_t79f2pa52p'; 
        const apiUrl = `https://api.zanta-mini.store/api/sinhalasub/dl?apiKey=${apiKey}&text=${encodeURIComponent(targetUrl)}`;

        const response = await axios.get(apiUrl);
        const resData = response.data;

        // API එක සාර්ථක නැත්නම් හෝ ලින්ක්ස් නැත්නම්
        if (!resData || !resData.success || !resData.results || !resData.results.links) {
            return await m.reply("❌ කණගාටුයි, මෙම චිත්‍රපටයට අදාළ ඩවුන්ලෝඩ් ලින්ක්ස් ලබාගැනීමට නොහැකි විය.");
        }

        const results = resData.results;
        const linksArray = results.links;

        // ෆිල්ම් එකේ නම පෝස්ට් ලින්ක් එකෙන් වෙන් කරගැනීම
        const displayTitle = targetUrl.split("/movies/")[1]?.replace(/-/g, " ").replace(/\//g, "").toUpperCase() || movieQuery.toUpperCase();
        
        // API එකෙන් එන Thumbnail එක පාවිච්චි කිරීම (නැත්නම් default එකක්)
        const imagePoster = results.thumbnail ? results.thumbnail.trim() : "https://res.cloudinary.com/dqlh378fb/image/upload/v1780800370/zanta_media_uploads/y2qrw8srsw1v4dsu5wxv.jpg";

        // 3. ලින්ක්ස් ටික ලස්සනට පෙළගැස්වීම
        let linksText = "";
        linksArray.forEach((link, index) => {
            linksText += `📍 *${index + 1}. ${link.quality} (${link.size})*\n🔗 ${link.direct_link}\n\n`;
        });

        // 4. මැසේජ් එක සැකසීම
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
1️⃣ .menu (ප්‍රධාන මෙනුවට යාමට)

• ඔබගේ සේවාව සදහා X KADIYA MD සැමවිටම සූදානම්.❤️‍🩹
`;

        // මැසේජ් එක සෙන්ඩ් කිරීම (චිත්‍රපටයේ Poster එක සමඟ)
        await client.sendMessage(m.jid, {
            image: {
                url: imagePoster
            },
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true
            }
        }, { quoted: m });

        // 5. Interactive Reply Filter (.menu සඳහා පමණි)
        const filter = (msg) => {
            if (!msg?.message) return false;
            if (msg.key.remoteJid !== m.jid) return false;
            if (msg.key.fromMe) return false;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            return ["1"].includes(text.trim());
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
        }

    } catch (err) {
        console.error("❌ Sinhalasub cmd error:", err);
        await m.reply("❌ Download command එකේ දෝෂයක්: " + err.message);
    }
});

