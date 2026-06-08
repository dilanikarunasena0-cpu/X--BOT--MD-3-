const { Sparky, isPublic, downloadMediaMessage } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.DEEPAI_API_KEY;

Sparky({
    name: "blur",
    alias: ["upscale", "hd", "enhance", "hq", "4x", "quality"],
    category: "ai",
    fromMe: isPublic,
    desc: "Reply කරපු blur/low quality photo එක AI එකෙන් HD කරන්න"
}, async ({ client, m, args }) => {

    try {
        let buffer;
        let messageType;

        // 1. Reply කරපු msg එක check කරනවා
        if (m.quoted) {
            messageType = m.quoted.mtype || Object.keys(m.quoted.message || {})[0];

            if (messageType === 'imageMessage' || messageType === 'viewOnceMessageV2' || messageType === 'viewOnceMessage') {
                await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
                buffer = await downloadMediaMessage(m.quoted, 'buffer');
            } else {
                return m.reply("🖼️ Photo එකකට විතරයි Reply කරන්න පුලුවන් මචන්");
            }
        }
        // 2. Direct image එකක් එව්වද
        else if (m.mtype === 'imageMessage' || m.mtype === 'viewOnceMessageV2') {
            await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
            buffer = await downloadMediaMessage(m, 'buffer');
        }
        else {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return m.reply("🖼️ කරුණාකර Blur Photo එකකට Reply කරලා *.blur* හෝ *.upscale* භාවිතා කරන්න.");
        }

        if (!buffer) throw new Error("Image download failed");

        // API Key check
        if (!API_KEY) {
            return m.reply("⚠️ API Key missing!\n\n`.env` file එකේ මේක දාගන්න:\n`DEEPAI_API_KEY=ඔයාගේ_key_එක`");
        }

        const form = new FormData();
        form.append("image", buffer, { filename: "image.jpg" });

        // DeepAI Torch SRGAN API
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

        // HD image download
        const hdImage = await axios.get(response.data.output_url, { responseType: "arraybuffer" });

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        await client.sendMessage(
            m.jid,
            {
                image: Buffer.from(hdImage.data),
                caption: `✨ *AI BLUR REMOVER PRO*

🖼️ Blur Remove + HD Upgrade
🚀 Engine: DeepAI Torch SRGAN
📈 Scale: 4x AI Upscale
💎 Result: Crystal Clear Detail

💡 *Blur photo, Pixelated, Old images වලට Best*

❖ Powered By X-KADIYA-MD 💎`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });

        let errorMsg = err.response?.data?.err || err.message;

        if (errorMsg.includes("Invalid API key")) {
            errorMsg = "API Key එක වැරදියි. DeepAI එකේ key එක හරියට දාගන්න";
        } else if (errorMsg.includes("Daily quota")) {
            errorMsg = "Daily limit ඉවරයි. හෙට try කරපන්";
        }

        return m.reply(`⚠️ Blur remove failed!\n\n*Error:* ${errorMsg}\n\n*Fix:*\n1. `.env` එකේ API key හරියට දාගන්න\n2. Photo එක 5MB ට අඩු JPG/PNG එකක් වෙන්න ඕන`);
    }
});
