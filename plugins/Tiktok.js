const { Sparky } = require("../lib");
const axios = require("axios");

Sparky({
    name: "tiktok",
    alias: ["tt", "ttdl"],
    category: "download",
    desc: "Download TikTok videos"
},
async ({ client, m, args }) => {

    try {

        const url = args.join(" ").trim();

        if (!url) {
            return m.reply(
`📌 *TikTok Downloader*

Usage:
.tiktok <tiktok url>

Example:
.tiktok https://vt.tiktok.com/xxxxx/`
            );
        }

        await client.sendMessage(m.jid, {
            react: { text: "📥", key: m.key }
        });

        const { data } = await axios.post(
            "https://www.tikwm.com/api/",
            {
                url: url,
                hd: 1
            },
            {
                headers: {
                    "content-type": "application/json"
                }
            }
        );

        if (!data || !data.data) {
            return m.reply("❌ Failed to fetch TikTok video.");
        }

        const video = data.data.play;
        const title = data.data.title || "TikTok Video";
        const author = data.data.author?.nickname || "Unknown";
        const likes = data.data.digg_count || 0;
        const views = data.data.play_count || 0;

        await client.sendMessage(
            m.jid,
            {
                video: {
                    url: video
                },
                caption:
`🎬 *TikTok Downloader*

📝 Title: ${title}

👤 Author: ${author}

❤️ Likes: ${likes}
👁 Views: ${views}

✅ Downloaded Successfully`
            },
            { quoted: m }
        );

        await client.sendMessage(m.jid, {
            react: { text: "✅", key: m.key }
        });

    } catch (e) {

        console.error(e);

        await client.sendMessage(m.jid, {
            react: { text: "❌", key: m.key }
        });

        m.reply("❌ Error while downloading video.");
    }
});
