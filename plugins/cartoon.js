const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.DEEPAI_API_KEY;

Sparky({
    name: "cartoon",
    alias: ["toon", "toonify", "anime"],
    category: "ai",
    fromMe: isPublic,
    desc: "Convert your photos into cartoon style using AI"
}, async ({ client, m }) => {

    try {
        // 1. Reply කරපු message එකක් තියෙනවා නම් ඒක quoted වලට ගන්නවා
        const quoted = m.quoted ? m.quoted : null;

        // 2. දැනට එවපු message එක image එකක්ද, නැත්නම් reply කරපු message එක image එකක්ද කියලා හරියටම check කිරීම
        // (මෙහි m.message?.imageMessage හෝ quoted?.type === 'imageMessage' වැනි ක්‍රම මඟින් නිවැරදිව හඳුනාගනී)
        const isCurrentImage = m.image || m.type === 'imageMessage';
        const isQuotedImage = quoted && (quoted.image || quoted.type === 'imageMessage' || quoted.mtype === 'imageMessage');

        if (!isCurrentImage && !isQuotedImage) {
            await client.sendMessage(m.jid, {
                react: { text: "❌", key: m.key }
            });
            return await m.reply("🖼️ කරුණාකර Photo එකක Caption එක ලෙස හෝ Photo එකකට Reply කරලා .cartoon භාවිතා කරන්න.");
        }

        await client.sendMessage(m.jid, {
            react: { text: "⏳", key: m.key }
        });

        // 3. Image එක download කරගැනීම (Reply එකෙන් හෝ කෙලින්ම Caption එකෙන්)
        let buffer;
        if (isCurrentImage) {
            buffer = await m.download();
        } else if (isQuotedImage) {
            buffer = await quoted.download();
        }

        if (!buffer) {
            throw new Error("Could not download image buffer");
        }

        const form = new FormData();
        form.append("image", buffer, {
            filename: "image.jpg"
        });

        // 4. DeepAI Toonify API එකට image එක යැවීම
        const response = await axios.post(
            "https://api.deepai.org/api/toonify",
            form,
            {
                headers: {
                    "api-key": API_KEY,
                    ...form.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 60000
            }
        );

        if (!response.data.output_url) {
            throw new Error("No output image returned");
        }

        // 5. Cartoon වුණු image එක download කරගැනීම
        const cartoonImage = await axios.get(
            response.data.output_url,
            { responseType: "arraybuffer" }
        );

        await client.sendMessage(m.jid, {
            react: { text: "✅", key: m.key }
        });

        // 6. Cartoon photo එක Caption එකත් සමඟ reply එකක් විදිහට යැවීම
        await client.sendMessage(
            m.jid,
            {
                image: Buffer.from(cartoonImage.data),
                caption: `✨ *AI CARTOON GENERATOR*

🎨 Photo Converted to Cartoon Successfully
🚀 Engine: DeepAI Toonify

💡 *විශේෂ උපදෙස:* *මෙම සේවාව වඩාත් සාර්ථකව ක්‍රියාත්මක වන්නේ මිනිස් මුහුණු (Human Faces) පැහැදිලිව පෙනෙන ඡායාරූප සඳහා පමණි.*

❖ Powered By X-KADIYA-MD 💎`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        await client.sendMessage(m.jid, {
            react: { text: "⚠️", key: m.key }
        });
        return await m.reply("⚠️ Cartoon conversion failed. Make sure the photo has a clear face and try again.");
    }
});
