const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.DEEPAI_API_KEY; // .env file එකෙන් ගන්නවා

Sparky({
    name: "upscale",
    alias: ["hd", "enhance", "hq", "4x", "quality"],
    category: "ai",
    fromMe: isPublic,
    desc: "Reply කරපු low quality photo එක AI එකෙන් HD කරන්න"
}, async ({ client, m }) => {

    try {
        // 1. Reply කරපු message එකක් තියෙනවා නම් ඒක quoted වලට ගන්නවා
        const quoted = m.quoted ? m.quoted : null;

        // 2. Image එකක්ද කියලා check කිරීම
        const isCurrentImage = m.image || m.type === 'imageMessage';
        const isQuotedImage = quoted && (quoted.image || quoted.type === 'imageMessage' || quoted.mtype === 'imageMessage');

        if (!isCurrentImage && !isQuotedImage) {
            await client.sendMessage(m.jid, {
                react: { text: "❌", key: m.key }
            });
            return await m.reply("🖼️ කරුණාකර Blur Photo එකකට Reply කරලා *.upscale* හෝ *.hd* භාවිතා කරන්න.");
        }

        // API Key check
        if (!API_KEY) {
            return m.reply("⚠️ API Key missing! `.env` file එකේ `DEEPAI_API_KEY=your_key` කියලා දාගන්න");
        }

        await client.sendMessage(m.jid, {
            react: { text: "⏳", key: m.key }
        });

        // 3. Image එක download කරගැනීම
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

        // 4. DeepAI Torch SRGAN API එකට image එක යැවීම
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
                timeout: 90000
            }
        );

        if (!response.data.output_url) {
            throw new Error("No output image returned");
        }

        // 5. HD වුණු image එක download කරගැනීම
        const hdImage = await axios.get(
            response.data.output_url,
            { responseType: "arraybuffer" }
        );

        await client.sendMessage(m.jid, {
            react: { text: "✅", key: m.key }
        });

        // 6. HD photo එක Caption එකත් සමඟ reply එකක් විදිහට යැවීම
        await client.sendMessage(
            m.jid,
            {
                image: Buffer.from(hdImage.data),
                caption: `✨ *AI PHOTO ENHANCER PRO*

🖼️ Quality Enhanced Successfully  
🚀 Engine: DeepAI Torch SRGAN
📈 Scale: 4x AI Upscale
💎 Result: HD Detail Recovery

💡 *Face photo සහ Old blurry images වලට Best Results*

❖ Powered By X-KADIYA-MD 💎`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        await client.sendMessage(m.jid, {
            react: { text: "⚠️", key: m.key }
        });
        let errorMsg = err.response?.data?.err || err.message;
        return await m.reply(`⚠️ Image enhancement failed!\n\n*Error:* ${errorMsg}\n\n*Fix:*\n1. `.env` එකේ API key එක හරියට දාගන්න\n2. Image එක 5MB ට අඩු JPG/PNG එකකින් try කරපන්\n3. Daily limit ඉවර නම් හෙට try කරපන්`);
    }
});
