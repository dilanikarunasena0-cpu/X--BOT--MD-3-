const { Sparky, isPublic } = require("../lib");

// --- 1. HELP / MENU COMMAND ---
Sparky({
    name: "help",
    alias: ["menu"],
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu with buttons"
}, async ({ m, client }) => {
    try {
        // JID එක නිවැරදිව තෝරාගැනීම (m.chat නැත්නම් m.from)
        const targetChat = m.chat || m.from; 

        const helpText = `╭━━━〔 ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎 〕━━━⬣
┃
┃ 👋 Welcome to X-KADIYA-MD Bot
┃
┃ 🚀 Our Services
┃ ─────────────
┃ 🌐 Image To URL
┃ 📥 Media Downloader
┃ 🎵 Song Search
┃ 🤖 AI Chat Assistant
┃ 🛠️ Useful Tools
┃
┃ 💎 Why Choose Us?
┃ ─────────────
┃ ✅ Fast Response
┃ ✅ High Quality Service
┃ ✅ Easy To Use
┃ ✅ 24/7 Available
┃
╰━━━━━━━━━━━━━━⬣`;

        const buttonMessage = {
            text: helpText,
            footer: "💎 X-KADIYA-MD 💎",
            buttons: [
                { buttonId: '.ai', buttonText: { displayText: '🤖 AI Assistant' }, type: 1 },
                { buttonId: '.song', buttonText: { displayText: '🎵 Search Song' }, type: 1 },
                { buttonId: '.ping', buttonText: { displayText: '⚡ Check Speed' }, type: 1 }
            ],
            headerType: 1
        };

        // m.chat වෙනුවට targetChat ලබා දී ඇත
        await client.sendMessage(targetChat, buttonMessage, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});

// --- 2. PING COMMAND WITH BUTTONS ---
Sparky({
    name: "ping",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m, client }) => {
    try {
        const targetChat = m.chat || m.from; 
        
        const start = new Date().getTime();
        // වේගය මැනීමට සරල text එකක් මුලින් යවමු
        const msg = await m.reply("Testing Speed... ⏳");
        const end = new Date().getTime();
        const responseTime = (end - start);

        const pingText = `⚡ *Pong!* \n\nResponse Speed: *${responseTime}ms*`;

        const pingButtons = {
            text: pingText,
            footer: "💎 X-KADIYA-MD 💎",
            buttons: [
                { buttonId: '.menu', buttonText: { displayText: '📜 Main Menu' }, type: 1 },
                { buttonId: '.owner', buttonText: { displayText: '📞 Contact Owner' }, type: 1 }
            ],
            headerType: 1
        };

        await client.sendMessage(targetChat, pingButtons, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
