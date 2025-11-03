import api from "./api";

export const summarizeChat = async (messages) => {
  const res = await api.post("/ai/summarize-chat", { messages });
  return res.data.summary;
};
