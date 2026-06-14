// ලෝක වේලාවන් ලබා දෙන සරල Function එක
function getWorldTime(timezone) {
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

        // සිංහලෙන් දිනය සහ වේලාව Format කර ගැනීම (en-US වෙනුවට si-LK භාවිතා කර ඇත)
        const formatter = new Intl.DateTimeFormat('si-LK', options);
        return formatter.format(new Date());
    } catch (error) {
        return null;
    }
}

// WhatsApp Message Handler එක (Example)
async function handleTimeCommand(client, message, args) {
    // රටවල් සහ ඒවායේ Timezone ලැයිස්තුව
    const timezones = {
        'ලංකාව': 'Asia/Colombo',
        'sl': 'Asia/Colombo',
        'ඉන්දියාව': 'Asia/Kolkata',
        'india': 'Asia/Kolkata',
        'ඇමරිකාව': 'America/New_York',
        'usa': 'America/New_York',
        'එංගලන්තය': 'Europe/London',
        'uk': 'Europe/London',
        'ජපානය': 'Asia/Tokyo',
        'japan': 'Asia/Tokyo',
        'ඩුබායි': 'Asia/Dubai',
        'dubai': 'Asia/Dubai',
        'ඕස්ට්‍රේලියාව': 'Australia/Sydney',
        'australia': 'Australia/Sydney',
        'සිංගප්පූරුව': 'Asia/Singapore',
        'singapore': 'Asia/Singapore',
        'කටාර්': 'Asia/Qatar',
        'qatar': 'Asia/Qatar'
    };

    const country = args[0]?.toLowerCase(); // පරිශීලකයා ඇතුලත් කරන රට

    if (!country) {
        const helpMessage = `⚠️ *කරුණාකර රටක නමක් ඇතුලත් කරන්න!*
        
📌 *භාවිතා කරන ආකාරය:*
.time [රටේ නම]

💡 *උදාහරණ:*
• _.time ලංකාව_
• _.time usa_
• _.time ජපානය_

❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
        return message.reply(helpMessage);
    }

    const timezone = timezones[country];

    if (timezone) {
        const currentTime = getWorldTime(timezone);
        
        // ලස්සනට සකස් කල Reply Message එක
        const replyMessage = `✨ ─── 🌍 *ලෝක ඔරලෝසුව* 🌍 ─── ✨

📍 *රට / නගරය :* ${country.toUpperCase()}
📅 *දිනය සහ වේලාව :* ${currentTime}

✨ ────────────────── ✨
❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        await message.reply(replyMessage);
    } else {
        const errorMessage = `❌ *කණගාටුයි! ඔය රට මගේ ලැයිස්තුවේ නැහැ.*

ℹ️ ලංකාව, ඉන්දියාව, ඇමරිකාව, ජපානය, ඩුබායි, කටාර්, usa, uk වැනි රටක් ඇතුලත් කර නැවත උත්සාහ කරන්න.

❖Ƭʜᴇ𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;
        await message.reply(errorMessage);
    }
}

