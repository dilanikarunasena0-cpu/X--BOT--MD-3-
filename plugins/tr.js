const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

const langCodes = {
    si: "සිංහල", en: "English", ta: "දෙමළ", hi: "හින්දි",
    ar: "අරාබි", fr: "ප්‍රංශ", de: "ජර්මන්", es: "ස්පාඤ්ඤ",
    ja: "ජපන්", ko: "කොරියන්", zh: "චීන", ru: "රුසියානු",
    pt: "පෘතුගීසි", it: "ඉතාලි", auto: "Auto Detect"
};

Sparky({
    name: "tr",
    alias: ["translate", "trans", "trn"],
    category: "tools",
    fromMe: isPublic,
    desc: "100+ languages translate + Quality score"
}, async ({ client, m, args }) => {
    const text = args.join(" ");

    if (!text) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *🌐 TRANSLATOR PRO* 」\n│\n├ *Usage:*.tr [code] text\n│\n├ *Examples:*\n│ 1).tr මම හොඳයි\n│ 2).tr en I love you\n│ 3).tr ta Vanakkam\n│\n├ *Popular Codes:*\n│ si=සිංහල | en=English | ta=දෙමළ\n│ hi=හින්දි | fr=ප්‍රංශ | ja=ජපන්\n│\n╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
    }

    const startTime = Date.now();

    try {
        await client.sendPresenceUpdate('composing', m.jid);
        await client.sendMessage(m.jid, { react: { text: "🌐", key: m.key } });

        let targetLang = "auto";
        let translateText = text;

        const langMatch = text.match(/^(si|en|es|ta|hi|fr|de|ja|ko|zh|ru|ar|pt|it)\s+(.+)/i);
        if (langMatch) {
            targetLang = langMatch[1].toLowerCase();
            translateText = langMatch[2];
        }

        await client.sendMessage(m.jid, { react: { text: "⚙️", key: m.key } });

        const isSinhala = /[\u0D80-\u0DFF]/.test(translateText);
        const fromLang = isSinhala? "si" : "en";
        const toLang = targetLang === "auto"? (isSinhala? "en" : "si") : targetLang;

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(translateText)}&langpair=${fromLang}|${toLang}`;
        const res = await axios.get(url, { timeout: 10000 });
        const data = res.data.responseData;
        const translated = data.translatedText;
        const match = data.match || 0;

        if (!translated || translated === translateText) {
            throw new Error("No translation");
        }

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        const quality = match >= 0.8? "🟢 High" : match >= 0.5? "🟡 Medium" : "🔴 Low";
        const chars = translateText.length;

        let result = `╭─「 *🌐 TRANSLATOR PRO v2.0* 」\n`;
        result += `│\n`;
        result += `├ *From:* ${langCodes[fromLang] || fromLang}\n`;
        result += `├ *To:* ${langCodes[toLang] || toLang}\n`;
        result += `├ *Quality:* ${quality} ${(match*100).toFixed(0)}%\n`;
        result += `├ *Speed:* ${timeTaken}s | *Chars:* ${chars}\n`;
        result += `│\n`;
        result += `├ *Original:*\n`;
        result += `│ 「 ${translateText} 」\n`;
        result += `│\n`;
        result += `├ *Translated:*\n`;
        result += `│ 「 ${translated} 」\n`;
        result += `│\n`;
        result += `╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        await client.sendMessage(m.jid, { text: result }, { quoted: m });
        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        console.error(err);

        if (err.response?.status === 429) {
            await m.reply(`⚠️ Daily limit ඉවරයි මචන්\nMyMemory free limit = 1000/day\nහෙට ආපහු try කරපන්`);
        } else {
            await m.reply(`❌ Translate failed\nText එක 500 chars ට අඩු කරලා බලපන්`);
        }
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
