import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Adjust if your port differs

// Get the token from local storage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export async function searchCandidatesChat(query) {
  const res = await axios.post(
    `${API_URL}/search/chat`,
    { query },
    getAuthHeader()
  );
  return res.data;
}