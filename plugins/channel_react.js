const { Sparky } = require("../lib");

Sparky({
    name: "creact",
    alias: ["channelreact"],
    category: "utility",
    desc: "Channel Mass React - උසස් ඉන්පුට් පාර්සර් එකක් සමඟ.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        // [FIX] ඉන්පුට් එක පිරිසිදු කිරීම (අදෘශ්‍යමාන ඉඩකඩම් ඉවත් කිරීම)
        let cleanText = text.replace(/[\n\r]/g, ' ').trim();
        let parts = cleanText.split(/\s+/);

        if (parts.length < 3) {
            return await m.reply(`❌ *වැරදි ආකෘතියකි!*\n\nපාවිච්චි කරන්න:\n*.creact [JID] [Emoji] [Count]*\n\nඋදා:\n.creact 120363294729184729@newsletter ❤️ 5`);
        }

        let channelJid = parts[0];
        let emoji = parts[1];
        let count = parseInt(parts[2]);

        if (!channelJid.includes('@newsletter')) {
            return await m.reply('❌ JID එකේ @newsletter කොටසක් නැත. නිවැරදි JID එකක් ලබාදෙන්න.');
        }

        await m.reply(`🔍 *ප්‍රතිචාර යැවීම ආරම්භ කරනවා...*\nJID: ${channelJid}`);

        let messageIds = [];
        try {
            let response = await client.query({
                tag: 'newsletter',
                attrs: { type: 'get', jid: channelJid },
                content: [{ tag: 'messages', attrs: { count: '20' } }]
            });
            
            let nodes = response?.content?.[0]?.content || [];
            nodes.forEach(n => { if (n.attrs && n.attrs.id) messageIds.push(n.attrs.id); });
        } catch (e) {
            return await m.reply('❌ නාලිකා පණිවිඩ කියවීමට නොහැකි විය.');
        }

        if (messageIds.length === 0) return await m.reply('❌ රියැක්ට් කිරීමට පෝස්ට් කිසිවක් හමු නොවීය.');

        for (let mid of messageIds) {
            for (let i = 0; i < count; i++) {
                try {
                    await client.query({
                        tag: 'message',
                        attrs: { to: channelJid, type: 'reaction', id: client.generateMessageID() },
                        content: [{ tag: 'reaction', attrs: { text: emoji, type: 'add', encMsgId: mid, fromMe: 'false' } }]
                    });
                } catch (e) {}
            }
        }

        await m.reply(`✅ *සාර්ථකයි! පෝස්ට් ${messageIds.length} ක් සඳහා ප්‍රතිචාර යවා අවසන්.*`);

    } catch (e) {
        await m.reply(`❌ දෝෂයක්: ${e.message}`);
    }
});
