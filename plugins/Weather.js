const { Sparky, isPublic } = require("../lib");
const axios = require("axios");

const API_KEY = "4c973ebdcfbde98f36d684ebe7840062";

const weatherEmoji = {
    Thunderstorm: "⛈️", Drizzle: "🌦️", Rain: "🌧️", Snow: "❄️",
    Clear: "☀️", Clouds: "☁️", Mist: "🌫️", Haze: "🌫️", Fog: "🌫️"
};

Sparky({
    name: "weather",
    alias: ["w", "climate"],
    category: "tools",
    fromMe: isPublic,
    desc: "City weather - Error free version"
}, async ({ client, m, args }) => {
    // String ද Array ද කියලා check කරලා නගරයේ නම ගන්නවා
    const city = (Array.isArray(args) ? args.join(" ") : String(args || "")).trim();

    if (!city) {
        await client.sendMessage(m.jid, { react: { text: "❓", key: m.key } });
        return await m.reply(`╭─「 *🌤️ WEATHER* 」\n│\n├ *Usage:*.w colombo\n├ *Ex:*.w kandy | .w tokyo\n│\n╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`);
    }

    try {
        await client.sendMessage(m.jid, { react: { text: "🌐", key: m.key } });
        await client.sendPresenceUpdate('composing', m.jid);

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        
        const res = await axios.get(url, { 
            timeout: 15000,
            validateStatus: () => true 
        });

        if (res.status !== 200) {
            await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
            return await m.reply(`❌ *"${city}"* හොයාගන්න බැරි උනා\nSpelling එක check කරපන්\nEx: *.w colombo*`);
        }

        const data = res.data;
        if (!data || !data.main) {
            throw new Error("Invalid data");
        }

        await client.sendMessage(m.jid, { react: { text: "⚙️", key: m.key } });

        const name = data.name || city;
        const country = data.sys?.country || "";
        const temp = data.main.temp?.toFixed(1) || "N/A";
        const feels = data.main.feels_like?.toFixed(1) || "N/A";
        const humidity = data.main.humidity || "N/A";
        const wind = data.wind?.speed || "N/A";
        const desc = data.weather?.[0]?.description || "N/A";
        const main = data.weather?.[0]?.main || "Clear";
        const emoji = weatherEmoji[main] || "🌡️";

        await client.sendMessage(m.jid, { react: { text: "✅", key: m.key } });

        let result = `╭─「 *🌤️ WEATHER* 」\n`;
        result += `│\n`;
        result += `├ *City:* ${name}, ${country}\n`;
        result += `├ *Weather:* ${emoji} ${desc}\n`;
        result += `│\n`;
        result += `├ *Temp:* ${temp}°C\n`;
        result += `├ *Feels:* ${feels}°C\n`;
        result += `├ *Humidity:* ${humidity}%\n`;
        result += `├ *Wind:* ${wind} m/s\n`;
        result += `│\n`;
        result += `╰─ Powered by ❖Ƭʜᴇ 𝐗-𝐊𝐀𝐃𝐈𝐘𝐀-𝐌𝐃 💎`;

        await client.sendMessage(m.jid, { text: result }, { quoted: m });
        await client.sendPresenceUpdate('paused', m.jid);

    } catch (err) {
        await client.sendMessage(m.jid, { react: { text: "❌", key: m.key } });
        console.log("Weather Error:", err.message);
        await m.reply(`❌ Error එකක් ආවා මචන්\nවිනාඩි 2කින් ආපහු try කරපන්`);
        await client.sendPresenceUpdate('paused', m.jid);
    }
});
