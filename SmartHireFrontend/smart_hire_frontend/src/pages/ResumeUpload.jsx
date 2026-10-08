import { useState } from "react";
import { uploadResume } from "../api/resume";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return alert("Please select a PDF resume.");

    setLoading(true);
    try {
      const res = await uploadResume(file);
      setJob(res);
      alert("Uploaded! Job ID: " + (res.jobId || res._id));
    } catch (err) {
      alert(err?.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Upload Resume</h2>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {job && (
        <div className="mt-4 p-3 bg-white rounded shadow text-sm">
          <div><strong>Uploaded:</strong> {job.resumePath}</div>
          <div><strong>Job ID:</strong> {job.jobId || job._id}</div>
        </div>
      )}
    </div>
  );
}
