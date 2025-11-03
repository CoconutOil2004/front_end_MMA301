import api from "./api";

// ---- CONVERSATION ----
export const createOrGetConversation = async (senderId, receiverId) => {
  const res = await api.post("/conversations", { senderId, receiverId });
  return res.data;
};

export const getConversations = async (userId) => {
  const res = await api.get(`/conversations/${userId}`);
  return res.data;
};

export const deleteConversation = async (conversationId) => {
  const res = await api.delete(`/conversations/${conversationId}`);
  return res.data;
};

// ---- MESSAGES ----
export const getMessages = async (conversationId) => {
  const res = await api.get(`/messages/${conversationId}`);
  return res.data;
};

export const sendMessage = async (conversationId, senderId, text) => {
  const res = await api.post("/messages", { conversationId, senderId, text });
  return res.data;
};

export const markMessagesAsRead = async (conversationId, userId) => {
  const res = await api.put("/messages/read", { conversationId, userId });
  return res.data;
};
