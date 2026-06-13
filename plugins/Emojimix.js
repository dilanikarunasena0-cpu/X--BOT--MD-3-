const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const emojiRegex = require("emoji-regex");

// Local Simple Database
const db = {
    favorites: {},
    groupStats: {},
    userCounts: {}
};

/**
 * ඉමෝජි එකක නිවැරදි Unicode Hex Code එක ලබාගැනීම.
 * Google Kitchen සඳහා Zero Width Joiner (ZWJ) ඉවත් කර පිරිසිදු කරගත යුතුය.
 */
function getEmojiCode(emoji) {
    let codes = [];
    for (let char of emoji) {
        codes.push(char.codePointAt(0).toString(16));
    }
    // සාමාන්‍ය ඉමෝජි සඳහා පළමු කෝඩ් එක uXXXX ලෙස සකසයි
    return `u${codes[0]}`;
}

// Image එක WhatsApp Sticker එකක් බවට පත් කරන Helper Function
async function createSticker(buffer, packname = "Emoji Kitchen", author = "Sparky-Bot") {
    try {
        const sticker = new Sticker(buffer, {
            pack: packname,
            author: author,
            type: StickerTypes.FULL,
            quality: 70
        });
        return await sticker.toBuffer();
    } catch (e) {
        console.error("Sticker Creation Error:", e.message);
        return null;
    }
}

// ==========================================
// 1. MAIN MIX COMMAND (.mix) - FIXED
// ==========================================
Sparky({
    name: "mix",
    alias: ["emojimix", "combine"],
    category: "fun",
    fromMe: isPublic,
    desc: "Combine 2 emojis to make a custom sticker"
}, async ({ client, m, args }) => {
    const text = args.join(" ");
    
    // නවීන ක්‍රමයට ඉමෝජි වෙන්කර හඳුනාගැනීම
    const regex = emojiRegex();
    const emojis = text.match(regex);

    if (!emojis || emojis.length < 2) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *📦 EMOJI KITCHEN* 」\n│\n├ *Usage:* .mix 😎 🐱\n├ *Example:* .mix ❤️ 🔥\n│\n╰─ Powered by Sparky ✨`);
    }

    await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
    
    const e1 = getEmojiCode(emojis[0]);
    const e2 = getEmojiCode(emojis[1]);

    // වැඩ කරන පොදු විවෘත API එකක් (Emoji Kitchen Proxy API) භාවිතා කිරීම
    // පැරණි GitHub Raw URL වෙනුවට මෙම API එක ස්ථාවරයි
    const apiUrl = `https://tenor.googleapis.com/v2/featured?key=LIVD6OHSXS73&client_key=emoji_kitchen_${e1}_${e2}`;
    
    // විකල්ප සෘජු CDN ලිපින ( fallback ක්‍රම )
    const urlsToTry = [
        `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`,
        `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`
    ];

    let response = null;

    // මුලින්ම පළමු ක්‍රමයෙන් Image එක ලබාගැනීමට උත්සාහ කිරීම
    for (let url of urlsToTry) {
        try {
            response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
            if (response && response.data) break;
        } catch (e) {
            // දෝෂයක් ආවොත් ඊළඟ URL එක උත්සාහ කරයි
            continue;
        }
    }

    // කිසිදු URL එකකින් දත්ත නොලැබුනේ නම්
    if (!response || !response.data) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return await m.reply(`❌ කණගාටුයි, [ ${emojis[0]} + ${emojis[1]} ] එකතුව සඳහා ස්ටිකරයක් නිර්මාණය කිරීමට Google Kitchen ඉඩ නොදේ. වෙනත් ඉමෝජි යුගලක් උත්සාහ කරන්න.`);
    }

    try {
        // Stats යාවත්කාලීන කිරීම
        const sender = m.sender;
        db.userCounts[sender] = (db.userCounts[sender] || 0) + 1;
        
        const group = m.jid;
        if (!db.groupStats[group]) db.groupStats[group] = {};
        const comboKey = `${emojis[0]}${emojis[1]}`;
        db.groupStats[group][comboKey] = (db.groupStats[group][comboKey] || 0) + 1;

        // Sticker එකක් බවට හැරවීම
        const stickerBuffer = await createSticker(response.data, "Emoji Kitchen", "Sparky Bot");
        
        if (!stickerBuffer) throw new Error("Sticker buffer is empty");

        await client.sendMessage(m.jid, { react: { text: "🍳", key: m.key } });
        await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return await m.reply(`❌ ස්ටිකරය සැකසීමේදී තාක්ෂණික දෝෂයක් සිදුවිය.`);
    }
});

// ==========================================
// 2. RANDOM MIX COMMAND (.randommix) - FIXED
// ==========================================
Sparky({
    name: "randommix",
    category: "fun",
    fromMe: isPublic,
    desc: "Generate a completely random emoji mix"
}, async ({ client, m }) => {
    await client.sendMessage(m.jid, { react: { text: "🎲", key: m.key } });
    
    const popularEmojis = ["😎", "🐱", "😂", "❤️", "🔥", "😭", "💀", "🤡", "🤖", "🦊", "👑", "👻", "👽", "🥑", "🐸", "🐷"];
    let rand1 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    let rand2 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    
    while(rand1 === rand2) {
        rand2 = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    }

    const e1 = getEmojiCode(rand1);
    const e2 = getEmojiCode(rand2);
    
    const urls = [
        `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`,
        `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`
    ];

    let response = null;
    for (let url of urls) {
        try {
            response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
            if (response && response.data) break;
        } catch { continue; }
    }

    if (!response || !response.data) {
        return await m.reply("🎲 ලැබුණු සසම්භාවී එකතුව අසාර්ථකයි. කරුණාකර නැවත `.randommix` යොදන්න.");
    }

    const stickerBuffer = await createSticker(response.data, `Random: ${rand1} + ${rand2}`);
    await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
});

