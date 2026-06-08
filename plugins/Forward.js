const { Sparky, isPublic } = require("../lib");
const { generateWAMessageFromContent } = require("@whiskeysockets/baileys");

Sparky({
    name: "fwd",
    alias: ["forward", "fv", "sf"],
    category: "utility",
    fromMe: isPublic,
    desc: "Advanced Forward System"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;

    if (!quoted) {
        return m.reply(`
📤 *Forward Menu*

.fwd
→ Save to yourself

.fwd 9477xxxxxxx
→ Forward to number

.fwd 1203@g.us
→ Forward to group

.fwd doc 9477xxxxxxx
→ Send as document

.fwd cc 9477xxxxxxx New Caption
→ Forward with new caption

.fwd 9477xxxxxxx,9478xxxxxxx
→ Multi Forward
        `);
    }

    try {
        let mode = "normal";
        let targetInput;
        let caption = "";

        // args එක String එකක් නම් Array එකක් බවට පත් කරගැනීම
        const argsArray = Array.isArray(args) ? args : (args ? args.split(" ") : []);

        if (argsArray[0] === "doc" || argsArray[0] === "cc") {
            mode = argsArray[0];
            targetInput = argsArray[1];
            caption = argsArray.slice(2).join(" ");
        } else {
            targetInput = argsArray[0];
            caption = argsArray.slice(1).join(" ");
        }

        if (!targetInput)
            targetInput = m.sender.split("@")[0];

        const targets = targetInput
            .split(",")
            .map(x => x.trim())
            .filter(Boolean)
            .map(x => {
                if (x.endsWith("@g.us")) return x;
                x = x.replace(/\D/g, "");
                return `${x}@s.whatsapp.net`;
            });

        if (targets.length === 0) {
            return m.reply("❌ වලංගු දුරකථන අංකයක් හෝ Group ID එකක් ඇතුළත් කරන්න.");
        }

        await client.sendMessage(m.jid, { react: { text: "📤", key: m.key } });

        let success = 0;

        for (const jid of targets) {

            // --- 1. DOCUMENT MODE ---
            if (mode === "doc") {
                if (!quoted.download) {
                    await m.reply("❌ මෙය මාධ්‍ය (Media) ගොනුවක් නොවේ. Document ලෙස යැවිය නොහැක.");
                    continue;
                }

                const buffer = await quoted.download();
                await client.sendMessage(jid, {
                    document: buffer,
                    mimetype: quoted.mimetype || "application/octet-stream",
                    fileName: quoted.fileName || `file_${Date.now()}`
                });

                success++;
                continue;
            }

            // --- 2. CAPTION CHANGE MODE (.fwd cc) ---
            if (mode === "cc" && caption && quoted.message) {
                const msgType = Object.keys(quoted.message)[0];
                const copied = JSON.parse(JSON.stringify(quoted.message));

                if (copied[msgType]) {
                    // Caption එක වෙනස් කිරීම
                    if (copied[msgType].caption !== undefined || msgType === "imageMessage" || msgType === "videoMessage") {
                        copied[msgType].caption = caption;
                    }
                    
                    // ViewOnce bypass කිරීම (තිබේ නම්)
                    if (copied[msgType].viewOnce) {
                        copied[msgType].viewOnce = false;
                    }

                    await client.sendMessage(jid, { forward: { key: m.quoted.key, message: copied } });
                    success++;
                    continue;
                }
            }

            // --- 3. NORMAL FORWARD MODE (.fwd) ---
            // copyNForward වෙනුවට Baileys නිල forward ක්‍රමය භාවිතය
            if (quoted.message) {
                const msg = await generateWAMessageFromContent(jid, quoted.message, {
                    userJid: client.user.id
                });
                
                // ViewOnce තිබේ නම් එය සාමාන්‍ය මැසේජ් එකක් බවට පත් කරයි
                const msgType = Object.keys(msg.message)[0];
                if (msg.message[msgType] && msg.message[msgType].viewOnce) {
                    msg.message[msgType].viewOnce = false;
                }

                await client.relayMessage(jid, msg.message, { messageId: msg.key.id });
                success++;
            }
        }

        // අවසාන ප්‍රතිචාරය දක්වන්න
        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        return m.reply(`
╭━━━〔 FORWARD SUCCESS 〕━━━⬣
┃ 📤 Sent : ${success} / ${targets.length}
┃ 🚀 Mode : ${mode.toUpperCase()}
┃ 👁️ ViewOnce : Bypassed
┃ 💎 Quality : Original
╰━━━━━━━━━━━━━━━━━━⬣
        `);

    } catch (e) {
        console.log(e);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Error:\n${e.message}`);
    }
});

