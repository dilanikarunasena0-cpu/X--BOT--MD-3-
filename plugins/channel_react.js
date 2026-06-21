const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "Reply කරන ලද ලින්ක් එකේ නියම ID එක සොයාගෙන රියැක්ට් කිරීම (Kadiya MD Verification සමඟ).",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        let channelLink = "";

        if (m.quoted) {
            let contextUrl = m.data?.message?.extendedTextMessage?.contextInfo?.canonicalUrl || 
                             m.msg?.contextInfo?.canonicalUrl;
            if (contextUrl && contextUrl.includes("whatsapp.com/channel/")) {
                channelLink = contextUrl;
            } else if (m.quoted.text && m.quoted.text.includes("whatsapp.com/channel/")) {
                let linkMatch = m.quoted.text.match(/https:\/\/whatsapp\.com\/channel\/[^\s\n]+/);
                if (linkMatch) channelLink = linkMatch[0];
            }
        } else if (text) {
            let parts = text.trim().split(/\s+/);
            if (parts[0].includes("whatsapp.com/channel/")) channelLink = parts[0];
        }

        if (!channelLink) {
            return await m.reply(`ℹ️ *Pro Channel React* ℹ️\n\n` +
                `*භාවිතය:* ලින්ක් මැසේජ් එකට Reply කරමින්:\n` +
                `👉 .creact [Emoji] [Count]\n` +
                `*උදා:* .creact 🥲 10`);
        }

        let parts = text ? text.trim().split(/\s+/) : [];
        let emojiInput = parts[0] || "❤️";
        let countInput = parts[1] || "1";

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 50) count = 50;

        await m.reply('🔄 නාලිකා ආරක්ෂණ පද්ධතිය පරීක්ෂා කරමින් පවතිනවා...');

        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let urlPostId = linkParts[1];

        // 1. චැනල් මෙටා දත්ත (About/Description ඇතුළුව) ලබා ගැනීම
        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
        
        // 🛡️ [KADIYA MD VERIFICATION SECURITY]
        let channelAbout = queryResult.description || "";
        
        // About එක ඇතුළේ "kadiya md" තියෙනවද කියා පරීක්ෂා කිරීම (Case-insensitive)
        if (!channelAbout.toLowerCase().includes("kadiya md")) {
            return await m.reply(`❌ *ආරක්ෂණ දැනුම්දීමයි!* \n\nමෙම නාලිකාවේ 'About' (විස්තරය) තුළ *kadiya md* යන වචනය ඇතුළත් කර නොමැති බැවින් මෙම බොට් විධානය ක්‍රියාත්මක කළ නොහැක.`);
        }

        let channelJid = queryResult.id;
        let messageId = null;

        // 2. සර්වර් එකෙන් මැසේජ් Fetch කිරීම
        let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 30 }).catch(() => null);
        
        if (messages && messages.length > 0) {
            if (urlPostId) {
                let found = messages.find(msg => String(msg.id) === String(urlPostId));
                if (found) {
                    messageId = found.id;
                } else {
                    messageId = messages[0].id;
                }
            } else {
                messageId = messages[0].id;
            }
        }

        if (!messageId) {
            messageId = urlPostId ? parseInt(urlPostId) : 1;
        }

        let selectedEmoji = Array.from(emojiInput)[0] || '❤️';

        await m.reply(`🚀 *ආරක්ෂණ පරීක්ෂාව සාර්ථකයි! ප්‍රතිචාර යැවීම ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name}\n• සැබෑ පෝස්ට් ID: ${messageId}\n• වාර ගණන: ${count}`);

        // 3. රියැක්ෂන් ලූප් එක
        for (let i = 0; i < count; i++) {
            try {
                await client.sendMessage(channelJid, {
                    react: { 
                        text: selectedEmoji, 
                        key: { remoteJid: channelJid, id: messageId, fromMe: false } 
                    }
                });
            } catch (err) {
                try {
                    await client.relayMessage(channelJid, {
                        reactionMessage: {
                            text: selectedEmoji,
                            messageId: messageId,
                            key: { remoteJid: channelJid, fromMe: false, id: messageId }
                        }
                    }, { messageId: client.generateMessageID() });
                } catch (e) {}
            }
        }

        return await m.reply(`✅ *${queryResult.name} පෝස්ට් එකට ප්‍රතිචාර යවා අවසන්!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක්: ${globalError.message}`);
    }
});
