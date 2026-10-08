import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJob } from "../api/resume";
import Loader from "../components/Loader";

export default function JobStatus() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await getJob(jobId);
        if (!active) return;

        setJob(data);

        if (data.status !== "done" && data.status !== "failed") {
          setTimeout(poll, 2500);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    poll();
    return () => {
      active = false;
    };
  }, [jobId]);

  if (!job) return <Loader text="Loading job..." />;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Job Status</h2>

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="mb-2">
          <strong>Job ID:</strong> {job._id}
        </div>

        <div className="mb-2">
          <strong>Status:</strong>{" "}
          <span
            className={`px-2 py-1 rounded ${
              job.status === "done"
                ? "bg-green-100 text-green-700"
                : job.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {job.status}
          </span>
        </div>

        {job.error && (
          <div className="text-red-600">
            <strong>Error:</strong> {job.error}
          </div>
        )}

        {job.status === "done" && (
          <div className="mt-3 text-green-700 font-medium">
            Parsing complete — visit your{" "}
            <a href="/profile" className="underline">
              Profile
            </a>{" "}
            to see updated details.
          </div>
        )}
      </div>
    </div>
  );
}
