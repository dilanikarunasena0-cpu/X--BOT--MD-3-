const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// simple memory store (per chat)
const sessions = {};

Sparky(
  {
    name: "tt",
    fromMe: isPublic,
    category: "downloader",
    desc: "TikTok downloader with number-based HD/SD selection",
  },
  async ({ m, client, args }) => {
    const text = args.trim();

    const isAudioCmd =
      m.body?.startsWith(".ttaudio");

    // 🎧 AUDIO DIRECT MODE
    if (isAudioCmd) {
      const url = text.match(/(https?:\/\/[^\s]+)/g)?.[0];

      if (!url) {
        return client.sendMessage(
          m.jid,
          { text: "❌ Usage: .ttaudio <url>" },
          { quoted: m }
        );
      }

      const { data } = await axios.get(
        "https://api.zanta-mini.store/api/tiktok",
        {
          params: {
            apiKey: "zanta_6xeM2XzKaDSDKLwRhOP85mYv",
            url,
          },
          httpsAgent,
        }
      );

      const res = data?.result || data?.data;
      const audioUrl = res?.play || res?.url;

      return client.sendMessage(
        m.jid,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
        },
        { quoted: m }
      );
    }

    // 🔥 STEP 1: URL INPUT
    const url = text.match(/(https?:\/\/[^\s]+)/g)?.[0];

    if (!url) {
      return client.sendMessage(
        m.jid,
        { text: "❌ Usage: .tt <url>" },
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
        }
      );

      const res = data?.result || data?.data;

      if (!res) throw new Error("No data found");

      const options = [
        { id: "1", label: "SD Quality", url: res.play || res.url },
        { id: "2", label: "HD Quality", url: res.hdplay || res.play || res.url },
        { id: "3", label: "Audio Only", url: res.play || res.url },
      ];

      // save session
      sessions[m.jid] = {
        url,
        options,
        res,
      };

      const msgText = `
🎬 *TikTok Downloader*

Reply with number to download:

1️⃣ SD Quality
2️⃣ HD Quality
3️⃣ Audio Only

👤 @${res.author?.unique_id || "unknown"}
📝 ${res.author?.nickname || "unknown"}

Type number (1/2/3)
`;

      await client.sendMessage(
        m.jid,
        { text: msgText },
        { quoted: m }
      );

      await m.react("📩");

    } catch (error) {
      await m.react("❌");
      return client.sendMessage(
        m.jid,
        { text: `❌ Error: ${error.message}` },
        { quoted: m }
      );
    }
  }
);

// 🔥 SECOND HANDLER (number reply)
Sparky(
  {
    name: "tt-select",
    fromMe: isPublic,
    category: "downloader",
    desc: "Handles TikTok selection",
  },
  async ({ m, client }) => {
    const session = sessions[m.jid];
    const choice = m.body?.trim();

    if (!session || !["1", "2", "3"].includes(choice)) return;

    const selected = session.options.find((o) => o.id === choice);
    if (!selected) return;

    await m.react("⬇️");

    if (choice === "3") {
      return client.sendMessage(
        m.jid,
        {
          audio: { url: selected.url },
          mimetype: "audio/mpeg",
        },
        { quoted: m }
      );
    }

    const stream = await axios.get(selected.url, {
      responseType: "arraybuffer",
      httpsAgent,
    });

    const buffer = Buffer.from(stream.data);
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);

    const caption = `
🎬 *TikTok Downloaded*
🎚 Option : ${selected.label}
📦 Size : ${sizeMB} MB
`;

    await client.sendMessage(
      m.jid,
      {
        video: buffer,
        caption,
      },
      { quoted: m }
    );

    await m.react("✅");

    delete sessions[m.jid];
  }
);
