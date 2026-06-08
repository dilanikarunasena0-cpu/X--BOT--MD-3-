const { Sparky, isPublic } = require("../lib");

Sparky({
    name: "forward",
    alias: ["forward", "fv", "sf"],
    category: "utility",
    fromMe: isPublic,
    desc: "Pro Forward - Caption, Doc, ViewOnce bypass + Multi target"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;
    if (!quoted) {
        return m.reply(`📎 **Pro Forward Commands**

**1.** *.fwd* → ඔයාටම save
**2.** *.fwd 9477xxxxxxx* → Number එකට
**3.** *.fwd 1203@g.us* → Group එකට
**4.** *.fwd doc 9477* → Document විදිහට
**5.** *.fwd cc 9477* → Caption එක්කම forward
**6.** *.fwd 9477,9478* → එකපාර 2කට forward

💎 *ViewOnce, Sticker, Audio, Apk සේරම support*`);
    }

    let target = args[0];
    let option = args[1];
    let caption = args.slice(2).join(" ");

    if (!target) target = m.sender;

    // Multi target support: 9477,9478,1203@g.us
    let targets = target.split(',').map(t => {
        t = t.trim();
        if (t.includes('@g.us')) return t;
        return t.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    });

    await client.sendMessage(m.jid, { react: { text: "📤", key: m.key } });

    try {
        let successCount = 0;

        for (let targetJid of targets) {
            let forwardMsg = quoted;

            // Option 1: Document විදිහට forward
            if (option === 'doc') {
                let buffer = await quoted.download();
                let mimetype = quoted.mimetype || 'application/octet-stream';
                let filename = quoted.fileName || 'file.bin';

                await client.sendMessage(targetJid, {
                    document: buffer,
                    mimetype: mimetype,
                    fileName: filename,
                    caption: caption || ''
                });
                successCount++;
                continue;
            }

            // Option 2: Caption Change කරලා forward
            if (option === 'cc' && caption) {
                forwardMsg = {
                   ...quoted,
                    message: {
                       ...quoted.message,
                        [Object.keys(quoted.message)[0]]: {
                           ...quoted.message[Object.keys(quoted.message)[0]],
                            caption: caption
                        }
                    }
                };
            }

            // Normal forward - No Download
            await client.copyNForward(targetJid, forwardMsg, true, {
                readViewOnce: true,
                contextInfo: { isForwarded: true }
            });
            successCount++;
        }

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        await m.reply(`✅ **Forward Success!**

📤 **Sent to:** ${successCount} target(s)
🚀 **Mode:** ${option === 'doc'? 'Document' : 'Direct Forward'}
⚡ **ViewOnce:** Bypassed
💎 **Quality:** Original

*X-KADIYA-MD Pro Forward*`);

    } catch (err) {
        console.error(err);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return m.reply(`⚠️ **Error:** ${err.message}`);
    }
});
