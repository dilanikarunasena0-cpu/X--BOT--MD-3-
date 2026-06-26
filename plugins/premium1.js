const { Sparky, isPublic } = require("../lib");

// 💳 Premium පාවිච්චි කරන්න අවසර ඇති අයගේ ලිස්ට් එක (නම්බර් හෝ Session ID)
const PREMIUM_USERS = [
    "94771234567@s.whatsapp.net", // සල්ලි ගෙවපු අයගේ WhatsApp JID එක
    "SESSION_ABC123"
];

Sparky({
    name: "premiummenu",
    fromMe: isPublic,
    category: "premium",
    desc: "Display exclusive premium features."
}, async ({ m, client }) => {
    
    // 🛡️ Premium Check - සල්ලි නොගෙවපු කෙනෙක් නම් මෙතනින්ම Command එක නවත්වනවා
    const userJid = m.sender;
    const isPremium = PREMIUM_USERS.includes(userJid);

    if (!isPremium) {
        return await m.reply(
            "🚫 *ACCESS DENIED - PREMIUM ONLY*\n\n" +
            "⚠️ මෙම විශේෂාංගය භාවිතා කිරීමට ඔබට අවසර නැත.\n" +
            "💳 මෙය පාවිච්චි කිරීමට සල්ලි ගෙවා Premium සේවාව ලබාගත යුතුය.\n\n" +
            "💡 *Contact Owner:* t.me/your_telegram_username"
        );
    }

    // ⭐ Premium කෙනෙක් නම් විතරක් මේ මෙනු එක පෙන්වනවා
    let menu = `👑 *👑 𝙆𝘼𝘿𝙄𝙔𝘼-𝙓-𝙈𝘿 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝙈𝙀𝙉𝙐 👑* 👑\n\n`;
    menu += `✨ _Welcome Premium User!_\n\n`;
    menu += `┌─── ❖ *EXCLUSIVE TOOLS* ❖ ───┐\n`;
    menu += `│ 💎 .webscrape <url> (No Limits)\n`;
    menu += `│ 💎 .openaibot (AI Assistant)\n`;
    menu += `│ 💎 .animescrape (Premium Only)\n`;
    menu += `└──────────────────────────┘\n\n`;
    menu += `👑 *Status:* Active Premium Member`;

    await m.reply(menu);
});

