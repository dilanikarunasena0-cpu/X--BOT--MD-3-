const axios = require("axios");
const { Sparky, isPublic } = require("../lib"); 

// ======================================================
// 🔍 AI REPLY-BASED CODE DEBUGGER (100% FIXED VERSION)
// ======================================================
Sparky({
    name: "fixcode",
    alias: ["debug", "errorfix"],
    category: "tools",
    fromMe: isPublic,
    desc: "Reply to any buggy code with .fixcode to analyze and fix it."
}, async ({ m, text }) => {
    try {
        // 1. පරිශීලකයා වෙනත් මැසේජ් එකකට Reply (Quote) කරලා තියෙනවද බලනවා
        let codeToFix = "";

        if (m.quoted && (m.quoted.text || m.quoted.body)) {
            codeToFix = m.quoted.text || m.quoted.body;
        } else {
            // Reply කරලා නැත්නම්, Command එකත් එක්ක කෙලින්ම දීලා තියෙන text එක ගන්නවා
            codeToFix = (text || m.text || m.body || "").trim();
            if (codeToFix.startsWith(".")) {
                codeToFix = codeToFix.replace(/^\.\w+\s+/, "");
            }
        }

        // කේතයක් ලැබී නොමැති නම් උපදෙස් පණිවිඩය පෙන්වීම
        if (!codeToFix || !codeToFix.trim()) {
            return m.reply(
                "❌ *කරුණාකර විශ්ලේෂණය කිරීමට අවශ්‍ය Code එකට Reply (Quote) කරමින් .fixcode ලෙස යවන්න!*\n\n" +
                "💡 *නැතහොත් කෙලින්ම මෙසේ යවන්න:* \n.fixcode const x = 10\nx = 20"
            );
        }

        await m.reply("🧠 *AI මඟින් ඔබ Reply කල කේතය (Code) පරීක්ෂා කරමින් පවතී... කරුණාකර මොහොතක් රැඳී සිටින්න.*");

        const apiKey = "wxa_f_21e17ba43b"; 

        // Prompt එක සරල කිරීම
        const fullPrompt = `Act as an expert code debugger. Fix errors in this code, explain shortly in English, and provide the fixed code in markdown block:\n\n${codeToFix.trim()}`;

        // XWolf API GPT-4o Endpoint
        const apiUrl = `https://apis.xwolf.space/api/ai/chatbot/gpt4o?q=${encodeURIComponent(fullPrompt)}&key=${apiKey}`;

        console.log("📡 Reply Code Fixer API URL:", apiUrl);

        const response = await axios.get(apiUrl, { timeout: 60000 });
        const data = response?.data;

        console.log("📦 Code Fixer API RESPONSE:", data);

        // ======================================================
        // 🧠 SMART RESULT HANDLING (FIXED FOR ALL RESPONSE TYPES)
        // ======================================================
        let aiResult = null;

        if (typeof data === "string") {
            // API එකෙන් කෙලින්ම Text එකක් ආවොත්
            aiResult = data;
        } else if (data) {
            // JSON Object එකක් ආවොත් හැම Key එකක්ම චෙක් කරනවා
            aiResult = data.result || data.reply || data.response || data.data || (data.status === true ? data.result : null);
        }

        // කිසිම දෙයක් සෙට් වුනේ නැත්නම් data එක string එකක් කරලා ගන්නවා
        if (!aiResult && data) {
            aiResult = typeof data === "object" ? JSON.stringify(data) : data.toString();
        }

        if (!aiResult || aiResult.trim() === "") {
            return m.reply("❌ කේතය පරීක්ෂා කිරීමට නොහැකි වුණා. API Response එක හිස්.\n\n📦 Raw Data: " + JSON.stringify(data));
        }

        const finalResponse = `💻 *AI CODE ASSISTANT & DEBUGGER*\n\n` +
                              `${aiResult}\n\n` +
                              `⚡ *Powered by XWolf API*`;

        return await m.reply(finalResponse);

    } catch (err) {
        console.error("❌ Code Fixer Error:", err);
        return m.reply(
            "❌ Error occurred while debugging:\n" +
            (err.response?.data?.message || err.message || "Unknown error")
        );
    }
});
