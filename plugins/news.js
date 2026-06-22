// commands/news.js
const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const config = require("../config");

Sparky({
    name: "news",
    alias: ["පුවත්", "breaking", "n"],
    category: "news",
    fromMe: isPublic,
    desc: "ලංකාවේ අලුත්ම පුවත් ලබා ගැනීම"
}, async ({ client, m, args }) => {
    try {
        const botName = config.BOT_INFO?.split(";")[0] || "SADEW-MINI";
        const prefix = m.prefix || ".";

        // Loader එකක් යැවීම
        await client.sendMessage(m.jid, { text: "📥 අලුත්ම පුවත් සේවාදායකයෙන් ලබාගනිමින් පවතී..." }, { quoted: m });

        // 403 බ්ලොක් නොවන public ස්ථාවර News API එකක් බාවිතා කිරීම
        const response = await axios.get("https://news-api-lk.vercel.app/news/adaderana", {
            timeout: 10000,
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        // API එකෙන් එන news array එක තෝරා ගැනීම
        const newsData = response.data?.news || response.data?.articles || response.data;

        if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {
            return await m.reply("❌ මේ වෙලාවේ පුවත් ලබාගැනීමට නොහැකි විය. පසුව උත්සාහ කරන්න.");
        }

        // මුල්ම පුවත් 5ක් පමණක් වෙන් කරගැනීම
        const topNews = newsData.slice(0, 5);
        
        let menuStatus = `
╭───────────────◉
│ *📰 ${botName} NEWS HUB*
├───────────────◉
│✨ ලංකාවේ අලුත්ම පුවත් සිරස්තල
├───────────────◉\n`;

        topNews.forEach((item, index) => {
            const title = item.title || item.heading || "පුවත් සිරස්තලය ලබාගත නොහැක";
            menuStatus += `│ *${index + 1}️⃣ ${title.trim()}*\n`;
        });

        menuStatus += `
╰────────────────◉
> ${botName} WhatsApp Bot

*Reply with (1 - 5):*
ඔබට සම්පූර්ණ විස්තරය කියවීමට අවශ්‍ය පුවතේ අංකය (1 සිට 5 දක්වා) Reply කරන්න. 🧧
`;

        // ප්‍රධාන නිවුස් ලැයිස්තුව ඇලර්ට් එකක් ලෙස යැවීම
        await client.sendMessage(m.jid, {
            image: {
                url: "https://res.cloudinary.com/dqlh378fb/image/upload/v1780800370/zanta_media_uploads/y2qrw8srsw1v4dsu5wxv.jpg"
            },
            caption: menuStatus,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 1000,
                isForwarded: true
            }
        }, { quoted: m });

        // User ගෙන් ලැබෙන Reply එක Filter කිරීම
        const filter = (msg) => {
            if (!msg?.message) return false;
            if (msg.key.remoteJid !== m.jid) return false;
            if (msg.key.fromMe) return false;

            const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            return ["1", "2", "3", "4", "5"].includes(text.trim());
        };

        // User ගේ ප්‍රතිචාරය සඳහා තත්පර 45ක් රැක සිටීම
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
            }, 45000); 
        });

        if (!replyMsg) return;

        const selectedIndex = parseInt((
            replyMsg.message.conversation ||
            replyMsg.message.extendedTextMessage?.text ||
            ""
        ).trim()) - 1;

        const selectedNews = topNews[selectedIndex];
        const newsTitle = selectedNews.title || selectedNews.heading || "";
        const newsDescription = selectedNews.description || selectedNews.paragraph || selectedNews.desc || selectedNews.content || "සම්පූර්ණ විස්තරය ලබාගත නොහැක.";
        const newsLink = selectedNews.link || selectedNews.url || `http://sinhala.adaderana.lk`;

        // තෝරාගත් නිවුස් එකේ සම්පූර්ණ විස්තරය සකස් කිරීම
        const detailedReport = `
📰 *${newsTitle.trim()}*

${newsDescription.trim()}

🔗 *සම්පූර්ණ පුවත කියවන්න ලින්ක් එක:*
${newsLink}

_Generated by ${botName} News Service_
`;

        // සම්පූර්ණ පුවත යැවීම
        await client.sendMessage(m.jid, {
            text: detailedReport,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true
            }
        }, { quoted: replyMsg });

    } catch (err) {
        console.error("❌ News cmd error:", err);
        await m.reply("❌ News command එකේ දෝෂයක්: " + err.message);
    }
});

