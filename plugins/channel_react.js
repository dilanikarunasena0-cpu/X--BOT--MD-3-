const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "Channel JID එකක් හරහා පෝස්ට් සියල්ලටම ප්‍රතිචාර දැක්වීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        if (!text) {
            return await m.reply(`ℹ️ *Pro Channel Mass React* ℹ️\n\n` +
                `*භාවිතය:* .creact [Channel_JID] [Emoji] [Count]\n\n` +
                `*උදාහරණ:* \n` +
                `👉 .creact 120363294729184729@newsletter 💗 5`);
        }

        // input දත්ත වෙන් කර ගැනීම
        let parts = text.trim().split(/\s+/);
        let channelJid = parts[0];
        let emoji = parts[1] || "❤️";
        let countInput = parts[2] || "1";

        // වලංගු චැනල් JID එකක්දැයි බැලීම
        if (!channelJid.includes('@newsletter')) {
            return await m.reply('❌ කරුණාකර වලංගු WhatsApp Channel JID (@newsletter) එකක් ඇතුළත් කරන්න. (.cjid කමාන්ඩ් එකෙන් JID එක ලබාගන්න)');
        }

        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 20) count = 20; // සර්වර් එකෙන් බ්ලොක් නොවීමට උපරිම සීමාව 20 කි

        await m.reply('🔄 නාලිකාවේ ඇති පෝස්ට් (Messages) ලැයිස්තුව සර්වර් එකෙන් ලබාගනිමින් පවතිනවා...');

        // 1. Raw Query මඟින් චැනල් එකේ දැනට තියෙන පෝස්ට් (මැසේජ්) ලැයිස්තුව කියවීම
        let messageIds = [];
        try {
            let response = await client.query({
                tag: 'newsletter',
                attrs: { type: 'get', jid: channelJid },
                content: [{ tag: 'messages', attrs: { count: '30' } }] // පෝස්ට් 30ක් දක්වා කියවයි
            });

            let messagesNode = response?.content?.[0]?.content || [];
            for (let msg of messagesNode) {
                if (msg.attrs && msg.attrs.id) {
                    messageIds.push(msg.attrs.id);
                }
            }
        } catch (e) {
            return await m.reply(`❌ නාලිකාවේ පණිවිඩ කියවීමට නොහැකි විය: ${e.message}`);
        }

        if (messageIds.length === 0) {
            return await m.reply('❌ මෙම නාලිකාව තුළ රියැක්ට් කිරීමට කිසිදු පෝස්ට් එකක් සොයා ගැනීමට නොහැකි විය.');
        }

        let selectedEmoji = Array.from(emoji)[0] || '❤️';

        await m.reply(`🚀 *Mass React සක්‍රියයි!* \n\n• පෝස්ට් ගණන: ${messageIds.length}\n• ඉමෝජිය: ${selectedEmoji}\n• එක් පෝස්ට් එකකට වාර: ${count}\n\nරියැක්ට් කිරීම ආරම්භ කළා...`);

        // 2. 🚀 [MASS REACT LOOP] හැම පෝස්ට් එකකටම ඔයා දුන්නු Count එකට රියැක්ට් කිරීම
        for (let messageId of messageIds) {
            for (let i = 0; i < count; i++) {
                try {
                    // Raw Protocol Node Injection (Fastest & Safest)
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
                    // Fallback Standard Method
                    try {
                        await client.sendMessage(channelJid, {
                            react: { text: selectedEmoji, key: { remoteJid: channelJid, id: parseInt(messageId), fromMe: false } }
                        });
                    } catch (err) {}
                }
            }
        }

        return await m.reply(`✅ *නාලිකාවේ පෝස්ට් ${messageIds.length} ටම සාර්ථකව වාර ${count} බැගින් ප්‍රතිචාර යවා අවසන්!*`);

    } catch (globalError) {
        return await m.reply(`❌ දෝෂයක්: ${globalError.message}`);
    }
});

