const axios = require("axios");

module.exports = {
  name: "tiktok",

  async execute(sock, msg, args) {
    try {
      const input = args[0];
      const option = (args[1] || "").toLowerCase();

      if (!input) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "Usage:\n.tiktok <url> [hd/sd]\n.tikaudio <url>" }
        );
      }

      const isAudio =
        msg.message.conversation?.startsWith(".tikaudio") ||
        msg.message.extendedTextMessage?.text?.startsWith(".tikaudio");

      // API request
      const { data } = await axios.get(
        "https://api.zanta-mini.store/api/tiktok",
        {
          params: {
            apiKey: "zanta_6xeM2XzKaDSDKLwRhOP85mYv",
            url: input
          }
        }
      );

      const res = data?.result || data?.data;

      if (!res) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "No data found from API." }
        );
      }

      const sdUrl = res.play || res.url;
      const hdUrl = res.hdplay || res.play || res.url;

      // 🎧 AUDIO MODE
      if (isAudio) {
        return await sock.sendMessage(
          msg.key.remoteJid,
          {
            audio: { url: sdUrl },
            mimetype: "audio/mpeg"
          },
          { quoted: msg }
        );
      }

      // 🎯 QUALITY SELECTOR
      let videoUrl = sdUrl; // default SD

      if (option === "hd") {
        videoUrl = hdUrl;
      } else if (option === "sd" || option === "") {
        videoUrl = sdUrl;
      }

      const caption = `
🎬 *TikTok Downloader*

👤 User : @${res.author?.unique_id || "unknown"}
📝 Name : ${res.author?.nickname || "unknown"}

🎚 Quality : ${option === "hd" ? "HD" : "SD"}

⏱ Duration : ${res.duration || 0}s
❤️ Likes : ${res.like_count || res.digg_count || 0}
💬 Comments : ${res.comment_count || 0}
👀 Views : ${res.play_count || 0}

📥 Downloaded Successfully
`;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          video: { url: videoUrl },
          caption
        },
        { quoted: msg }
      );

    } catch (e) {
      console.error(e);

      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Download failed. Please try again later." }
      );
    }
  }
};
