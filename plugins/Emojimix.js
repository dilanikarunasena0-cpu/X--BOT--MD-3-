module.exports = {
    name: "emix",
    aliases: ["emojimix", "mix"],
    category: "fun",
    desc: "Mix two emojis into a sticker",

    async execute(sock, m, args) {
        const footer = `
━━━━━━━━━━━━━━━
❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀 𝐌𝐃 💎
━━━━━━━━━━━━━━━`;

        try {
            let emoji1, emoji2;

            const input = args.join(" ").trim();

            if (input.includes("+")) {
                [emoji1, emoji2] = input.split("+").map(v => v.trim());
            } else {
                emoji1 = args[0];
                emoji2 = args[1];
            }

            if (!emoji1 || !emoji2) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        text: `🎭 *Emoji Mix*

📌 Examples:
.emix 🥲 ❤️‍🩹
.emix 😍+🔥
.mix 🤖+💀${footer}`
                    },
                    { quoted: m }
                );
            }

            await sock.sendMessage(m.key.remoteJid, {
                react: {
                    text: "⏳",
                    key: m.key
                }
            });

            const stickerUrl =
                `https://emojik.vercel.app/s/${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}?size=512`;

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    sticker: {
                        url: stickerUrl
                    }
                },
                { quoted: m }
            );

            // Success message
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `✅ *Emoji Mix Completed!*

🎭 Emojis: ${emoji1} + ${emoji2}
🖼️ Sticker generated successfully.${footer}`
                },
                { quoted: m }
            );

            await sock.sendMessage(m.key.remoteJid, {
                react: {
                    text: "✅",
                    key: m.key
                }
            });

        } catch (err) {
            console.error(err);

            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `❌ *Emoji Mix Failed*

• Emoji pair not supported
• API unavailable
• Invalid emoji combination

Try another emoji combination.${footer}`
                },
                { quoted: m }
            );

            await sock.sendMessage(m.key.remoteJid, {
                react: {
                    text: "❌",
                    key: m.key
                }
            });
        }
    }
};
