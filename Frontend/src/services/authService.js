
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
  const formattedUsername = username.trim().toUpperCase();

  // Select API based on username prefix
  const endpoint = formattedUsername.startsWith("MAA4")
    ? "/auth/admin/register"
    : "/auth/register";

  const response = await api.post(endpoint, {
    name,
    username: formattedUsername,
    phone,
    email,
    password,
  });

  return response.data;
};
