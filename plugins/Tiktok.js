const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

const extractUrl = (text = "") => {
  const match = text.match(/https?:\/\/[^\s]+/g);
  return match ? match[0] : null;
};

const isTikTokUrl = (url = "") =>
  /(tiktok\.com|vt\.tiktok\.com)/i.test(url);

Sparky(
  {
    name: "tt",
    fromMe: isPublic,
    category: "downloader",
    desc: "TikTok Downloader",
  },
  async ({ m, client, args }) => {
    try {
      if (!args)
        return client.sendMessage(
          m.jid,
          { text: "❌ Usage: .tt <tiktok url>" },
          { quoted: m }
        );

      const tiktokUrl = extractUrl(args);

      if (!tiktokUrl || !isTikTokUrl(tiktokUrl))
        return client.sendMessage(
          m.jid,
          { text: "❌ Invalid TikTok URL" },
          { quoted: m }
        );

      await m.react("⏳");

      const { data } = await axios.get(
        `https://api.zanta-mini.store/api/tiktok?apiKey=zan_w8lSd1pK_x1macpjsac&url=${encodeURIComponent(
          tiktokUrl
        )}`
      );

      console.log(data);

      const result = data.result || data.data || data;

      const videoUrl =
        result?.video?.noWatermark ||
        result?.video?.watermark ||
        result?.play ||
        result?.download ||
        result?.url;

      if (!videoUrl)
        throw new Error("Video URL not found");

      await client.sendMessage(
        m.jid,
        {
          video: { url: videoUrl },
          caption: `🎬 TikTok Downloader\n\n✅ Downloaded Successfully`,
        },
        { quoted: m }
      );

      await m.react("✅");
    } catch (err) {
      console.error(err);
      await m.react("❌");

      return client.sendMessage(
        m.jid,
        {
          text: `❌ Error: ${err.message}`,
        },
        { quoted: m }
      );
    }
  }
);
