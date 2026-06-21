const { Sparky } = require("../lib");
const axios = require("axios");

Sparky({
    name: "sinhalasub",
    alias: ["movie"],
    category: "download",
    desc: "චිත්‍රපටයේ නම ලබා දී සෘජුවම සෙවීම සහ බාගත කිරීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        // 1. චිත්‍රපටයේ නම ලබා දී ඇත්දැයි පරීක්ෂා කිරීම
        if (!text) {
            return await m.reply(`ℹ️ *SinhalaSub Movie Downloader* ℹ️\n\n` +
                `*භාවිතය:* චිත්‍රපටයේ නම සඳහන් කරන්න.\n` +
                `👉 \`.sinhalasub [Movie Name]\`\n\n` +
                `*උදා:* \`.sinhalasub Kishkindha Kaandam\``);
        }

        await m.reply(`🔍 *"${text}" සඳහා සෙවීම ආරම්භ කරමින්...*`);

        // SinhalaSub සර්ච් ඒපීඅයි එක පාවිච්චි කිරීම
        // සටහන: API එකේ 'text' එකට ෆිල්ම් එකේ නම දුන් විට එය සෙවීම සිදු කරයි
        const apiKey = "zan_w8lSd1pK_t79f2pa52p";
        const apiUrl = `https://api.zanta-mini.store/api/sinhalasub/dl?apiKey=${apiKey}&text=${encodeURIComponent(text)}`;

        const response = await axios.get(apiUrl).catch(() => null);

        if (!response || !response.data || response.data.status !== true) {
            return await m.reply('❌ දත්ත ලබා ගැනීමට නොහැකි විය. කරුණාකර චිත්‍රපටයේ නම නිවැරදිදැයි පරීක්ෂා කරන්න.');
        }

        const data = response.data.result;

        // චිත්‍රපටයේ විස්තරය සහ ලින්ක් එක සැකසීම
        let caption = `🎬 *${data.title || "සෙවුම් ප්‍රතිඵලය"}* 🎬\n\n` +
                      `ℹ️ *විස්තර:* ${data.description || "නැත"}\n\n` +
                      `📥 *බාගත කිරීමේ සබැඳි (Download Links):*\n\n`;

        if (data.dl_links && data.dl_links.length > 0) {
            data.dl_links.forEach((link, index) => {
                caption += `${index + 1}. *${link.quality || "Quality"}* (${link.size || "Size"})\n` +
                           `🔗 ${link.link}\n\n`;
            });
        } else {
            caption += `❌ මෙම චිත්‍රපටය සඳහා සෘජු ලින්ක් හමු නොවීය.`;
        }

        caption += `_Powered by Kadiya AI_`;

        // පෝස්ටර් එකත් එක්ක පණිවිඩය යැවීම
        if (data.image) {
            await client.sendMessage(m.chat, {
                image: { url: data.image },
                caption: caption
            }, { quoted: m });
        } else {
            await m.reply(caption);
        }

    } catch (error) {
        await m.reply(`❌ දෝෂයක් සිදු විය: ${error.message}`);
    }
});

