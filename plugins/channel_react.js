const { Sparky } = require("../lib");

Sparky({
    name: "channelreact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "Raw Query මඟින් චැනල් JID එක ලබාගෙන සෘජුවම රියැක්ට් කිරීම.",
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
            return await m.reply(`ℹ️ *Pro Channel React (Core Fixed)* ℹ️\n\n` +
                `*භාවිතය:* ලින්ක් මැසේජ් එකට Reply කරමින්:\n` +
                `👉 .creact [Emoji] [Count]\n` +
                `*උදා:* .creact 💗 10`);
        }

        let parts = text ? text.trim().split(/\s+/) : [];
        let emojiInput = parts[0] || "❤️";
        let countInput = parts[1] || "1";

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 50) count = 50;

        await m.reply('🔄 සර්වර් ප්‍රොටොකෝල් හරහා නාලිකාව සොයමින් පවතිනවා...');

        // ලින්ක් එකෙන් invite code එක කැපීම
        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let urlPostId = linkParts[1];

        let channelJid = null;
        let channelName = "WhatsApp Channel";

        // 🚀 [THE CRITICAL FIX] Metadata API එක වැඩ නැති නිසා Raw XML Query එකක් මඟින් චැනල් JID එක ඇදීම
        try {
            let res = await client.query({
                tag: 'newsletter',
                attrs: { type: 'get', jid: 's.whatsapp.net' },
                content: [{ tag: 'invite', attrs: { code: inviteCode } }]
            });
            
            if (res && res.content && res.content[0]) {
                channelJid = res.content[0].attrs.id;
                channelName = res.content[0].attrs.name || "WhatsApp Channel";
            }
        } catch (e) {
            // ක්‍රමය 2: Fallback JID Prediction (සමහර බොට්ස් වල invite code එක @newsletter වලට කෙලින්ම මැප් වේ)
            channelJid = inviteCode.includes('@newsletter') ? inviteCode : null;
        }

        // තවමත් JID එක නැත්නම් පරණ ක්‍රමයට ට්‍රයි කිරීම
        if (!channelJid) {
            let oldMeta = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
            if (oldMeta && oldMeta.id) {
                channelJid = oldMeta.id;
                channelName = oldMeta.name || "WhatsApp Channel";
            }
        }

        if (!channelJid) return await m.reply('❌ සර්වර් එක මඟින් නාලිකාවේ අනන්‍යතාවය (JID) හඳුනා ගැනීමට නොහැකි විය.');

        // Auto-Follow
        try {
            await client.newsletter('follow', channelJid).catch(() => null);
        } catch (e) {}

        let messageId = urlPostId ? parseInt(urlPostId) : 1;
        let selectedEmoji = Array.from(emojiInput)[0] || '❤️';

        await m.reply(`🚀 *සම්බන්ධතාවය සාර්ථකයි! ප්‍රතිචාර යැවීම ආරම්භ විය:*\n\n• නාලිකාව: ${channelName}\n• පෝස්ට් ID: ${messageId}\n• වාර ගණන: ${count}`);

        // 🚀 Binary Node Injection මඟින් කෙලින්ම සර්වර් එකට රියැක්ෂන් තල්ලු කිරීම
        for (let i = 0; i < count; i++) {
            try {
                await client.query({
                    tag: 'message',
                    attrs: { to: channelJid, type: 'reaction', id: client.generateMessageID() },
                    content: [{
                        tag: 'reaction',
                        attrs: { 
                            text: selectedEmoji, 
                            type: 'add', 
                            encMsgId: messageId.toString(),
                            fromMe: 'false'
                        }
                    }]
                });
            } catch (rawError) {
                try {
                    await client.sendMessage(channelJid, {
                        react: { text: selectedEmoji, key: { remoteJid: channelJid, id: messageId, fromMe: false } }
                    });
                } catch (err) {}
            }
        }

        return await m.reply(`✅ *${channelName} පෝස්ට් එකට ප්‍රතිචාර යවා අවසන්!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක් සිදු විය: ${globalError.message}`);
    }
});

