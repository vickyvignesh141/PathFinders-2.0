
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

// Get student registration statuses
export const registerForEvent = async (eventId) => {
  const username = localStorage.getItem("username");

  const response = await api.post(
    `/events/${eventId}/register`,
    { username }
  );

  return response.data;
};

export const getStudentRegistrations = async () => {
  const username = localStorage.getItem("username");

  console.log("Logged-in username:", username);

  const response = await api.get(
    "/events/student/registrations",
    {
      params: {
        username: username
      }
    }
  );

  return response.data;
};


export const getEventRegistrations = async (eventId) => {
  const response = await api.get(
    `/events/${eventId}/registrations`
  );

  return response.data;
};


