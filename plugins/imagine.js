const axios = require("axios");

// ======================================================
// 🎨 AI IMAGE GENERATOR (MULTI STYLE) - FIXED VERSION
// ======================================================
Sparky({
    name: "imagine",
    alias: ["genimg", "draw"],
    category: "tools",
    fromMe: isPublic,
    desc: "Generate AI Images with multiple styles"
}, async ({ m, text }) => {
    try {

        const input = (text || "").trim();

        if (!input) {
            return m.reply(
                "❌ කරුණාකර prompt එකක් දෙන්න!\n\n💡 Example:\n.imagine anime a girl in forest\n.imagine cyberpunk city"
            );
        }

        // =========================
        // 🎯 STYLE DETECTION
        // =========================
        let style = "oil-painting";
        let promptText = input;

        const styleMap = {
            anime: "anime",
            realistic: "realistic",
            cyberpunk: "cyberpunk",
            oil: "oil-painting",
            painting: "oil-painting"
        };

        const firstWord = input.split(" ")[0].toLowerCase();

        if (styleMap[firstWord]) {
            style = styleMap[firstWord];
            promptText = input.split(" ").slice(1).join(" ");
        }

        if (!promptText.trim()) {
            return m.reply("❌ Style එකෙන් පස්සේ prompt එක දෙන්න!");
        }

        await m.reply(`🎨 *Generating ${style} image...*`);

        const apiKey = process.env.XWOLF_API_KEY || "wxa_f_21e17ba43b";

        const apiUrl =
            "https://apis.xwolf.space/api/ai/tools/style-transfer" +
            `?prompt=${encodeURIComponent(promptText)}` +
            `&style=${encodeURIComponent(style)}` +
            `&ratio=1:1&key=${apiKey}`;

        console.log("📡 API URL:", apiUrl);

        const response = await axios.get(apiUrl, { timeout: 30000 });

        const data = response?.data;

        console.log("📦 API RESPONSE:", data);

        // =========================
        // 🧠 SMART RESULT HANDLING
        // =========================
        const imageUrl =
            data?.result ||
            data?.image ||
            data?.url ||
            data?.data?.result ||
            data?.data?.image;

        if (!imageUrl) {
            return m.reply(
                "❌ Image generate කරන්න බැරි වුණා.\n\n📦 API Response:\n" +
                JSON.stringify(data, null, 2)
            );
        }

        const caption =
            `✨ *AI Generated Image*\n\n` +
            `🎭 *Style:* ${style}\n` +
            `📝 *Prompt:* ${promptText}`;

        return await m.send(imageUrl, { caption }, "image", m);

    } catch (err) {
        console.error("❌ ERROR:", err);

        return m.reply(
            "❌ Error occurred:\n" +
            (err.response?.data
                ? JSON.stringify(err.response.data, null, 2)
                : err.message || "Unknown error")
        );
    }
});
