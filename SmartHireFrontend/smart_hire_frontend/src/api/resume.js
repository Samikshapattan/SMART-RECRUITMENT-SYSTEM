import axios from "axios";

// Adjust this URL if your backend runs on a different port
const API_URL = "http://localhost:5000/api/resume";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return { 
    headers: { 
      Authorization: `Bearer ${token}`,
      // Axios automatically sets Content-Type for FormData, 
      // but we need the auth token.
    } 
  };
};
export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  // Match the route defined in your backend resume.js
  const res = await axios.post(`${API_URL}/parse`, formData, getAuthHeader());
  return res.data;
}

export async function getJob(jobId) {
  const res = await axios.get(`${API_URL}/job/${jobId}`, getAuthHeader());
  return res.data;
}

export async function listJobsForUser() {
  const res = await axios.get(`${API_URL}/myjobs`, getAuthHeader());
  return res.data;
}