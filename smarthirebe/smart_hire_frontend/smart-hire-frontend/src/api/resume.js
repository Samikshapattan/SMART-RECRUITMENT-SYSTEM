import axios from "axios";
const API = "http://localhost:5000/api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadResume(file) {
  const form = new FormData();
  form.append("resume", file);
  const resp = await axios.post(`${API}/resume/upload`, form, {
    headers: { ...authHeader(), "Content-Type": "multipart/form-data" },
  });
  return resp.data;
}

export async function getJob(jobId) {
  const resp = await axios.get(`${API}/resume/job/${jobId}`, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function listJobsForUser() {
  const resp = await axios.get(`${API}/resume/myjobs`, { headers: authHeader() });
  return resp.data;
}
