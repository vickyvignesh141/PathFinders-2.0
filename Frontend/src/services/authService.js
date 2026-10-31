
import api from "./api";

export const loginUser = async (username, password, role) => {
  const response = await api.post("/auth/login", {
    username,
    password,
    role,
  });

  return response.data;
};

export const registerUser = async (
  name,
  username,
  phone,
  email,
  password
) => {
  const response = await api.post("/auth/register", {
    name,
    username,
    phone,
    email,
    password,
  });

  return response.data;
};
