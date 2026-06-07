const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

// කාලගුණයට අදාළ ලස්සන ඉමෝජි ලිස්ට් එක
const weatherEmoji = {
    Thunderstorm: "⛈️", Drizzle: "🌦️", Rain: "🌧️", Snow: "❄️",
    Clear: "☀️", Clouds: "☁️", Mist: "🌫️", Haze: "🌫️", Fog: "🌫️",
    Sunny: "☀️", Overcast: "☁️", Patchy: "🌦️"
};

Sparky({
    name: "weather",
    alias: ["w", "climate"],
    category: "tools",
    fromMe: isPublic,
    desc: "City weather - No React version"
}, async ({ client, m, args }) => {
    const city = (Array.isArray(args) ? args.join(" ") : String(args || "")).trim();

    if (!city) {
        return await m.reply(`╭─「 *🌤️ WEATHER* 」\n│\n├ *Usage:*.w colombo\n├ *Ex:*.w kandy | .w tokyo\n│\n╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
    }

    try {
        await client.sendPresenceUpdate('composing', m.jid);

        // API Key අවශ්‍ය නැති Free Server එක
        const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
        const res = await axios.get(url, { timeout: 15000 });

        if (!res.data || !res.data.current_condition) {
            return await m.reply(`❌ *"${city}"* හොයාගන්න බැරි උනා\nSpelling එක check කරපන්\nEx: *.w colombo*`);
        }

        const current = res.data.current_condition[0];
        const area = res.data.nearest_area[0];

        const name = area.areaName[0].value || city;
        const country = area.country[0].value || "";
        const temp = current.temp_C || "N/A";
        const feels = current.FeelsLikeC || "N/A";
        const humidity = current.humidity || "N/A";
        const wind = current.windspeedKmph || "N/A";
        const desc = current.weatherDesc[0].value || "N/A";
        
        let emoji = "🌡️";
        for (const key in weatherEmoji) {
            if (desc.toLowerCase().includes(key.toLowerCase())) {
                emoji = weatherEmoji[key];
                break;
            }
        }

        let result = `╭─「 *🌤️ WEATHER* 」\n`;
        result += `│\n`;
        result += `├ *City:* ${name}, ${country}\n`;
        result += `├ *Weather:* ${emoji} ${desc}\n`;
        result += `│\n`;
        result += `├ *Temp:* ${temp}°C\n`;
        result += `├ *Feels:* ${feels}°C\n`;
        result += `├ *Humidity:* ${humidity}%\n`;
        result += `├ *Wind:* ${wind} km/h\n`;
        result += `│\n`;
        result += `╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        await client.sendMessage(m.jid, { text: result }, { quoted: m });
        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        console.log("Weather Error:", err.message);
        await m.reply(`❌ Error එකක් ආවා මචන්\nනැවත උත්සාහ කරන්න.`);
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
