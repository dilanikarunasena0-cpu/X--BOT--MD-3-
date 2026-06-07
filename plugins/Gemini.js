const axios = require("axios");

const API_BASE = "https://ai-proxy-server-smoky.vercel.app";

module.exports = {
name: "gemini",

onMessage: async (conn, msg) => {
try {
if (!msg.message || msg.key.fromMe) return;

  const from = msg.key.remoteJid;

  const text =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    "";

  if (!text.startsWith(".gemini")) return;

  const query = text.slice(7).trim();

  if (!query) {
    return await conn.sendMessage(from, {
      text: "❌ Provide a query or prompt."
    });
  }

  const res = await axios.post(`${API_BASE}/gemini`, {
    query
  });

  await conn.sendMessage(
    from,
    {
      text: res.data?.answer || "❌ No response"
    },
    {
      quoted: msg
    }
  );

} catch (err) {
  console.error("Gemini Error:", err.message);

  await conn.sendMessage(msg.key.remoteJid, {
    text: "❌ Failed to fetch response from GEMINI."
  });
}

}
};
