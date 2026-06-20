const { Sparky, isPublic } = require("../lib");

// 🔐 SAFE JID HANDLER
const getJid = (m) => {
    return m?.chat || m?.from || m?.key?.remoteJid || null;
};

// ─────────────────────────────
// 📜 HELP / MENU COMMAND
// ─────────────────────────────
Sparky({
    name: "help",
    alias: ["menu"],
    category: "main",
    fromMe: isPublic,
    desc: "Show bot help menu with buttons"
}, async ({ m, client }) => {
    try {

        const jid = getJid(m);
        if (!jid) return m.reply("❌ Invalid chat ID");

        const helpText = `╭━━━〔 ❖ X-KADIYA-MD 💎 〕━━━⬣
┃ 👋 Welcome Bot Menu
┃
┃ 🚀 Features
┃ ─────────────
┃ 🤖 AI Assistant
┃ 🎵 Song Download
┃ ⚡ Speed Test
┃ ☀️ Sun Tool
╰━━━━━━━━━━━━━━⬣`;

        const buttons = [
            { buttonId: ".menu", buttonText: { displayText: "📜 Menu" }, type: 1 },
            { buttonId: ".sun", buttonText: { displayText: "☀️ Sun" }, type: 1 },
            { buttonId: ".song", buttonText: { displayText: "🎵 Song" }, type: 1 },
            { buttonId: ".ping", buttonText: { displayText: "⚡ Ping" }, type: 1 }
        ];

        await client.sendMessage(jid, {
            text: helpText,
            footer: "💎 X-KADIYA-MD 💎",
            buttons: buttons,
            headerType: 1
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});


// ─────────────────────────────
// ⚡ PING COMMAND
// ─────────────────────────────
Sparky({
    name: "speed",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m, client }) => {
    try {

        const jid = getJid(m);
        if (!jid) return m.reply("❌ Invalid chat ID");

        const start = Date.now();
        await m.reply("Testing Speed... ⏳");
        const ms = Date.now() - start;

        const pingText = `⚡ *Pong!*\n\nResponse Speed: *${ms}ms*`;

        const buttons = [
            { buttonId: ".menu", buttonText: { displayText: "📜 Main Menu" }, type: 1 },
            { buttonId: ".song", buttonText: { displayText: "🎵 Song" }, type: 1 },
            { buttonId: ".ping", buttonText: { displayText: "⚡ Ping Again" }, type: 1 }
        ];

        await client.sendMessage(jid, {
            text: pingText,
            footer: "💎 X-KADIYA-MD 💎",
            buttons: buttons,
            headerType: 1
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
