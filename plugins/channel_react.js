const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "WhatsApp Channels සඳහා ස්වයංක්‍රීය ප්‍රතිචාර දැක්වීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        if (!text || text.trim() === "") {
            return await m.reply(`ℹ️ *Pro Channel React පද්ධතිය* ℹ️\n\n` +
                `*භාවිතය:* .creact [Link] [Emoji] [Count] [Delay]\n` +
                `*උදාහරණ:* .creact https://whatsapp.com/channel/xxxx ❤️ 5 1.5`);
        }

        // පේළි බිඳීම් (New lines) සියල්ල සාමාන්‍ය හිස්තැන් බවට පත් කිරීම
        let cleanText = text.replace(/\n/g, " ").trim();
        let parts = cleanText.split(/\s+/);
        
        let channelLink = parts[0];
        let emojiInput = parts[1] || '❤️';
        let countInput = parts[2] || '1';
        let delayInput = parts[3] || '1.5';

        if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
            return await m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් ඇතුළත් කරන්න.');
        }

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 30) count = 30;

        let delaySec = parseFloat(delayInput);
        if (isNaN(delaySec) || delaySec < 0.5) delaySec = 0.5;

        await m.reply('🔄 නාලිකා දත්ත පරීක්ෂා කරමින් පවතිනවා...');

        // RegExp එකක් භාවිතයෙන් වඩාත් ආරක්ෂිතව ලින්ක් එකෙන් දත්ත වෙන් කර ගැනීම
        let match = channelLink.match(/channel\/([^\/]+)(?:\/(\d+))?/);
        if (!match) return await m.reply('❌ සබැඳියේ ආකෘතිය වැရදියි.');

        let inviteCode = match[1];
        let specificPostId = match[2];

        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) {
            return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
        }
        
        let channelJid = queryResult.id;
        let messageId;

        if (specificPostId) {
            messageId = parseInt(specificPostId);
        } else {
            let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
            if (!messages || messages.length === 0) {
                return await m.reply('❌ මෙම නාලිකාව තුළ පණිවිඩ කිසිවක් නැත.');
            }
            messageId = messages[0].id;
        }

        let emojiList = Array.from(emojiInput).filter(e => e.trim() !== "");
        if (emojiList.length === 0) emojiList = ['❤️'];

        await m.reply(`🚀 *ප්‍රතිචාර යැවීම ආරම්භ කළා:*\nනාලිකාව: ${queryResult.name}\nවාර ගණන: ${count}`);

        const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < count; i++) {
            let selectedEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
            let success = false;

            try {
                await client.sendMessage(channelJid, {
                    react: {
                        text: selectedEmoji,
                        key: { remoteJid: channelJid, id: messageId, fromMe: false }
                    }
                });
                success = true;
            } catch (err) {}

            if (!success) {
                try {
                    await client.relayMessage(channelJid, {
                        reactionMessage: {
                            text: selectedEmoji,
                            messageId: messageId,
                            key: { remoteJid: channelJid, fromMe: false, id: messageId }
                        }
                    }, { messageId: client.generateMessageID() });
                } catch (err2) {}
            }
            await customDelay(delaySec * 1000);
        }

        return await m.reply(`✅ *ක්‍රියාවලිය සාර්ථකයි!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක්: ${globalError.message}`);
    }
});

