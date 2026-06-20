const axios = require("axios");

// ======================================================
// 🎨 AI IMAGE GENERATOR (.imagine [විස්තරය])
// ======================================================
Sparky({
    name: "img",
    alias: ["genimg", "draw", "aiimg"],
    category: "tools",
    fromMe: isPublic, 
    desc: "Generate AI Images using XWolf API"
}, async ({ m, text }) => {
    try {
        let inputBody = text || m.text || m.body || "";
        
        if (inputBody.startsWith(".")) {
            inputBody = inputBody.replace(/^\.\w+\s+/, "");
        }

        const promptText = inputBody.trim();

        if (!promptText) {
            return m.reply("❌ කරුණාකර සාදාගත යුතු රූපයේ විස්තරයක් (Prompt) ලබා දෙන්න!\n\n💡 Example:\n.imagine a wolf in a forest | style:oil-painting | ratio:1:1");
        }

        // Default Settings (පරිශීලකයා වෙනස් කර නැත්නම් පාවිච්චි වන දේවල්)
        let finalPrompt = promptText;
        let style = "oil-painting"; // default style
        let ratio = "1:1";          // default ratio

        // Prompt එක ඇතුලේ | ලකුණෙන් style සහ ratio වෙන් කරලා තියෙනවද බලනවා
        if (promptText.includes("|")) {
            const parts = promptText.split("|");
            finalPrompt = parts[0].trim();

            parts.forEach(part => {
                const kv = part.split(":");
                if (kv.length === 2) {
                    const key = kv[0].trim().toLowerCase();
                    const value = kv[1].trim();
                    if (key === "style") style = value;
                    if (key === "ratio") ratio = encodeURIComponent(value); // 1:1 -> 1%3A1 කිරීමට
                }
            });
        }

        // Bot වැඩ කරන බව පෙන්වීමට මැසේජ් එකක්
        await m.reply("🎨 *ඔබේ රූපය සකසමින් පවතී... කරුණාකර මොහොතක් රැඳී සිටින්න.*");

        const apiKey = "wxa_f_21e17ba43b";
        
        // XWolf Style-Transfer API URL එක
        const apiUrl = `https://apis.xwolf.space/api/ai/tools/style-transfer?prompt=${encodeURIComponent(finalPrompt)}&style=${style}&ratio=${ratio}&key=${apiKey}`;

        const response = await axios.get(apiUrl);

        // API එකෙන් එන response එක check කිරීම
        if (response.data && response.data.status === true && response.data.result) {
            const imageUrl = response.data.result;

            // Bot Framework එකේ image එකක් යවන ආකාරය (Sparky framework එකේ config අනුව වෙනස් විය හැක)
            // සාමාන්‍ยයෙන් sendMessage එකෙන් image url එක direct යැවිය හැක
            return await m.client.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: `✨ *AI Generated Image*\n\n📝 *Prompt:* ${finalPrompt}\n🎨 *Style:* ${style}\n📐 *Ratio:* ${ratio.replace("%3A", ":")}`
            }, { quoted: m });

        } else {
            return m.reply("❌ ඡායාරූපය නිර්මාණය කිරීමට නොහැකි වුණා. (Invalid API Response)");
        }

    } catch (err) {
        console.error("❌ Image Gen Error:", err);
        return m.reply("❌ Error එකක් සිදු වුණා: " + (err.response?.data?.message || err.message));
    }
});
