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

    const quoted = m.quoted ? m.quoted : m;

    if (!quoted.image) {
        await client.sendMessage(m.jid, {
            react: { text: "❌", key: m.key }
        });

        return await m.reply(
            "🖼️ කරුණාකර Photo එකකට Reply කරලා .enhance command එක භාවිතා කරන්න."
        );
    }

    await client.sendMessage(m.jid, {
        react: { text: "⏳", key: m.key }
    });

    const buffer = await quoted.download();

    const form = new FormData();
    form.append("image", buffer, {
        filename: "image.jpg"
    });

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

    const enhanced = await axios.get(
        response.data.output_url,
        {
            responseType: "arraybuffer"
        }
    );

    await client.sendMessage(m.jid, {
        react: { text: "✅", key: m.key }
    });

    await client.sendMessage(
        m.jid,
        {
            image: Buffer.from(enhanced.data),
            caption:

`✨ AI PHOTO ENHANCER PRO

🖼️ Quality Enhanced Successfully
🚀 Engine: DeepAI SRGAN
📈 Result: HD Upscaled Image

❖ Powered By X-KADIYA-MD 💎`
},
{ quoted: m }
);

} catch (err) {

    console.error(err);

    await client.sendMessage(m.jid, {
        react: { text: "⚠️", key: m.key }
    });

    return await m.reply(
        "⚠️ Image enhancement failed. Please try again later."
    );
}

});