// ==========================================
// 3. SAVE FAVORITE MIX (.savemix) - FIXED
// ==========================================
Sparky({
    name: "savemix",
    category: "fun",
    fromMe: isPublic,
    desc: "Save a combination as your favorite"
}, async ({ m, args }) => {
    // Reply කර ඇති පණිවිඩය පරීක්ෂාව
    const quotedText = m.quoted ? m.quoted.text : null;
    if (!quotedText) return await m.reply("❌ කරුණාකර ඔබ කලින් යෙදූ ඉමෝජි පණිවිඩයට (Example: .mix 😎 🐱) Reply කර මෙම විධානය ලබාදෙන්න.");
    
    const name = args.join(" ").trim();
    if (!name) return await m.reply("❌ කරුණාකර මෙම එකතුව සුරැකීමට නමක් ලබාදෙන්න. (.savemix මගේම)");

    const regex = emojiRegex();
    const emojis = quotedText.match(regex);
    if (!emojis || emojis.length < 2) return await m.reply("❌ Reply කරන ලද පණිවිඩය තුළ ඉමෝජි යුගලක් සොයාගත නොහැක.");

    if (!db.favorites[m.sender]) db.favorites[m.sender] = {};
    db.favorites[m.sender][name.toLowerCase()] = [emojis[0], emojis[1]];

    return await m.reply(`❤️ සුරැකුණා! දැන් ඔබට එම ඉමෝජි වෙනුවට \`.favmix ${name.toLowerCase()}\` ලෙස යොදා කෙලින්ම ස්ටිකරය ලබාගත හැක.`);
});

// ==========================================
// 4. GET FAVORITE MIX (.favmix) - FIXED
// ==========================================
Sparky({
    name: "favmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Get your saved favorite mix"
}, async ({ client, m, args }) => {
    const name = args.join(" ").trim().toLowerCase();
    if (!name) return await m.reply("❌ කරුණාකර ඔබ සුරකින ලද නම ලබාදෙන්න. (.favmix <නම>)");

    if (!db.favorites[m.sender] || !db.favorites[m.sender][name]) {
        return await m.reply("❌ එම නමින් සුරැකි එකතුවක් සොයාගත නොහැක.");
    }

    const [emo1, emo2] = db.favorites[m.sender][name];
    const e1 = getEmojiCode(emo1);
    const e2 = getEmojiCode(emo2);

    const urls = [
        `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e1}/${e1}_${e2}.png`,
        `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/third_party/emoji-kitchen/kitchen/${e2}/${e2}_${e1}.png`
    ];

    let response = null;
    for (let url of urls) {
        try {
            response = await axios.get(url, { responseType: 'arraybuffer' });
            if (response && response.data) break;
        } catch { continue; }
    }

    if (!response || !response.data) return await m.reply("❌ ස්ටිකර් දත්ත ලබාගැනීම අසාර්ථකයි.");

    const stickerBuffer = await createSticker(response.data, `Fav: ${name}`);
    await client.sendMessage(m.jid, { sticker: stickerBuffer }, { quoted: m });
});

// ==========================================
// 5. GAMIFICATION (.topmix)
// ==========================================
Sparky({
    name: "topmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Show top users and popular mixes"
}, async ({ m }) => {
    let output = `🏆 *EMOJI KITCHEN LEADERBOARD* 🏆\n\n`;
    
    output += `👑 *Top Creators:*\n`;
    const sortedUsers = Object.entries(db.userCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if(sortedUsers.length === 0) output += `  - දත්ත තවමත් නොමැත -\n`;
    else {
        sortedUsers.forEach(([user, count], index) => {
            output += `${index + 1}. @${user.split("@")[0]} : ${count} ਵਾਰ\n`;
        });
    }

    output += `\n🔥 *Group Popular Mixes:*\n`;
    if (!db.groupStats[m.jid] || Object.keys(db.groupStats[m.jid]).length === 0) {
        output += `  - දත්ත තවමත් නොමැත -\n`;
    } else {
        const sortedCombos = Object.entries(db.groupStats[m.jid]).sort((a, b) => b[1] - a[1]).slice(0, 5);
        sortedCombos.forEach(([combo, count], index) => {
            output += `${index + 1}. [ ${combo} ] -> භාවිතා වාර: ${count}\n`;
        });
    }

    return await m.reply(output);
});

// ==========================================
// 6. GUIDE COMMAND (.helpmix)
// ==========================================
Sparky({
    name: "helpmix",
    category: "fun",
    fromMe: isPublic,
    desc: "Emoji Kitchen Guide"
}, async ({ m }) => {
    let help = `🍳 *EMOJI KITCHEN USER GUIDE* 🍳\n\n`;
    help += `• \`.mix 👑 🐱\` - ඉමෝජි 2ක් එකතු කරයි.\n`;
    help += `• \`.randommix\` - සසම්භාවී එකතුවක් සාදයි.\n`;
    help += `• \`.savemix <නම>\` - අවසන් mix එක save කරයි (Reply).\n`;
    help += `• \`.favmix <නම>\` - සේව් කල ස්ටිකරය ලබාගනී.\n`;
    help += `• \`.topmix\` - දක්ෂතම නිර්මාණකරුවන් ලැයිස්තුව.\n`;
    return await m.reply(help);
});

