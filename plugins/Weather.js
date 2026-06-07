const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// කාලගුණයට අදාළ ලස්සන ඉමෝජි ලිස්ට් එක
const weatherEmoji = {
    Thunderstorm: "⛈️", Drizzle: "🌦️", Rain: "🌧️", Snow: "❄️",
    Clear: "☀️", Clouds: "☁️", Mist: "🌫️", Haze: "🌫️", Fog: "🌫️",
    Sunny: "☀️", Overcast: "☁️", Patchy: "🌦️"
};

Sparky({
    name: "w",
    alias: ["w", "climate"],
    category: "tools",
    fromMe: isPublic,
    desc: "Professional City Weather Report"
}, async ({ client, m, args }) => {
    const city = (Array.isArray(args) ? args.join(" ") : String(args || "")).trim();

    if (!city) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *🌤️ WEATHER REPORT* 」\n│\n├ *Usage:* .w colombo\n├ *Example:* .w kandy | .w tokyo\n│\n╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
    }

    try {
        // විධානය භාරගත් බව පෙන්වීමට මුල් React එක
        await client.sendMessage(m.jid, { react: { text: "⏳", key: m.key } });
        await client.sendPresenceUpdate('composing', m.jid);

        // wttr.in JSON API v1
        const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
        const res = await axios.get(url, { timeout: 15000 });

        if (!res.data || !res.data.current_condition) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply(`❌ *"${city}"* නගරය සොයාගත නොහැකි විය.\nකරුණාකර අක්ෂර වින්‍යාසය නිවැරදිද පරීක්ෂා කරන්න.`);
        }

        const current = res.data.current_condition[0];
        const area = res.data.nearest_area[0];

        const name = area.areaName[0].value || city;
        const country = area.country[0].value || "";
        const temp = current.temp_C || "N/A";
        const feels = current.FeelsLikeC || "N/A";
        const humidity = current.humidity || "N/A";
        const windSpeed = current.windspeedKmph || "N/A";
        const windDir = current.winddir16Point || "N/A"; // හුළං හමන දිශාව
        const visibility = current.visibility || "N/A"; // පෙනුම සීමාවීම
        const pressure = current.pressure || "N/A";     // පීඩනය
        const desc = current.weatherDesc[0].value || "N/A";
        
        // වර්තමාන දිනය සහ වේලාව ලබා ගැනීම
        const dateTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' });

        // ගැලපෙන ඉමෝජි එක තෝරාගැනීම
        let emoji = "🌡️";
        for (const key in weatherEmoji) {
            if (desc.toLowerCase().includes(key.toLowerCase())) {
                emoji = weatherEmoji[key];
                break;
            }
        }

        // සාර්ථක වූ පසු වැටෙන React එක
        await client.sendMessage(m.jid, { react: { text: "🌤️", key: m.key } });

        // Professional Format එක
        let result = `📊 *WEATHER REPORT FOR ${name.toUpperCase()}* 📊\n\n`;
        result += `📍 *Location:* ${name}, ${country}\n`;
        result += `📅 *Date & Time:* ${dateTime} (SLT)\n`;
        result += `✨ *Condition:* ${emoji} ${desc}\n\n`;
        result += `🌡️ *Temperature:* ${temp}°C\n`;
        result += `🤝 *Feels Like:* ${feels}°C\n`;
        result += `💧 *Humidity:* ${humidity}%\n`;
        result += `💨 *Wind:* ${windSpeed} km/h (${windDir})\n`;
        result += `👁️ *Visibility:* ${visibility} km\n`;
        result += `⏲️ *Atmospheric Pressure:* ${pressure} hPa\n\n`;
        result += `*❖ Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎*`;

        await client.sendMessage(m.jid, { text: result }, { quoted: m });
        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "⚠️", key: m.key } });
        console.log("Weather Error:", err.message);
        await m.reply(`⚠️ සේවාදායකයේ බිඳවැටීමක්. කරුණාකර සුළු මොහොතකින් නැවත උත්සාහ කරන්න.`);
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
