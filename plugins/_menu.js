Sparky({
    name: "menu",
    category: "misc",
    fromMe: isPublic,
    desc: "List all available commands"
}, async ({ client, m, args }) => {
    try {

        if (args) {
            for (let i of plugins.commands) {
                if (i.name.test(args)) {
                    await m.reply(style(`*command : ${args.trim()}*\n*description : ${i.desc.toLowerCase()}*`));
                    return;
                }
            }
            await m.reply(style("_oops command not found_"));
            return;
        }

        let [date, time] = new Date()
            .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
            .split(",");

        let menu = `╭━━━〔${config.BOT_INFO.split(";")[0].toLowerCase()}〕━━>
┃╭━━━━━━━━━━━━━◉
┃┃• owner : ${config.BOT_INFO.split(";")[1].toLowerCase()}
┃┃• mode : ${config.WORK_TYPE.toLowerCase()}
┃┃• prefix : ${m.prefix}
┃┃• platform : ${SERVER}
┃┃• date : ${date}
┃┃• time : ${time}
┃┃• uptime : ${await m.uptime()}
┃┃• plugins : ${commands.length}
┃╰━━━━━━━━━━━━━◉
╰━━━━━━━━━━━━━>\n${readMore}\n\n`;

        let cmnd = [];
        let type = [];

        commands.map((command) => {

            if (!command.name || command.dontAddCommandList) return;

            let name = command.name;
            let cmd;

            try {
                cmd = name.source
                    .split('\\s*')[1]
                    .toString()
                    .match(/(\W*)([A-Za-züşiğ öç1234567890]*)/)[2];
            } catch {
                return;
            }

            let category = command.category
                ? command.category.toLowerCase()
                : "misc";

            cmnd.push({ cmd, category });

            if (!type.includes(category)) type.push(category);
        });

        cmnd.sort();
        type.sort();

        type.forEach((cmmd) => {

            menu += `╭━━━>
┠┌─⭓『 *${cmmd.toUpperCase()}* 』\n`;

            let comad = cmnd.filter(c => c.category == cmmd);
            comad.forEach(({ cmd }) => {
                menu += `┃│• ${cmd.trim()}\n`;
            });

            menu += `┃└─⭓\n╰━━━━>\n`;
        });

        let sperky = {
            key: {
                participants: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
                fromMe: false,
                id: "Hey!"
            },
            message: {
                contactMessage: {
                    displayName: config.BOT_INFO.split(";")[0],
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nEND:VCARD`
                }
            },
            participant: "0@s.whatsapp.net"
        };

        // 🔥 MENU SEND (NO return anywhere)

        if (config.MENU_TYPE.toLowerCase() === "big") {

            await client.sendMessage(m.jid, {
                text: style(menu),
                contextInfo: {
                    externalAdReply: {
                        title: style(`Hey ${m.pushName}!`),
                        body: style(config.BOT_INFO.split(";")[0]),
                        sourceUrl: "https://aswinsparky.qzz.io",
                        mediaType: 1,
                        renderLargerThumbnail: true,
                        thumbnailUrl: config.BOT_INFO.split(";")[2]
                    }
                }
            }, { quoted: m });

        }

        else if (config.MENU_TYPE.toLowerCase() === "image") {

            await m.sendFromUrl(config.BOT_INFO.split(";")[2], {
                caption: style(menu)
            });

        }

        else if (config.MENU_TYPE.toLowerCase() === "small") {

            await client.sendMessage(m.jid, {
                text: style(menu),
                contextInfo: {
                    externalAdReply: {
                        title: style(`Hey ${m.pushName}!`),
                        body: style(config.BOT_INFO.split(";")[0]),
                        sourceUrl: "https://aswinsparky.qzz.io",
                        mediaUrl: "https://aswinsparky.qzz.io",
                        mediaType: 1,
                        renderLargerThumbnail: false,
                        thumbnailUrl: config.BOT_INFO.split(";")[2]
                    }
                }
            }, { quoted: sperky });

        }

        else if (config.MENU_TYPE.toLowerCase() === "document") {

            await client.sendMessage(m.jid, {
                document: { url: 'https://i.ibb.co/pnPNhMZ/2843ad26fd25.jpg' },
                caption: menu,
                mimetype: 'application/zip',
                fileName: config.BOT_INFO.split(";")[0]
            }, { quoted: sperky });

        }

        else if (config.MENU_TYPE.toLowerCase() === "text") {

            await client.sendMessage(m.jid, {
                text: style(menu)
            }, { quoted: sperky });

        }

        else if (config.MENU_TYPE.toLowerCase() === "video") {
 
            await client.sendMessage(m.jid, {
                video: { url: config.BOT_INFO.split(";")[2] },
                caption: style(menu),
                gifPlayback: true
            }, { quoted: sperky });

        }

});
