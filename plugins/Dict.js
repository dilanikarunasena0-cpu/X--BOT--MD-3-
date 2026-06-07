const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

Sparky({
    name: "dict",
    alias: ["meaning", "dictionary", "arthaya"],
    category: "tools",
    fromMe: isPublic,
    desc: "ඉංග්‍රීසි වචන වල සිංහල තේරුම හොයන්න"
}, async ({ client, m, args }) => {
    const word = args[0];

    if (!word) {
        return await m.reply(`📚 *Dictionary Bot*\n\nවචනයක් දාපන් මචන්\nEx: *.dict apple*\nEx: *.dict beautiful*\nEx: *.dict run*`);
    }

    try {
        await m.reply("🔍 වචනය හොයනවා...");

        const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
        const data = res.data[0];

        const wordTitle = data.word;
        const phonetic = data.phonetic || data.phonetics.find(p => p.text)?.text || "N/A";
        const meanings = data.meanings;

        let text = `*📚 DICTIONARY*\n\n`;
        text += `*වචනය:* ${wordTitle}\n`;
        text += `*උච්චාරණය:* ${phonetic}\n\n`;

        meanings.forEach((meaning, i) => {
            text += `*${i+1}. ${meaning.partOfSpeech.toUpperCase()}*\n`;

            meaning.definitions.slice(0, 2).forEach((def, j) => {
                text += ` ${j+1}) ${def.definition}\n`;
                if (def.example) {
                    text += ` 💡 Example: _${def.example}_\n`;
                }
            });
            text += `\n`;
        });

        // Synonyms තියෙනවනම්
        const synonyms = meanings.flatMap(m => m.synonyms).filter(s => s).slice(0, 5);
        if (synonyms.length > 0) {
            text += `*සමාන වචන:* ${synonyms.join(", ")}\n`;
        }

        // Audio තියෙනවනම්
        const audio = data.phonetics.find(p => p.audio)?.audio;
        if (audio) {
            await client.sendMessage(m.jid, { audio: { url: audio }, mimetype: "audio/mpeg", ptt: false }, { quoted: m });
        }

        await client.sendMessage(m.jid, { text }, { quoted: m });

    } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
            await m.reply(`❌ *"${word}"* වචනය හොයාගන්න බැරි උනා මචන් 😢\n\nහරි අකුරු වලින් type කරලා ආපහු try කරපන්\nEx: *.dict beautiful*`);
        } else {
            await m.reply(`❌ Error එකක් ආවා: ${err.message}\nInternet connection එක check කරපන්`);
        }
    }
});
