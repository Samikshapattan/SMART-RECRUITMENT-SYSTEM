import axios from "axios";

// Adjust this URL if your backend runs on a different port
const API_URL = "http://localhost:5000/api/auth";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { 
    headers: { 
      Authorization: `Bearer ${token}` 
    } 
  };
};

export async function registerUser(userData) {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
}

export async function loginUser(email, password) {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  return res.data;
}

export async function getMe() {
  const res = await axios.get(`${API_URL}/me`, getAuthHeader());
  return res.data;
}

export async function updateMe(updates) {
  const res = await axios.patch(`${API_URL}/me`, updates, getAuthHeader());
  return res.data;
}