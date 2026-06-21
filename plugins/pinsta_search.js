const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

Sparky({
    name: "pinsta",
    alias: ["pinsearch"],
    category: "download",
    fromMe: isPublic,
    desc: "Pinterest වල පින්තූර සර්ච් කර ලබාගැනීම"
}, async ({ client, m, args }) => {
    try {
        // මෙන්න මෙතනදී args එක Array එකක්ද නැද්ද කියලා බලලා String එකක් විදියට ගන්නේ
        const query = Array.isArray(args) ? args.join(" ") : args.toString();
        
        if (!query || query.trim() === "") {
            return await m.reply("❌ *මොනවගේ පොටෝ හෝ වීඩියෝ එකක්ද ඕනේ?*\n\n*භාවිතය:* `.pinsta nature wallpaper`");
        }

        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });
        await m.reply(`🔍 *"${query}" සඳහා Pinterest හි සෙවුම් ප්‍රතිඵල ලබාගනිමින් පවතී...*`);

        const apiKey = 'zan_w8lSd1pK_t79f2pa52p';
        const apiUrl = `https://api.zanta-mini.store/api/pinterest/search?apiKey=${apiKey}&text=${encodeURIComponent(query)}`;

        const response = await axios.get(apiUrl);
        const results = response.data.results; 

        if (!results || results.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *කණගාටුයි, එම නමින් ප්‍රතිඵල සොයාගැනීමට නොහැකි විය.*");
        }

        // පින්තූර යැවීම
        for (let i = 0; i < Math.min(results.length, 5); i++) {
            await client.sendMessage(m.jid, { 
                image: { url: results[i] }, 
                caption: `🖼️ *Pinterest Search Result ${i + 1}*\n> Powered by X-KADIYA-MD` 
            });
        }

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("Pinterest Search Error:", err);
        await m.reply("❌ *සෙවුමේ දෝෂයක්:* " + err.message);
    }
});
