const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

// .env file එක කියවන්න
require("dotenv").config();
const API_KEY = process.env.DEEPAI_API_KEY;

// Baileys හරහා image එක buffer එකක් බවට පත් කරන function එක
async function getMediaBuffer(message, type) {
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

Sparky({
    name: "blur",
    alias: ["upscale", "hd", "enhance", "hq", "4x", "quality"],
    category: "ai",
    fromMe: isPublic,
    desc: "Reply කරපු blur/low quality photo එක AI එකෙන් HD කරන්න"
}, async ({ client, m, args }) => {

    try {
        let buffer;
        let imageMsg = null;

        // 1. Reply කරපු මැසේජ් එකක්ද බලනවා
        if (m.quoted) {
            const quotedMsg = m.quoted.message;
            
            // සාමාන්‍ය Image එකක් නම්
            if (quotedMsg?.imageMessage) {
                imageMsg = quotedMsg.imageMessage;
            } 
            // View Once Image එකක් නම්
            else if (quotedMsg?.viewOnceMessageMessage?.message?.imageMessage) {
                imageMsg = quotedMsg.viewOnceMessageMessage.message.imageMessage;
            } 
            else if (quotedMsg?.viewOnceMessageV2Message?.message?.imageMessage) {
                imageMsg = quotedMsg.viewOnceMessageV2Message.message.imageMessage;
            }
            // Link Preview එකක් අස්සේ තියෙන Image එකක් නම්
            else if (quotedMsg?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
                imageMsg = quotedMsg.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
            }
        } 
        // 2. ඩිරෙක්ට් එවපු image එකක් නම්
        else if (m.mtype === 'imageMessage') {
            imageMsg = m.message.imageMessage;
        } 
        else if (m.mtype === 'viewOnceMessageV2' && m.message?.viewOnceMessageV2Message?.message?.imageMessage) {
            imageMsg = m.message.viewOnceMessageV2Message.message.imageMessage;
        }

        // Photo එකක් හොයාගන්න බැරි වුනොත්
        if (!imageMsg) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return m.reply("🖼️ කරුණාකර Blur Photo එකකට Reply කරලා *.blur* හෝ *.upscale* භාවිතා කරන්න.");
        }

        // Loading React එක දානවා
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });

        // Baileys හරහා Image එක Buffer එකකට Download කරගන්නවා
        buffer = await getMediaBuffer(imageMsg, 'image');

        if (!buffer || buffer.length === 0) throw new Error("Image download failed (Buffer Empty)");

        // API Key එක චෙක් කරනවා
        if (!API_KEY) {
            return m.reply("⚠️ API Key missing!\n\n`.env` file එකේ මේක දාගන්න:\n`DEEPAI_API_KEY=ඔයාගේ_key_එක`\n\n*(නැත්නම් බොට්ව රීස්ටාර්ට් කරන්න)*");
        }

        const form = new FormData();
        form.append("image", buffer, { filename: "image.jpg" });

        // DeepAI Torch SRGAN API Call
        const response = await axios.post(
            "https://api.deepai.org/api/torch-srgan",
            form,
            {
                headers: {
                    "api-key": API_KEY,
                    ...form.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 120000
            }
        );

        if (!response.data?.output_url) {
            throw new Error("API එකෙන් image එක ආවේ නෑ");
        }

        // HD Image එක Download කරගන්නවා
        const hdImageResponse = await axios.get(response.data.output_url, { responseType: "arraybuffer" });
        const hdBuffer = Buffer.from(hdImageResponse.data);

        // Success React
        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        // HD කරපු Photo එක සෙන්ඩ් කරනවා
        await client.sendMessage(
            m.jid,
            {
                image: hdBuffer,
                caption: "*✨ DeepAI මඟින් සාර්ථකව HD කරන ලදි!*"
            },
            { quoted: m }
        );

    } catch (error) {
        console.error(error);
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        return m.reply(`❌ දෝෂයක් සිදුවුණා: ${error.message || error}`);
    }
});

