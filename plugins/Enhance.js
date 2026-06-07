const { Sparky, isPublic } = require("../lib");
const axios = require("axios");
const FormData = require("form-data");

const API_KEY = process.env.DEEPAI_API_KEY;

Sparky({
    name: "enhance",
    alias: ["hd", "upscale", "quality"],
    category: "ai",
    fromMe: isPublic,
    desc: "Enhance low quality photos using AI"
}, async ({ client, m }) => {

    try {
        // 1. Reply කරපු message එකක්ද නැත්නම් current message එකද කියලා තෝරාගැනීම
        const quoted = m.quoted ? m.quoted : m;

        // 2. Message එකේ image එකක් තියෙනවද කියලා check කිරීම (Caption එකක් විදිහට හෝ Reply එකක් විදිහට)
        const hasImage = m.image || (m.quoted && m.quoted.image);

        if (!hasImage) {
            await client.sendMessage(m.jid, {
                react: { text: "❌", key: m.key }
            });
            return await m.reply("🖼️ කරුණාකර Photo එකක Caption එක ලෙස හෝ Photo එකකට Reply කරලා .enhance භාවිතා කරන්න.");
        }

        await client.sendMessage(m.jid, {
            react: { text: "⏳", key: m.key }
        });

        // 3. නිවැරදි image එක download කරගැනීම
        const buffer = m.image ? await m.download() : await m.quoted.download();

        const form = new FormData();
        form.append("image", buffer, {
            filename: "image.jpg"
        });

        // DeepAI API එකට image එක යැවීම
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
                timeout: 60000
            }
        );

        if (!response.data.output_url) {
            throw new Error("No output image returned");
        }

        // Quality වුණු image එක download කරගැනීම
        const enhanced = await axios.get(
            response.data.output_url,
            { responseType: "arraybuffer" }
        );

        await client.sendMessage(m.jid, {
            react: { text: "✅", key: m.key }
        });

        // Quality වුණු image එක reply එකක් විදිහට යැවීම
        await client.sendMessage(
            m.jid,
            {
                image: Buffer.from(enhanced.data),
                caption: `✨ AI PHOTO ENHANCER PRO\n\n🖼️ Quality Enhanced Successfully\n🚀 Engine: DeepAI SRGAN\n📈 Result: HD Upscaled Image\n\n❖ Powered By X-KADIYA-MD 💎`
            },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        await client.sendMessage(m.jid, {
            react: { text: "⚠️", key: m.key }
        });
        return await m.reply("⚠️ Image enhancement failed. Please try again later.");
    }
});
