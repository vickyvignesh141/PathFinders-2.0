
  import api from "./api";

  // =====================================
  // CREATE EVENT
  // =====================================
  export const createEvent = async (eventData) => {
    const response = await api.post("/events/", eventData);
    return response.data;
  };

  // =====================================
  // GET ALL EVENTS
  // =====================================
  export const getAllEvents = async () => {
    const response = await api.get("/events/");
    return response.data;
  };

  // =====================================
  // STUDENT: REGISTER FOR EVENT
  // =====================================
  export const registerForEvent = async (eventId) => {
    const response = await api.post(
      `/events/${eventId}/register`,
      {}
    );

    return response.data;
  };

  // =====================================
  // STUDENT: GET MY REGISTRATIONS
  // =====================================
  export const getStudentRegistrations = async () => {
    const username = localStorage.getItem("username");

    console.log("Logged-in username:", username);

    const response = await api.get(
      "/events/student/registrations",
      {
        params: { username }
      }
    );

    return response.data;
  };

  // =====================================
  // ADMIN: GET EVENT REGISTRATIONS
  // =====================================
  export const getEventRegistrations = async (eventId) => {
    const response = await api.get(
      `/events/${eventId}/registrations`
    );

    return response.data;
  };

  // =====================================
  // ADMIN: APPROVE OR REJECT STUDENT
  // =====================================
  export const updateRegistrationStatus = async (
    registrationId,
    status
  ) => {
    const response = await api.patch(
      `/events/registrations/${registrationId}/status`,
      { status }
    );

    return response.data;
  };
  // GENERATE EVENT ATTENDANCE QR
  export const generateEventQR = async (eventId) => {
    const response = await api.post(`/events/${eventId}/qr`);
    return response.data;
  };

  export const verifyEventQR = async (eventId, qrPayload) => {
    const response = await api.post(
      `/events/${eventId}/attendance/verify-qr`,
      { qrPayload }
    );

    return response.data;
  };


  export const getEventAttendance = async (eventId) => {
    const response = await api.get(
      `/events/${eventId}/attendance`
    );
    return response.data;
  };


  export const getMyAttendanceTimers = async () => {
    const response = await api.get(
      "/events/student/attendance/timers"
    );
    return response.data;
  };



  // ADMIN: COMPLETE EVENT FOR ALL STUDENTS
  export const completeAllStudentAttendance = async (eventId) => {
    const response = await api.patch(
      `/events/${eventId}/attendance/complete`
    );

    return response.data;
  };

  export const closeEventAttendance = async (eventId) => {
    const response = await api.patch(
      `/events/${eventId}/attendance/close`
    );

    return response.data;
  };



  // =====================================
  // GET VOLUNTEER LEADERBOARD
  // =====================================
  export const getLeaderboard = async () => {
    const response = await api.get("/events/leaderboard");
    return response.data;
  };


  // =====================================
  // CONFIRM MULTIPLE STUDENT SELECTIONS
  // =====================================
  export const confirmEventSelection = async (
    eventId,
    selectedRegistrationIds
  ) => {
    const response = await api.post(
      `/events/${eventId}/confirm-selection`,
      { selectedRegistrationIds }
    );

    return response.data;
  };


  // =====================================
  // ADMIN: GET EVENT HISTORY
  // =====================================
  export const getAdminEventHistory = async () => {
    const response = await api.get("/events/admin/history");
    return response.data;
  };

  // =====================================
  // ADMIN: GET STUDENT STATUS
  // =====================================
  export const getAdminStudentStatus = async () => {
    const response = await api.get("/events/admin/student-status");
    return response.data;
  };




  // ADMIN: GET RAG CANDIDATES
  export const getRAGCandidates = async (eventId) => {
    const response = await api.get(
      `/rag/${eventId}/candidates`
    );

    return response.data;
  };

  // ADMIN: GENERATE RAG RECOMMENDATIONS
  export const generateRAGRecommendations = async (eventId) => {
    const response = await api.get(
      `/rag/${eventId}/recommendations`
    );

    return response.data;
  };