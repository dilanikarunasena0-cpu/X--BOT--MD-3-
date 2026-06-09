const { Sparky, isPublic } = require("../lib");

Sparky({
    name: "fwd",
    alias: ["forward", "fv", "sf"],
    category: "utility",
    fromMe: isPublic,
    desc: "Advanced Forward System"
}, async ({ client, m, args }) => {

    const quoted = m.quoted;
    const imageUrl = "https://files.catbox.moe/8gd2kj.jpg";

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

---

💡 *මෙම ප්ලගිනයෙන් (Plugin) ඔබට ලැබෙන ප්‍රයෝජන:*

* 👁️ *ViewOnce Bypass:* "එක් වරක් පමණක් බැලිය හැකි" (View Once) ලෙස එවා ඇති ඡායාරූප හෝ වීඩියෝ සාමාන්‍ය ආකාරයෙන් ඕනෑම අයෙකුට Forward කිරීමට මෙයින් හැකියාව ලැබේ.
* 🚀 *Multi Forwarding:* කොමා ( , ) ලකුණ මඟින් වෙන් කර එකවර දුරකථන අංක හෝ ගෘෘප් කිහිපයකට පණිවිඩ යැවිය හැක.
* 📁 *Media to Document:* ඕනෑම Photo එකක් හෝ Video එකක් Quality එක අඩු නොවී Document (.doc) එකක් ලෙස Forward කළ හැක.
* ✍️ *Custom Caption:* මුල් පණිවිඩයේ ඇති Caption එක වෙනස් කර ඔබ කැමති අලුත් Caption එකක් සමඟ Forward කිරීමට හැකියාව ඇත.

💀 `Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`
        `);
    }

    try {
        let mode = "normal";
        let targetInput;
        let caption = "";

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

        // Ad Context ව්‍යුහය පොදුවේ අර්ථ දැක්වීම
        const externalAdReply = {
            title: "Advanced Forward System",
            body: "Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎",
            thumbnailUrl: imageUrl,
            sourceUrl: "https://whatsapp.com",
            mediaType: 1
        };

        for (const jid of targets) {

            // --- 1. DOCUMENT MODE (.fwd doc) ---
            if (mode === "doc") {
                if (!quoted.download) {
                    await m.reply("❌ මෙය මාධ්‍ය (Media) ගොනුවක් නොවේ. Document ලෙස යැවිය නොහැක.");
                    continue;
                }

                const buffer = await quoted.download();
                await client.sendMessage(jid, {
                    document: buffer,
                    mimetype: quoted.mimetype || "application/octet-stream",
                    fileName: quoted.fileName || `file_${Date.now()}`,
                    contextInfo: { externalAdReply }
                });

                success++;
                continue;
            }

            // --- 2. ViewOnce, Ephemeral ස්ථර ඉවත් කර පණිවිඩයේ සැබෑ අභ්‍යන්තරය ලබා ගැනීම ---
            let rawMessage = JSON.parse(JSON.stringify(quoted.message));
            
            // ViewOnceV2 හෝ Ephemeral වැනි ස්ථර ඇතුළත පණිවිඩය ඇත්නම් එය පිටතට ගැනීම
            if (rawMessage.viewOnceMessageV2) rawMessage = rawMessage.viewOnceMessageV2.message;
            if (rawMessage.viewOnceMessage) rawMessage = rawMessage.viewOnceMessage.message;
            if (rawMessage.ephemeralMessage) rawMessage = rawMessage.ephemeralMessage.message;

            const msgType = Object.keys(rawMessage)[0];
            if (!msgType) continue;

            // ViewOnce flag එක false කිරීම
            if (rawMessage[msgType] && rawMessage[msgType].viewOnce) {
                rawMessage[msgType].viewOnce = false;
            }

            // --- 3. CAPTION CHANGE MODE (.fwd cc) ---
            if (mode === "cc" && caption) {
                if (rawMessage[msgType] && (rawMessage[msgType].caption !== undefined || msgType === "imageMessage" || msgType === "videoMessage")) {
                    rawMessage[msgType].caption = caption;
                } else if (msgType === "conversation" || msgType === "extendedTextMessage") {
                    // Text message එකක් නම් text එක වෙනස් කිරීම
                    if (msgType === "conversation") {
                        rawMessage = { extendedTextMessage: { text: caption } };
                    } else {
                        rawMessage[msgType].text = caption;
                    }
                }
            }

            // ContextInfo ආරක්ෂිතව එකතු කිරීම
            const currentMsgType = Object.keys(rawMessage)[0];
            if (rawMessage[currentMsgType]) {
                rawMessage[currentMsgType].contextInfo = {
                    ...rawMessage[currentMsgType].contextInfo,
                    externalAdReply
                };
            }

            // GenerateMessageFromContent හෝ relayMessage මඟින් වඩාත් ස්ථාවරව පණිවිඩය යැවීම
            await client.relayMessage(jid, rawMessage, {});
            success++;
        }

        // සාර්ථක ප්‍රතිචාරය දක්වන්න (Success Response with Image)
        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        const successText = `
╭━━━〔 FORWARD SUCCESS 〕━━━⬣
┃ 📤 Sent : ${success} / ${targets.length}
┃ 🚀 Mode : ${mode.toUpperCase()}
┃ 👁️ ViewOnce : Bypassed
┃ 💎 Quality : Original
╰━━━━━━━━━━━━━━━━━━⬣

Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        return client.sendMessage(m.jid, {
            image: { url: imageUrl },
            caption: successText
        }, { quoted: m });

    } catch (e) {
        console.log(e);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ Error:\n${e.message}`);
    }
});
