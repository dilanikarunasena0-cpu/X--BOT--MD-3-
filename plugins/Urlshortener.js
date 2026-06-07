const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// TinyURL API Key එක මෙතනට දමා ඇත
const API_KEY = "1ixUjERcLKnihy121LFUnLNOnf80FXMRqudcr9UJlrzndU21Qrn9q9auD2LH";

Sparky({
    name: "short",
    alias: ["shorten", "url", "link"],
    category: "tools",
    fromMe: isPublic,
    desc: "Professional URL Shortener using TinyURL API"
}, async ({ client, m, args }) => {
    // බොට්ගේ base එක අනුව args String හෝ Array වෙන්න පුළුවන් නිසා නිවැරදිව URL එක වෙන් කරගැනීම
    const longUrl = (Array.isArray(args) ? args.join("") : String(args || "")).trim();

    // යූසර් ලින්ක් එකක් දීලා නැත්නම් Usage එක පෙන්වීමට
    if (!longUrl) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *🔗 URL SHORTENER* 」\n│\n├ *Usage:* .short <දිග ලින්ක් එක>\n├ *Example:* .short https://www.google.com\n│\n╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
    }

    // දාපු ලින්ක් එක ඇත්තටම වලංගු URL එකක්ද කියා පරික්ෂා කිරීම (URL Validation)
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (!urlPattern.test(longUrl)) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return await m.reply(`❌ *කරුණාකර වලංගු ලින්ක් එකක් (URL) ඇතුලත් කරන්න!*\n(ලින්ක් එකේ මුලට http:// හෝ https:// තිබීම අනිවාර්ය වේ)`);
    }

    try {
        // විධානය පිළිගත් බව පෙන්වීමට මුල් React එක
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
        await client.sendPresenceUpdate('composing', m.jid);

        // TinyURL API එක හරහා Request එක යැවීම (Bearer Authentication පාවිච්චි කර ඇත)
        const response = await axios.post(
            "https://api.tinyurl.com/create",
            {
                url: longUrl,
                domain: "tinyurl.com"
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000
            }
        );

        // API එකෙන් සාර්ථකව Response එකක් ලැබුනදැයි බැලීම
        if (response.data && response.data.data) {
            const shortUrl = response.data.data.tiny_url;
            const domain = response.data.data.domain;
            const createdAt = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });

            // සාර්ථක වූ පසු වැටෙන React එක
            await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

            // Professional Format එකකින් මැසේජ් එක නිර්මාණය කිරීම
            let result = `🔗 *URL SHORTENER REPORT* 🔗\n\n`;
            result += `📝 *Original Link:* ${longUrl}\n\n`;
            result += `🚀 *Shortened Link:* ${shortUrl}\n\n`;
            result += `🌐 *Domain Provider:* ${domain}\n`;
            result += `📅 *Generated Time:* ${createdAt} (SLT)\n\n`;
            result += `*❖ Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎*`;

            await client.sendMessage(m.jid, { text: result }, { quoted: m });
        } else {
            throw new Error("Invalid API Response");
        }

        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        // මොකක් හරි අවුලක් ගියොත් වැටෙන React එක
        await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
        console.error("URL Shortener Error:", err.response ? err.response.data : err.message);
        
        // යූසර්ගේ API Key එකේ ලිමිට් ඉවර නම් හෝ වැරදි නම් පෙන්වන Error මැසේජ් එක
        if (err.response && err.response.status === 401) {
            await m.reply(`⚠️ *API Authentication Failed!*\nඔයා දීපු API Key එක වැරදියි හෝ Expire වෙලා මචන්. පොඩ්ඩක් චෙක් කරලා බලන්න.`);
        } else {
            await m.reply(`⚠️ සේවාදායකයේ බිඳවැටීමක්. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.`);
        }
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
