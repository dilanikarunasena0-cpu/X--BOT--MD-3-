const { Sparky } = require("../lib");

Sparky({
    name: "cjid",
    alias: ["channeljid", "chjid"],
    category: "utility",
    desc: "WhatsApp Channel හෝ Post Link එකකින් සැබෑ JID එක ලබා ගැනීම.",
    fromMe: false
}, async ({ client, m, text }) => {
    try {
        let channelLink = "";

        // 1. මැසේජ් එකකට රිප්ලයි කර ඇත්නම් (Reply/Quote)
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
            // 2. කෙලින්ම ලින්ක් එක ටයිප් කර ඇත්නම්
            let parts = text.trim().split(/\s+/);
            if (parts[0].includes("whatsapp.com/channel/")) channelLink = parts[0];
        }

        if (!channelLink) {
            return await m.reply(`ℹ️ *Channel JID Finder* ℹ️\n\n` +
                `*භාවිතය:* චැනල් ලින්ක් එකක් හෝ පෝස්ට් ලින්ක් එකක් ඇති මැසේජ් එකකට Reply කරමින් මෙසේ යොදන්න:\n` +
                `👉 .cjid`);
        }

        await m.reply('🔍 වට්සැප් සර්වර් එකෙන් චැනල් ජිඩ් (JID) එක සොයමින් පවතිනවා...');

        // 🚀 [THE FIX] පෝස්ට් ලින්ක් එකක් වුණත් (උදා: /193 කෑල්ල තිබුණත්) ඒක අයින් කරලා Invite Code එක විතරක් ගැනීම
        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        // '/' ලකුණෙන් වෙන් කර පළමු කොටස (Invite Code) පමණක් ලබා ගනී
        let inviteCode = urlClean.split('/')[0];

        let channelJid = null;
        let channelName = "Unknown Channel";

        // ක්‍රමය 01: Raw Query මඟින් සෙවීම
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
        } catch (e) {}

        // ක්‍රමය 02: Standard Metadata API මඟින් (Fallback)
        if (!channelJid) {
            let metadata = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
            if (metadata && metadata.id) {
                channelJid = metadata.id;
                channelName = metadata.name || "WhatsApp Channel";
            }
        }

        // ප්‍රතිඵලය පෙන්වීම
        if (channelJid) {
            let responseMsg = `📢 *WhatsApp Channel තොරතුරු* 📢\n\n` +
                              `• *නම:* ${channelName}\n` +
                              `• *කැපූ කේතය (Invite Code):* ${inviteCode}\n\n` +
                              `📎 *සැබෑ Channel JID:*\n\`${channelJid}\`\n\n` +
                              `_(මෙම JID එක කොපි කරගත හැක)_`;
            return await m.reply(responseMsg);
        } else {
            return await m.reply(`❌ වට්සැප් සර්වර් එක මඟින් මෙම චැනල් එකේ දත්ත ලබාදීම ප්‍රතික්ෂේප කළා. (ලින්ක් එක වැරදි විය හැක)`);
        }

    } catch (error) {
        return await m.reply(`❌ දෝෂයක් සිදු විය: ${error.message}`);
    }
});

