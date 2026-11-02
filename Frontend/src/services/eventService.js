
import api from "./api";

// CREATE EVENT
export const createEvent = async (eventData) => {
  const response = await api.post("/events/", eventData);
  return response.data;
};

// GET ALL EVENTS
export const getAllEvents = async () => {
  const response = await api.get("/events/");
  return response.data;
};
