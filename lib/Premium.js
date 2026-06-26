// 💳 Premium සෙෂන් අයිඩී හෝ ෆෝන් නම්බර්ස් ඇතුළත් කරන ස්ථානය
const PREMIUM_USERS = [
    "SESSION_ID_01", 
    "94771234567@s.whatsapp.net", // Phone Number එකෙන් නම්
    "KADIYA_MD_PRO_USER"
];

/**
 * 🔐 පරිශීලකයා Premium ද නැද්ද යන්න පරික්ෂා කිරීම
 */
function isPremiumUser(m) {
    // 1. මැසේජ් එක එවපු කෙනාගේ නම්බර් එක පරීක්ෂාව
    const userJid = m.sender; 
    
    // 2. ඔයා කැමති නම් Session ID එක පරීක්ෂා කරන්නත් පුළුවන් (Bot Config එක හරහා)
    // මෙතනදී සරලවම නම්බර් එක හෝ ID එක ලිස්ට් එකේ තියෙනවාද බලනවා
    return PREMIUM_USERS.includes(userJid) || PREMIUM_USERS.includes(m.sessionId);
}

