// බොටාගේ මතකය තුළ Auto-React status එක තබා ගැනීමට (In-Memory Storage)
if (!global.autoChannelReact) {
    global.autoChannelReact = { enabled: false, channelJid: '', emojis: ['❤️'] };
}

export default {
    name: 'channelreact',
    category: 'owner',
    description: 'WhatsApp Channels සඳහා වන උපරිම මට්ටමේ ස්වයංක්‍රීය ප්‍රතිචාර පද්ධතිය.',
    usage: '.channelreact [සබැඳිය/ක්‍රියාව] , [ඉමෝජි] , [වාර ගණන/පෝස්ට් ගණන] , [ප්‍රමාදය]',

    function: async (instance, message, { text, prefix, command }) => {
        
        // 1. බොට් හිමිකරු පරීක්ෂාව
        if (!message.isOwner) {
            return message.reply('⚠️ මෙම විශේෂාංගය භාවිත කළ හැක්කේ බොට් හිමිකරුට (Bot Owner) පමණි.');
        }

        // 2. ආදාන දත්ත පරීක්ෂාව සහ උපදෙස් පැනලය
        if (!text) {
            return message.reply(`🔥 *Ultimate Pro Channel React පද්ධතිය* 🔥\n\n` +
                `*⚙️ ක්‍රමවේද සහ භාවිත වන ආකාරය:*\n\n` +
                `*1. සාමාන්‍ය ක්‍රමය (නවතම හෝ නිශ්චිත පෝස්ට් එකකට):*\n` +
                `Format: \`${prefix}${command} [Link] , [Emoji] , [Count] , [Delay]\`\n` +
                `Ex: \`${prefix}${command} https://whatsapp.com/channel/xxxx , 🔥 , 5 , 1.5\`\n\n` +
                `*2. පෝස්ට් කිහිපයකට එකවර (Multi-Post Target):*\n` +
                `අලුත්ම පෝස්ට් 3කට එකවර රියැක්ට් කිරීමට (Count එක 1 ලෙස තබා ගන්න):\n` +
                `Ex: \`${prefix}${command} https://whatsapp.com/channel/xxxx , 👍 , 3-posts , 2\`\n\n` +
                `*3. ස්වයංක්‍රීය ක්‍රමය (Auto-React Mode On/Off):*\n` +
                `චැනල් එකට දාන හැම පෝස්ට් එකකටම ඔටෝ රියැක්ට් වීමට ක්‍රියාත්මක කිරීම:\n` +
                `Ex: \`${prefix}${command} auto-on https://whatsapp.com/channel/xxxx , ❤️🔥\`\n` +
                `Ex: \`${prefix}${command} auto-off\``);
        }

        let parts = text.split(',').map(p => p.trim());
        let modeOrLink = parts[0];

        // --- AUTO REACT MODE HANDLING ---
        if (modeOrLink.toLowerCase() === 'auto-off') {
            global.autoChannelReact.enabled = false;
            return message.reply('🛑 ස්වයංක්‍රීය චැනල් ප්‍රතිචාර (Auto-React Mode) අක්‍රීය කරන ලදී.');
        }

        if (modeOrLink.toLowerCase().startsWith('auto-on')) {
            let channelLink = modeOrLink.split(' ')[1];
            let emojis = parts[1] ? Array.from(parts[1]) : ['❤️'];

            if (!channelLink || !channelLink.includes('whatsapp.com/channel/')) {
                return message.reply('❌ කරුණාකර auto-on සමඟ වලංගු චැනල් සබැඳියක් ඇතුළත් කරන්න.\nEx: `.channelreact auto-on [link] , ❤️🔥`');
            }

            try {
                let inviteCode = channelLink.split('channel/')[1];
                let queryResult = await instance.conn.newsletterMetadata('invite', inviteCode);
                if (!queryResult?.id) return message.reply('❌ නාලිකාව සොයාගත නොහැකි විය.');

                global.autoChannelReact = { enabled: true, channelJid: queryResult.id, emojis: emojis };
                return message.reply(`✅ *Auto-React සක්‍රීය කරන ලදී!*\n\n*නාලිකාව:* ${queryResult.name}\n*ප්‍රතිචාර ඉමෝජි:* ${emojis.join(' ')}\n\nදැන් මෙම චැනල් එකට වැටෙන සෑම නව පෝස්ට් එකකටම බොටා ස්වයංක්‍රීයව ප්‍රතිචාර දක්වනු ඇත.`);
            } catch (e) {
                return message.reply(`❌ දෝෂයක් සිදු විය: ${e.message}`);
            }
        }
        // ---------------------------------

        // සාමාන්‍ย සහ Multi-Post ක්‍රම සඳහා දත්ත වෙන් කිරීම
        let channelLink = parts[0];
        let emojiInput = parts[1] || '❤️';
        let countInput = parts[2] || '1';
        let delaySec = parseFloat(parts[3]) || 1.5;

        if (!channelLink.includes('whatsapp.com/channel/')) {
            return message.reply('❌ කරුණාකර වලංගු WhatsApp Channel සබැඳියක් ඇතුළත් කරන්න.');
        }

        try {
            message.reply('🔄 පද්ධති දත්ත සහ නාලිකා ඉතිහාසය පරීක්ෂා කරමින් පවතිනවා...');

            let linkParts = channelLink.split('channel/')[1].split('/');
            let inviteCode = linkParts[0];
            let specificPostId = linkParts[1];

            let queryResult = await instance.conn.newsletterMetadata('invite', inviteCode);
            if (!queryResult || !queryResult.id) return message.reply('❌ නාලිකාව සොයා ගැනීමට නොහැකි විය.');
            let channelJid = queryResult.id;

            let targetMessages = [];
            let isMultiPost = countInput.toLowerCase().includes('posts');
            let reactionCount = 1;

            // පෝස්ට් ලබා ගැනීමේ තර්කය
            if (specificPostId) {
                targetMessages.push({ id: parseInt(specificPostId) });
            } else if (isMultiPost) {
                let postLimit = parseInt(countInput.split('-')[0]) || 1;
                let fetched = await instance.conn.fetchMessagesFromNewsletter({ jid: channelJid, count: postLimit });
                if (fetched) targetMessages = fetched;
            } else {
                reactionCount = parseInt(countInput) || 1;
                let fetched = await instance.conn.fetchMessagesFromNewsletter({ jid: channelJid, count: 1 });
                if (fetched && fetched.length > 0) targetMessages.push(fetched[0]);
            }

            if (targetMessages.length === 0) {
                return message.reply('❌ පණිවිඩ කිසිවක් සොයා ගැනීමට නොහැකි විය.');
            }

            let emojiList = Array.from(emojiInput);
            let startTime = Date.now();

            message.reply(`🚀 *ප්‍රතිචාර ක්‍රියාවලිය ආරම්භ විය*\n\n*නාලිකාව:* ${queryResult.name}\n*පෝස්ට් ගණන:* ${targetMessages.length}\n*ප්‍රමාද කාලය:* තත්පර ${delaySec}`);

            const customDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // ප්‍රතිචාර දැක්වීමේ ප්‍රධාන ලූප් එක
            for (let msg of targetMessages) {
                for (let i = 0; i < reactionCount; i++) {
                    let selectedEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
                    
                    await instance.conn.sendMessage(channelJid, {
                        react: {
                            text: selectedEmoji,
                            key: { remoteJid: channelJid, id: msg.id, fromMe: false }
                        }
                    });
                    await customDelay(delaySec * 1000);
                }
            }

            // සාරාංශ වාර්තාව (Log Report)
            let endTime = Date.now();
            let totalTime = ((endTime - startTime) / 1000).toFixed(1);

            return message.reply(`✅ *ක්‍රියාවලිය සාර්ථකව නිම කරන ලදී!*\n\n*📊 සාරාංශ වාර්තාව:*\n• නාලිකාව: ${queryResult.name}\n• ප්‍රතිචාර දැක්වූ පෝස්ට් ගණන: ${targetMessages.length}\n• ගත වූ මුළු කාලය: තත්පර ${totalTime}\n• තත්ත්වය: සාර්ථකයි`);

        } catch (error) {
            console.error('Pro Channel React Error:', error);
            return message.reply(`❌ පද්ධතිමය දෝෂයක් සිදු විය:\n\`${error.message || error}\``);
        }
    }
};

// --- AUTO-REACT සඳහා වන අමතර කොටස (EVENT LISTENER) ---
// මෙම කොටස ඔයාගේ බොටාගේ මැසේජ් ලැයිස්තුගත කරන ප්‍රධාන ෆයිල් එකේ (උදා: `index.js` හෝ `connection` event එක ඇතුළේ) 
// newsletter පණිවිඩ ලැබෙන තැනට එකතු කරන්න අවශ්‍ය වේ:
/*
conn.ev.on('messages.upsert', async (chatUpdate) => {
    if (global.autoChannelReact?.enabled) {
        const msg = chatUpdate.messages[0];
        if (msg.key.remoteJid === global.autoChannelReact.channelJid) {
            let randomEmoji = global.autoChannelReact.emojis[Math.floor(Math.random() * global.autoChannelReact.emojis.length)];
            await conn.sendMessage(global.autoChannelReact.channelJid, {
                react: { text: randomEmoji, key: msg.key }
            });
        }
    }
});
*/
