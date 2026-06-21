const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

Sparky({
    name: "pinsta",
    alias: ["pinsearch", "pinterestsearch"],
    category: "download",
    fromMe: isPublic,
    desc: "Pinterest වෙබ් අඩවියෙන් පින්තූර සර්ච් කර ලබාගැනීම"
}, async ({ client, m, args }) => {
    try {
        const query = Array.isArray(args) ? args.join(" ") : args.toString();
        
        if (!query || query.trim() === "") {
            return await m.reply("❌ *මොනවගේ පොටෝ එකක්ද ඕනේ?*\n\n*භාවිතය:* `.pinsta nature wallpaper`");
        }

        // සර්ච් එක ආරම්භ කරන විට 🔍 රියැක්ට් කිරීම
        await client.sendMessage(m.jid, { react: { text: "🔍", key: m.key } });
        await m.reply(`🔍 *"${query}" සඳහා Pinterest හි පින්තූර සොයමින් පවතිනවා...*`);

        // Pinterest සෘජු සෙවුම් URL එක (Scraping සඳහා)
        const searchUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22no_meta%22%3Atrue%7D%2C%22context%22%3A%7B%7D%7D`;

        const response = await axios.get(searchUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
            }
        });

        // Pinterest JSON එකෙන් ඔරිජිනල් පින්තූර ලින්ක්ස් වෙන් කරගැනීම
        const items = response.data?.resource_response?.data?.results || [];
        const imageUrls = [];

        for (let item of items) {
            if (item.images && item.images.orig) {
                imageUrls.push(item.images.orig.url);
            }
        }

        if (imageUrls.length === 0) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply("❌ *කණගාටුයි, එම නමින් පින්තූර සොයාගැනීමට නොහැකි විය.*");
        }

        // උපරිම පින්තූර 5ක් චැට් එකට යැවීම
        const maxImages = Math.min(imageUrls.length, 5);
        for (let i = 0; i < maxImages; i++) {
            await client.sendMessage(m.jid, { 
                image: { url: imageUrls[i] }, 
                caption: `🖼️ *Pinterest Search:* ${query}\n📌 *Result:* ${i + 1}/${maxImages}\n\n> Powered by X-KADIYA-MD` 
            });
        }

        // සාර්ථක වූ පසු ✅ රියැක්ට් කිරීම
        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

    } catch (err) {
        console.error("Pinterest Search Scraping Error:", err);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        await m.reply("❌ *සෙවුමේ දෝෂයක් ඇතිවිය:* " + err.message);
    }
});
