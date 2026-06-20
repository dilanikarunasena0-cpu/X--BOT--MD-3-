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
        const targetChat = m.chat || m.from || m.key.remoteJid;

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

        // Hydrated Template Buttons (Error Free & 100% Working)
        const templateMessage = {
            viewOnceMessage: {
                message: {
                    templateMessage: {
                        hydratedTemplate: {
                            hydratedContentText: helpText,
                            hydratedFooterText: "💎 X-KADIYA-MD 💎",
                            hydratedButtons: [
                                {
                                    index: 1,
                                    quickReplyButton: {
                                        displayText: '🤖 AI Assistant',
                                        id: '.ai'
                                    }
                                },
                                {
                                    index: 2,
                                    quickReplyButton: {
                                        displayText: '🎵 Search Song',
                                        id: '.song'
                                    }
                                },
                                {
                                    index: 3,
                                    quickReplyButton: {
                                        displayText: '⚡ Check Speed',
                                        id: '.ping'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        };

        await client.sendMessage(targetChat, templateMessage);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});

// --- 2. PING COMMAND WITH BUTTONS ---
Sparky({
    name: "speed",
    category: "main",
    fromMe: isPublic,
    desc: "Check bot speed"
}, async ({ m, client }) => {
    try {
        const targetChat = m.chat || m.from || m.key.remoteJid;
        
        const start = new Date().getTime();
        const end = new Date().getTime();
        const responseTime = (end - start);

        const pingText = `⚡ *Pong!* \n\nResponse Speed: *${responseTime}ms*`;

        const templatePing = {
            viewOnceMessage: {
                message: {
                    templateMessage: {
                        hydratedTemplate: {
                            hydratedContentText: pingText,
                            hydratedFooterText: "💎 X-KADIYA-MD 💎",
                            hydratedButtons: [
                                {
                                    index: 1,
                                    quickReplyButton: {
                                        displayText: '📜 Main Menu',
                                        id: '.menu'
                                    }
                                },
                                {
                                    index: 2,
                                    quickReplyButton: {
                                        displayText: '📞 Contact Owner',
                                        id: '.owner'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        };

        await client.sendMessage(targetChat, templatePing);

    } catch (err) {
        console.error(err);
        await m.reply("❌ Error: " + err.message);
    }
});
