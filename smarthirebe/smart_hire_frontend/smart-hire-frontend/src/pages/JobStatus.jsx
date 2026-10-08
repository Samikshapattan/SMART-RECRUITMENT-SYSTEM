import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getJob } from "../api/resume";
import Loader from "../components/Loader";

export default function JobStatus() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const data = await getJob(jobId);
        if (!mounted) return;
        setJob(data);
        if (data.status !== "done" && data.status !== "failed") {
          setTimeout(poll, 3000);
        }
      } catch (err) {
        console.error(err);
      }
    }
    poll();
    return () => { mounted = false; };
  }, [jobId]);

  if (!job) return <Loader />;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl mb-4">Job Status</h2>
      <div className="bg-white p-4 rounded shadow">
        <div><strong>Job ID:</strong> {job._id}</div>
        <div><strong>Status:</strong> {job.status}</div>
        {job.error && <div className="text-red-600 mt-2"><strong>Error:</strong> {job.error}</div>}
        {job.status === "done" && <div className="mt-3 text-green-600">Done — check <a href="/profile" className="underline">profile</a></div>}
      </div>
    </div>
  );
}
