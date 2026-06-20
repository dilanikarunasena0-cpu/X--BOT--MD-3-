const axios = require("axios");

// ======================================================
// 🎨 AI IMAGE GENERATOR (MULTI STYLE)
// ======================================================
Sparky({
    name: "img",
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

        if (!promptText) {
            return m.reply("❌ Style එකෙන් පස්සේ prompt එක දෙන්න!");
        }

        await m.reply(`🎨 *Generating ${style} image...*`);

        const apiKey = process.env.XWOLF_API_KEY || "wxa_f_21e17ba43b";

        const apiUrl =
            "https://apis.xwolf.space/api/ai/tools/style-transfer" +
            `?prompt=${encodeURIComponent(promptText)}` +
            `&style=${encodeURIComponent(style)}` +
            `&ratio=1:1&key=${apiKey}`;

        const response = await axios.get(apiUrl, { timeout: 30000 });

        const data = response?.data;

        if (data?.status && data?.result) {

            const caption = `✨ *AI Generated Image*\n\n🎭 *Style:* ${style}\n📝 *Prompt:* ${promptText}`;

            return await m.send(
                data.result,
                { caption },
                "image",
                m
            );
        }

        return m.reply("❌ Image generate කරන්න බැරි වුණා. API error.");

    } catch (err) {
        console.error(err);
        return m.reply("❌ Error: " + (err.message || "Unknown"));
    }
});
