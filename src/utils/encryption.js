import CryptoJS from 'crypto-js';

const getConversationKey = (userId1, userId2) => {
    // Sorting ensures both users generate the exact same string key
    return [userId1, userId2].sort().join('-');
};

export const encryptMessage = (text, receiverId, senderId) => {
    if (!text) return '';
    const key = getConversationKey(senderId, receiverId);
    return CryptoJS.AES.encrypt(text, key).toString();
};

export const decryptMessage = (ciphertext, receiverId, senderId) => {
    if (!ciphertext) return '';
    try {
        const key = getConversationKey(senderId, receiverId);
        const bytes = CryptoJS.AES.decrypt(ciphertext, key);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        
        // If decryption fails to produce a string, it might have been unencrypted
        return originalText || ciphertext; 
    } catch (e) {
        // Fallback for older messages that were stored in plain text
        return ciphertext;
    }
};
