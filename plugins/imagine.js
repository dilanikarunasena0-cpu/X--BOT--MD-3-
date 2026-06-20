const axios = require("axios");

// ======================================================
// 🎨 AI IMAGE GENERATOR (.imagine [විස්තරය])
// ======================================================
Sparky({
    name: "imagine",
    alias: ["genimg", "draw"],
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
            return m.reply("❌ කරුණාකර සාදාගත යුතු රූපයේ විස්තරයක් ලබා දෙන්න!\n\n💡 Example: .imagine a beautiful anime girl");
        }

        // පොඩ්ඩක් ඉන්න කියලා පණිවිඩයක් දානවා
        await m.reply("🎨 *ඔබේ රූපය සකසමින් පවතී...*");

        const apiKey = "wxa_f_21e17ba43b";
        
        // සරලවම default style එකෙන් සහ ratio එකෙන් රූපය සෑදීමට URL එක සකස් කිරීම
        const apiUrl = `https://apis.xwolf.space/api/ai/tools/style-transfer?prompt=${encodeURIComponent(promptText)}&style=oil-painting&ratio=1%3A1&key=${apiKey}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.status === true && response.data.result) {
            const imageUrl = response.data.result;
            const captionText = `✨ *AI Generated Image*\n\n📝 *Prompt:* ${promptText}`;

            // 🛠️ ක්‍රමය 1: Sparky වල බහුලවම පාවිච්චි වන සරලම ක්‍රමය (Caption එකත් එක්කම Image එක යැවීම)
            if (typeof m.sendFromUrl === "function") {
                return await m.sendFromUrl(imageUrl, { caption: captionText, quoted: m });
            } 
            
            // 🛠️ ක්‍රමය 2: (Fallback) එකක් විදිහට සාමාන්‍ය sendMessage ක්‍රමය
            return await m.client.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: captionText 
            }, { quoted: m });

        } else {
            return m.reply("❌ ඡායාරූපය නිර්මාණය කිරීමට නොහැකි වුණා. (API Error)");
        }

    } catch (err) {
        console.error("❌ Image Gen Error:", err);
        return m.reply("❌ Error එකක් සිදු වුණා: " + err.message);
    }
});
