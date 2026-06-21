const { Sparky } = require("../lib"); // ඔයාගේ alive.js එකේ තියෙන ලින්ක් එකමයි

Sparky({
    name: "creact",
    alias: ["creact", "chreact"],
    category: "utility",
    desc: "WhatsApp Channels සඳහා ස්වයංක්‍රීය ප්‍රතිචාර දැක්වීම.",
    fromMe: false // Public Version
}, async ({ client, m, text }) => {
    try {
        // 1. හිස් ආදාන පරීක්ෂාව
        if (!text || text.trim() === "") {
            return await m.reply(`ℹ️ *Pro Channel React පද්ධතිය* ℹ️\n\n` +
                `*භාවිතය:* .channelreact [Link] , [Emoji] , [Count] , [Delay]\n` +
                `*උදාහරණ:* .channelreact https://whatsapp.com/channel/xxxx , 🔥 , 5 , 1.5`);
        }

        // 2. දත්ත කොමාවෙන් වෙන් කර ගැනීම
        let parts = text.split(',').map(p => p ? p.trim() : '');
        let channelLink = parts[0];
        let emojiInput = parts[1] || '❤️';
        let countInput = parts[2] || '1';
        let delayInput = parts[3] || '1.5';

        if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
            return await m.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් (Link) ඇතුළත් කරන්න.');
        }

        // Safe Parsing
        let count = parseInt(countInput);
        if (isNaN(count) || count <= 0) count = 1;
        if (count > 30) count = 30; // බ්ලොක් වීම වැළැක්වීමට උපරිම 30

        let delaySec = parseFloat(delayInput);
        if (isNaN(delaySec) || delaySec < 0.5) delaySec = 0.5;

        await m.reply('🔄 නාලිකා දත්ත පරීක්ෂා කරමින් පවතිනවා. කරුණාකර රැඳී සිටින්න...');

        let urlClean = channelLink.split('channel/')[1];
        if (!urlClean) return await m.reply('❌ සබැඳියේ ආකෘතිය වැරදියි.');
        
        let linkParts = urlClean.split('/');
        let inviteCode = linkParts[0];
        let specificPostId = linkParts[1];

        // 3. චැනල් මෙටා දත්ත ලබා ගැනීම
        let queryResult = await client.newsletterMetadata('invite', inviteCode).catch(() => null);
        if (!queryResult || !queryResult.id) {
            return await m.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය. පුද්ගලික සබැඳියක් විය හැක.');
        }
        
        let channelJid = queryResult.id;
        let messageId;

        // 4. පෝස්ට් එක තීරණය කිරීම
        if (specificPostId) {
            messageId = parseInt(specificPostId);
        } else {
            let messages = await client.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 }).catch(() => null);
            if (!messages || messages.length === 0) {
                return await m.reply('❌ මෙම නාලිකාව තුළ කිසිදු පණිවිඩයක් සොයා ගැනීමට නොහැකි විය.');
            }
            messageId = messages[0].id;
        }

        let emojiList = Array.from(emojiInput).filter(e => e.trim() !== "");
        if (emojiList.length === 0) emojiList = ['❤️'];

        await m.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය:*\n\n• නාලිකාව: ${queryResult.name}\n• වාර ගණන: ${count}\n• ප්‍රමාදය: තත්පර ${delaySec}`);

        const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // 5. ප්‍රතිචාර යැවීමේ ලූප් එක
        for (let i = 0; i < count; i++) {
            try {
                let selectedEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                await client.sendMessage(channelJid, {
                    react: {
                        text: selectedEmoji,
                        key: { remoteJid: channelJid, id: messageId, fromMe: false }
                    }
                });
            } catch (err) {
                console.error("Loop Error: ", err);
            }
            await customDelay(delaySec * 1000);
        }

        return await m.reply(`✅ *ක්‍රියාවලිය සාර්ථකයි!*`);

    } catch (globalError) {
        console.error("Global Error: ", globalError);
        return await m.reply(`❌ පද්ධතිමය දෝෂයක් සිදු විය: ${globalError.message}`);
    }
});
