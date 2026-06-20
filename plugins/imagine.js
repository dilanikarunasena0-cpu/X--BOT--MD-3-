const axios = require("axios");
const { Sparky, isPublic } = require("../lib"); 

// ======================================================
// 🎨 AI IMAGE GENERATOR (BUFFER BASED - 100% DIRECT PHOTO)
// ======================================================
Sparky({
    name: "imagine",
    alias: ["genimg", "draw"],
    category: "tools",
    fromMe: isPublic,
    desc: "Download and send AI Image as a real photo"
}, async ({ m, text }) => {
    try {
        const input = (text || m.text || m.body || "").trim();

        let cleanInput = input;
        if (cleanInput.startsWith(".")) {
            cleanInput = cleanInput.replace(/^\.\w+\s+/, "");
        }

        if (!cleanInput) {
            return m.reply(
                "❌ කරුණාකර prompt එකක් දෙන්න!\n\n💡 Example:\n.imagine anime a girl in forest\n.imagine cyberpunk city"
            );
        }

        // =========================
        // 🎯 STYLE DETECTION
        // =========================
        let style = "oil-painting"; 
        let promptText = cleanInput;

        const styleMap = {
            anime: "anime",
            realistic: "realistic",
            cyberpunk: "cyberpunk",
            oil: "oil-painting",
            painting: "oil-painting"
        };

        const firstWord = cleanInput.split(" ")[0].toLowerCase();

        if (styleMap[firstWord]) {
            style = styleMap[firstWord];
            promptText = cleanInput.split(" ").slice(1).join(" ");
        }

        if (!promptText.trim()) {
            return m.reply("❌ Style එකෙන් පස්සේ prompt එක දෙන්න!");
        }

        await m.reply(`🎨 *Generating ${style} image... කරුණාකර මොහොතක් රැඳී සිටින්න.*`);

        const apiKey = "wxa_f_21e17ba43b"; 

        const apiUrl = `https://apis.xwolf.space/api/ai/tools/style-transfer?prompt=${encodeURIComponent(promptText)}&style=${encodeURIComponent(style)}&ratio=1%3A1&key=${apiKey}`;

        // 1. මුලින්ම API එකෙන් JSON response එක ගන්නවා
        const apiResponse = await axios.get(apiUrl, { timeout: 45000 }); 
        const data = apiResponse?.data;

        let imageUrl = data?.url || data?.result || data?.image || null;

        if (!imageUrl) {
            return m.reply(
                "❌ Image generate කරන්න බැරි වුණා.\n\n📦 API Response:\n" +
                JSON.stringify(data, null, 2)
            );
        }

        // ======================================================
        // 🛠️ NEW: DOWNLOAD THE IMAGE TO BUFFER (ෆොටෝ එක බාගත කිරීම)
        // ======================================================
        // ලින්ක් එකෙන් කෙලින්ම ඉමේජ් එක බෆර් එකක් විදිහට බාගන්නවා
        const imageBufferResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' }).catch(() => null);
        
        if (!imageBufferResponse || !imageBufferResponse.data) {
            return m.reply("❌ ඡායාරූපය ඩවුන්ලෝඩ් කර ගැනීමට නොහැකි වුණා.");
        }

        const imageBuffer = Buffer.from(imageBufferResponse.data, 'binary');

        const caption =
            `✨ *AI Generated Image*\n\n` +
            `🎭 *Style:* ${style}\n` +
            `📝 *Prompt:* ${promptText}`;

        // ======================================================
        // 🛠️ DIRECT IMAGE BUFFER SENDING LOGIC
        // ======================================================
        try {
            // ක්‍රමය 1: බෆර් එක කෙලින්ම ඉමේජ් එකක් විදිහට යැවීම
            return await m.reply(imageBuffer, { caption: caption, type: "image" });
        } catch (e1) {
            try {
                // ක්‍රමය 2: විකල්ප Sparky/Baileys format එකක්
                return await m.reply({ image: imageBuffer, caption: caption });
            } catch (e2) {
                // ක්‍රමය 3: ඉතාමත් පැරණි X-Bot සංස්කරණ සඳහා
                return await m.reply(imageBuffer, "image", { caption: caption });
            }
        }

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

