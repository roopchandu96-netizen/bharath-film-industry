
import { db } from "./firebase";
import { ChatMessage, Conversation } from "../types";

export const initiateConversation = async (senderId: string, senderName: string, receiverId: string, receiverName: string) => {
  const chatId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;
  const convs = db.getCollection('conversations');
  const exists = convs.find((c: Conversation) => c.id === chatId);

  if (!exists) {
    const newConv: Conversation = {
      id: chatId,
      participants: [senderId, receiverId],
      participantNames: { [senderId]: senderName, [receiverId]: receiverName },
      lastMessage: "Conversation initiated",
      lastUpdated: { seconds: Date.now() / 1000 },
      typing: { [senderId]: false, [receiverId]: false }
    };
    db.saveToCollection('conversations', newConv);
  }
  return chatId;
};

export const sendMessage = async (senderId: string, senderName: string, receiverId: string, receiverName: string, content: string) => {
  const chatId = await initiateConversation(senderId, senderName, receiverId, receiverName);
  
  const msg: ChatMessage = {
    id: `bfi-msg-${Date.now()}`,
    senderId,
    text: content,
    timestamp: { seconds: Date.now() / 1000 },
    seen: false,
    aiGenerated: false
  };

  db.saveToCollection(`messages_${chatId}`, msg);
  
  const convs = db.getCollection('conversations');
  const idx = convs.findIndex((c: Conversation) => c.id === chatId);
  if (idx > -1) {
    convs[idx].lastMessage = content;
    convs[idx].lastUpdated = msg.timestamp;
    localStorage.setItem('bfi_ledger_conversations', JSON.stringify(convs));
  }
  
  return msg.id;
};

export const subscribeToConversations = (userId: string, callback: (conversations: Conversation[]) => void) => {
  const sync = () => {
    const all = db.getCollection('conversations');
    const userConvs = all.filter((c: Conversation) => c.participants.includes(userId));
    callback(userConvs);
  };
  sync();
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
};

export const subscribeToMessages = (chatId: string, callback: (messages: ChatMessage[]) => void) => {
  const sync = () => {
    callback(db.getCollection(`messages_${chatId}`));
  };
  sync();
  window.addEventListener('storage', sync);
  return () => window.removeEventListener('storage', sync);
};

export const setTypingStatus = (chatId: string, userId: string, isTyping: boolean) => {
  const convs = db.getCollection('conversations');
  const idx = convs.findIndex((c: Conversation) => c.id === chatId);
  if (idx > -1) {
    if (!convs[idx].typing) convs[idx].typing = {};
    convs[idx].typing[userId] = isTyping;
    localStorage.setItem('bfi_ledger_conversations', JSON.stringify(convs));
  }
};

export const markMessageAsSeen = (chatId: string, messageId: string) => {
  const msgs = db.getCollection(`messages_${chatId}`);
  const idx = msgs.findIndex((m: ChatMessage) => m.id === messageId);
  if (idx > -1) {
    msgs[idx].seen = true;
    localStorage.setItem(`bfi_ledger_messages_${chatId}`, JSON.stringify(msgs));
  }
};
