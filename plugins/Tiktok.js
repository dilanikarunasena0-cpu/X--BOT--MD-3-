const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

Sparky(
  {
    name: "tt",
    fromMe: isPublic,
    category: "downloader",
    desc: "TikTok downloader (HD only)",
  },
  async ({ m, client, args }) => {
    const text = args.trim();

    const url = text.match(/(https?:\/\/[^\s]+)/g)?.[0];

    if (!url) {
      return client.sendMessage(
        m.jid,
        { text: "❌ Usage: .tt <tiktok url>" },
        { quoted: m }
      );
    }

    const tiktokRegex = /(tiktok\.com|vt\.tiktok\.com)/;
    if (!tiktokRegex.test(url)) {
      return client.sendMessage(
        m.jid,
        { text: "❌ Invalid TikTok URL" },
        { quoted: m }
      );
    }

    await m.react("⏳");

    try {
      const { data } = await axios.get(
        "https://api.zanta-mini.store/api/tiktok",
        {
          params: {
            apiKey: "zanta_6xeM2XzKaDSDKLwRhOP85mYv",
            url,
          },
          httpsAgent,
          timeout: 15000,
        }
      );

      const res = data?.result || data?.data;

      if (!res) throw new Error("No video found");

      // 🎯 ALWAYS HD FIRST
      const videoUrl = res.hdplay || res.play || res.url;

      if (!videoUrl) throw new Error("Video URL not found");

      await m.react("⬇️");

      const stream = await axios.get(videoUrl, {
        responseType: "arraybuffer",
        httpsAgent,
        timeout: 20000,
      });

      const buffer = Buffer.from(stream.data);
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

      const caption = `
🎬 *TikTok Downloader (HD)*

👤 User : @${res.author?.unique_id || "unknown"}
📝 Name : ${res.author?.nickname || "unknown"}

🎚 Quality : HD
⏱ Duration : ${res.duration || 0}s
📦 Size : ${sizeMB} MB

❤️ Likes : ${res.like_count || 0}
💬 Comments : ${res.comment_count || 0}
👀 Views : ${res.play_count || 0}

📥 Downloaded Successfully
`;

      // 16MB limit check
      if (buffer.length > 16 * 1024 * 1024) {
        await client.sendMessage(
          m.jid,
          {
            document: buffer,
            mimetype: "video/mp4",
            fileName: `tiktok_hd_${Date.now()}.mp4`,
            caption,
          },
          { quoted: m }
        );
      } else {
        await client.sendMessage(
          m.jid,
          {
            video: buffer,
            caption,
          },
          { quoted: m }
        );
      }

      await m.react("✅");
    } catch (error) {
      await m.react("❌");
      console.error("TikTok error:", error);

      await client.sendMessage(
        m.jid,
        {
          text: `❌ Error: ${error.message}`,
        },
        { quoted: m }
      );
    }
  }
);
