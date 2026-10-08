import axios from "axios";
const API = "http://localhost:5000/api";

export async function registerUser({ name, email, password, role = "candidate" }) {
  const resp = await axios.post(`${API}/auth/register`, { name, email, password, role });
  return resp.data;
}

export async function loginUser(email, password) {
  const resp = await axios.post(`${API}/auth/login`, { email, password });
  return resp.data;
}

export async function getMe() {
  const token = localStorage.getItem("token");
  const resp = await axios.get(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.data;
}
