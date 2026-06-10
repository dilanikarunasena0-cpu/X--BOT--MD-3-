const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// helper: extract URL
const extractUrl = (text = "") => {
  const match = text.match(/https?:\/\/[^\s]+/g);
  return match ? match[0] : null;
};

// helper: check TikTok URL
const isTikTokUrl = (url = "") =>
  /(tiktok\.com|vt\.tiktok\.com)/i.test(url);

// helper: format size
const formatSize = (bytes) =>
  (bytes / (1024 * 1024)).toFixed(2);

Sparky(
  {
    name: "tt",
    fromMe: isPublic,
    category: "downloader",
    desc: "Download TikTok videos using Zanta API",
  },
  async ({ m, client, args }) => {
    try {
      if (!args?.trim()) {
        return client.sendMessage(
          m.jid,
          { text: "❌ *Usage:* `.tt <TikTok URL>`" },
          { quoted: m }
        );
      }

      const tiktokUrl = extractUrl(args);

      if (!tiktokUrl || !isTikTokUrl(tiktokUrl)) {
        return client.sendMessage(
          m.jid,
          { text: "❌ *Please provide a valid TikTok URL.*" },
          { quoted: m }
        );
      }

      await m.react("⏳");

      // 🔑 ඔයාගේ API Key එක කෙලින්ම URL එක ඇතුලටම දාලා තියෙන්නේ මෙතනට:
      let response;
      try {
        response = await axios.get(`https://api.lolhuman.xyz/api/tiktok?apikey=zanta_6xeM2XzKaDSDKLwRhOP85mYv&url=${encodeURIComponent(tiktokUrl)}`, {
          httpsAgent,
          timeout: 15000,
        });
      } catch (err) {
        throw new Error("TikTok API request failed. Check your API key or limit.");
      }

      const result = response?.data?.result;

      if (!result) {
        throw new Error("No video data found. API might be down or key expired.");
      }

      const videoUrl = result.link || result.no_watermark || result.watermark;

      if (!videoUrl) {
        throw new Error("No downloadable video URL found.");
      }

      const quality = result.no_watermark || result.link
        ? "High Quality (No Watermark) ✅"
        : "Normal Quality ⚠️";

      const title = result.title || "Untitled TikTok";

      await m.react("⬇️");

      // download video
      const videoStream = await axios.get(videoUrl, {
        httpsAgent,
        responseType: "arraybuffer",
        timeout: 20000,
      });

      const videoBuffer = Buffer.from(videoStream.data);
      const sizeMB = formatSize(videoBuffer.length);

      const caption = `
🎬 *TikTok Downloader*

📝 *Title:* ${title}
✨ *Quality:* ${quality}
📦 *Size:* ${sizeMB} MB

🤖 _Downloaded via ❖Ƭʜะ 𝐗-𝐊𝐀registered𝐈𝐘𝐀-𝐌𝐃 💎_
      `.trim();

      const payload =
        videoBuffer.length > 16 * 1024 * 1024
          ? {
              document: videoBuffer,
              mimetype: "video/mp4",
              fileName: `tiktok_${Date.now()}.mp4`,
              caption,
            }
          : {
              video: videoBuffer,
              caption,
            };

      await client.sendMessage(m.jid, payload, { quoted: m });

      await m.react("✅");
    } catch (error) {
      console.error("TikTok downloader error:", error);

      await m.react("❌");

      const msg = error.message?.includes("timeout")
        ? "❌ Server timeout. Please try again."
        : `❌ Error: ${error.message || "Unknown error"}`;

      return client.sendMessage(
        m.jid,
        { text: msg },
        { quoted: m }
      );
    }
  }
);

