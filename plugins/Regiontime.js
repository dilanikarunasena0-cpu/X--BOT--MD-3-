const { Sparky } = require("../lib");

// භාෂාව අනුව දිනය සහ වේලාව Format කරන Function එක
function getWorldTime(timezone, locale = 'en-US') {
    try {
        const options = {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };

        const formatter = new Intl.DateTimeFormat(locale, options);
        return formatter.format(new Date());
    } catch (error) {
        return null;
    }
}

Sparky({
    name: "rtime",
    alias: ["time", "clock", "වේලාව", "நேரம்"],
    category: "tools",
    fromMe: false,
    desc: "ඕනෑම රටක වත්මන් වේලාව ලබා ගැනීම"
}, async ({ client, m, args }) => {
    try {
        // පරිශීලකයා ඇතුලත් කරන රට ලබා ගැනීම
        const input = Array.isArray(args) ? args.join(" ") : String(args || "");
        const country = input.trim().toLowerCase();

        // භාෂා 3න්ම රටවල් සහ ඒවායේ Timezone + Locale ලැයිස්තුව
        const timezones = {
            // --- Sri Lanka ---
            'ලංකාව': { zone: 'Asia/Colombo', locale: 'si-LK' },
            'இலங்கை': { zone: 'Asia/Colombo', locale: 'ta-LK' },
            'srilanka': { zone: 'Asia/Colombo', locale: 'en-US' },
            'sl': { zone: 'Asia/Colombo', locale: 'en-US' },

            // --- India ---
            'ඉන්දියාව': { zone: 'Asia/Kolkata', locale: 'si-LK' },
            'இந்தியா': { zone: 'Asia/Kolkata', locale: 'ta-IN' },
            'india': { zone: 'Asia/Kolkata', locale: 'en-US' },

            // --- USA ---
            'ඇමරිකාව': { zone: 'America/New_York', locale: 'si-LK' },
            'அமெரிக்கா': { zone: 'America/New_York', locale: 'ta-LK' },
            'usa': { zone: 'America/New_York', locale: 'en-US' },

            // --- UK ---
            'එංගලන්තය': { zone: 'Europe/London', locale: 'si-LK' },
            'இங்கிலாந்து': { zone: 'Europe/London', locale: 'ta-LK' },
            'uk': { zone: 'Europe/London', locale: 'en-US' },
            'london': { zone: 'Europe/London', locale: 'en-US' },

            // --- Japan ---
            'ජපානය': { zone: 'Asia/Tokyo', locale: 'si-LK' },
            'ஜப்பான்': { zone: 'Asia/Tokyo', locale: 'ta-LK' },
            'japan': { zone: 'Asia/Tokyo', locale: 'en-US' },

            // --- Dubai ---
            'ඩුබායි': { zone: 'Asia/Dubai', locale: 'si-LK' },
            'துபாய்': { zone: 'Asia/Dubai', locale: 'ta-LK' },
            'dubai': { zone: 'Asia/Dubai', locale: 'en-US' }
        };

        // රටක් ඇතුලත් කර නොමැති නම් උදව් මැසේජ් එක පෙන්වීම
        if (!country) {
            await m.react?.("⚠️");
            const helpMessage = `⚠️ *Please enter a country name! / කරුණාකර රටක නමක් ඇතුලත් කරන්න! / தயவுசெய்து ஒரு நாட்டின் பெயரை உள்ளிடவும்!*
            
📌 *Usage / භාවිතා කරන ආකාරය / பயன்படுத்தும் முறை:*
.rtime [country_name]

💡 *Examples / උදාහරණ / உதாரணங்கள்:*
• _.rtime ලංකාව_  |  _.rtime இலங்கை_  |  _.rtime srilanka格式_
• _.rtime usa_  |  _.rtime ඇමරිකාව_

❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
            return await m.reply(helpMessage);
        }

        const target = timezones[country];

        if (target) {
            await m.react?.("🕒");
            const currentTime = getWorldTime(target.zone, target.locale);
            
            const replyMessage = `✨ ─── 🌍 *WORLD CLOCK / ලෝක ඔරලෝසුව* 🌍 ─── ✨

📍 *Country / රට / நாடு :* ${country.toUpperCase()}
📅 *Date & Time / දිනය සහ වේලාව / தேதி மற்றும் நேரம் :*
👉 ${currentTime}

✨ ────────────────────────── ✨
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

            await client.sendMessage(m.jid, { text: replyMessage }, { quoted: m });
            await m.react?.("✅");
        } else {
            await m.react?.("❌");
            const errorMessage = `❌ *Invalid Country / රට වැරදියි / தவறான நாடு*

ℹ️ Try with: srilanka, ලංකාව, இலங்கை, india, usa, uk, dubai, japan...

❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
            await m.reply(errorMessage);
        }

    } catch (err) {
        console.log("Time plugin error:", err);
        await m.react?.("❌");
        await m.reply("❌ පද්ධති දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.");
    }
});
