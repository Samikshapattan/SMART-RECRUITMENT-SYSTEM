import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { listJobsForUser } from "../api/resume";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [jobs, setJobs] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await listJobsForUser();
        setJobs(res.jobs || res); // backend sometimes returns array
      } catch (err) {
        console.error(err);
        setJobs([]);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Candidate Dashboard</h1>

      <div className="mb-6">
        <Link
          to="/upload"
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Upload new resume
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-3">My Parse Jobs</h2>

      {!jobs && <Loader />}

      {jobs && jobs.length === 0 && (
        <div>No jobs yet. Upload a resume to start.</div>
      )}

      {jobs && jobs.length > 0 && (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="text-sm text-gray-500">
                  Uploaded: {new Date(job.createdAt).toLocaleString()}
                </div>

                <div className="font-medium">
                  {job.resumePath?.split("/").pop()}
                </div>

                <div className="text-sm">
                  Status: <strong>{job.status}</strong>
                </div>
              </div>

              <div className="space-x-2">
                <Link
                  to={`/status/${job._id}`}
                  className="px-3 py-1 bg-gray-100 rounded"
                >
                  View
                </Link>

                {job.status === "done" && (
                  <Link
                    to="/profile"
                    className="px-3 py-1 bg-green-100 rounded"
                  >
                    View Profile
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 