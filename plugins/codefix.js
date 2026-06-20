const axios = require("axios");
const { Sparky, isPublic } = require("../lib"); 

// ======================================================
// 🔍 AI REPLY-BASED CODE DEBUGGER (HUGGING FACE VERSION)
// ======================================================
Sparky({
    name: "fixcode",
    alias: ["debug", "errorfix"],
    category: "tools",
    fromMe: isPublic,
    desc: "Reply to any buggy code with .fixcode to analyze and fix it using Hugging Face AI."
}, async ({ m, text }) => {
    try {
        let codeToFix = "";

        // 1. Reply (Quote) මැසේජ් එකෙන් කේතය ලබා ගැනීම
        if (m.quoted && (m.quoted.text || m.quoted.body)) {
            codeToFix = m.quoted.text || m.quoted.body;
        } else {
            codeToFix = (text || m.text || m.body || "").trim();
            if (codeToFix.startsWith(".")) {
                codeToFix = codeToFix.replace(/^\.\w+\s+/, "");
            }
        }

        if (!codeToFix || !codeToFix.trim()) {
            return m.reply(
                "❌ *කරුණාකර විශ්ලේෂණය කිරීමට අවශ්‍ය Code එකට Reply (Quote) කරමින් .fixcode ලෙස යවන්න!*\n\n" +
                "💡 *නැතහොත් කෙලින්ම මෙසේ යවන්න:* \n.fixcode const x = 10\nx = 20"
            );
        }

        await m.reply("🧠 *Hugging Face AI මඟින් ඔබේ කේතය (Code) පරීක්ෂා කරමින් පවතී... කරුණාකර මොහොතක් රැඳී සිටින්න.*");

        // 🔐 ඔයා ලබාදුන් Hugging Face Token එක ආරක්ෂිතව ඇතුලත් කලා
        const hfToken = "Hf_YwKqWFiIXcAkAWuXltmvAqyHFOsQUqGxRW"; 
        
        // AI එකට දෙන පණිවිඩය (System Instructions + Code)
        const systemInstruction = "[SYSTEM: You are an expert code debugger. Fix errors in the user's code, explain the bug shortly in English, and provide the fully corrected code wrapped inside a markdown code block.]\n\nUser Code:\n";
        const fullPrompt = `${systemInstruction}${codeToFix.trim()}`;

        // Hugging Face Inference API Endpoint (Mistral AI Model එක පාවිච්චි කර ඇත - Coding වලට සුපිරි)
        const apiUrl = "https://api-inference.huggingface.co/models/MistralAI/Mistral-7B-Instruct-v0.3";

        // Hugging Face වෙත ආරක්ෂිත POST Request එකක් යැවීම
        const response = await axios.post(apiUrl, 
            { 
                inputs: fullPrompt,
                parameters: { max_new_tokens: 1000, return_full_text: false }
            }, 
            { 
                headers: { 
                    "Authorization": `Bearer ${hfToken}`,
                    "Content-Type": "application/json"
                },
                timeout: 60000 
            }
        );

        const data = response?.data;
        console.log("📦 Hugging Face API RESPONSE:", data);

        let aiResult = null;

        // Hugging Face සාමාන්‍යයෙන් Array එකක් ඇතුලත Object එකක් ලෙස උත්තරය දෙයි [{ generated_text: "..." }]
        if (Array.isArray(data) && data[0]?.generated_text) {
            aiResult = data[0].generated_text.trim();
        } else if (data && data.generated_text) {
            aiResult = data.generated_text.trim();
        } else if (typeof data === "string") {
            aiResult = data;
        }

        if (!aiResult) {
            return m.reply("❌ කේතය පරීක්ෂා කිරීමට නොහැකි වුණා. Hugging Face වෙතින් නිසි ප්‍රතිචාරයක් ලැබුණේ නැත.");
        }

        const finalResponse = `💻 *AI CODE ASSISTANT & DEBUGGER*\n\n` +
                              `${aiResult}\n\n` +
                              `⚡ *Powered by Hugging Face AI*`;

        return await m.reply(finalResponse);

    } catch (err) {
        console.error("❌ Hugging Face Code Fixer Error:", err);
        
        // Hugging Face එකේ Model එක Load වෙන ගමන් නම් (503 Error) ඒක පරිශීලකයාට දන්වනවා
        if (err.response?.status === 503) {
            return m.reply("⏳ *AI Model එක සූදානම් වෙමින් පවතී (Loading)...* කරුණාකර තත්පර කිහිපයකින් නැවත උත්සාහ කරන්න මචං.");
        }

        return m.reply(
            "❌ Error occurred while debugging:\n" +
            (err.response?.data?.error || err.message || "Unknown error")
        );
    }
});
