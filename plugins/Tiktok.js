const { Sparky } = require("../lib");
const axios = require("axios");

Sparky({
    name: "tiktok",
    alias: ["tt", "ttdl", "ටිකටොක්"],
    category: "download",
    fromMe: false,
    desc: "TikTok වීඩියෝ ඩවුන්ලෝඩ් කිරීම"
}, async ({ client, m, args }) => {
    try {
        const input = Array.isArray(args) ? args.join(" ") : String(args || "");
        const url = input.trim();

        if (!url) {
            await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
            
            const helpMessage = `╭─────────────────────────╮
  ⚠️  *TikTok Downloader*
╰─────────────────────────╯

💡 *Please provide a valid TikTok video link!*
💡 *කරුණාකර නිවැරදි TikTok ලින්ක් එකක් ඇතුලත් කරන්න!*

──────────────
📌 *Usage / භාවිතය:*
  *.tiktok [tiktok_video_url]*

ℹ️ *Example / උදාහරණ:*
  • _.tiktok https://vm.tiktok.com/xxxxxx/_

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
            return await m.reply(helpMessage);
        }

        await client.sendMessage(m.jid, { react: { text: "📥", key: m.key } });

        const apiUrl = `https://free.churchless.to/v1/tiktok/video?url=${encodeURIComponent(url)}&api_key=Wxa_f_684dc23487`;
        
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.video_url) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *වීඩියෝව සෙවීමේදී දෝෂයක් සිදු විය. ලින්ක් එක නිවැරදිදැයි පරීක්ෂා කරන්න.*");
        }

        await client.sendMessage(m.jid, { react: { text: "🔄", key: m.key } });

        // API එකෙන් දත්ත ලැබෙන විදිහ අනුව සාමාන්‍යයෙන් ලයික්/වීව්ස් format කර ගැනීම
        const likes = data.likes || data.digg_count || data.statistics?.digg_count || "0";
        const views = data.views || data.play_count || data.statistics?.play_count || "0";
        const uploadDate = data.upload_date || data.create_time || "Unknown";

        const captionMessage = `╭─────────────────────────╮
  🎬  *TIKTOK DOWNLOADER*
╰─────────────────────────╯

  📝 *Title :* └── _${data.title || "TikTok Video"}_
  👤 *Author :* └── _${data.author || "Unknown"}_

──────────────
📊 *STATISTICS / විස්තර:*

  ❤️ *Likes :* └── _${likes}_
  👁️ *Views :* └── _${views}_
  📅 *Uploaded :* └── _${uploadDate}_

──────────────
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        await client.sendMessage(m.jid, { 
            video: { url: data.video_url }, 
            caption: captionMessage 
        }, { quoted: m });

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.log("TikTok download error:", err);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *වීඩියෝව බාගත කිරීමේදී පද්ධති දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.*");
    }
});
