import { useEffect, useState } from "react";
import { getMe } from "../api/auth";
import Loader from "../components/Loader";

export default function Profile() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        setMe(data.user || data); // backend may return { user: ... } or user object
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  if (!me) return <Loader />;

  const p = me.candidateProfile || {};

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Parsed Candidate Profile</h2>

      <div className="bg-white p-6 rounded shadow">
        <div className="text-xl font-bold">{p.fullName || me.name}</div>
        <div className="text-sm text-gray-600">{p.email || me.email}</div>
        <div className="mt-3">
          <strong>Phone:</strong> {p.phone || "—"}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {(p.skills || []).map((s, i) => <div key={i} className="px-2 py-1 bg-indigo-50 rounded">{s}</div>)}
            {(p.skills || []).length === 0 && <div className="text-sm text-gray-500">No skills parsed</div>}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Education</h3>
          <div className="mt-2 space-y-2">
            {(p.education || []).map((e, i) => (
              <div key={i} className="border p-2 rounded">
                {typeof e === "string" ? <div>{e}</div> : <div>{e.degree || e.institution || JSON.stringify(e)}</div>}
              </div>
            ))}
            {(p.education || []).length === 0 && <div className="text-sm text-gray-500">No education parsed</div>}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Experience</h3>
          <div className="mt-2 space-y-2">
            {(p.experience || []).map((ex, i) => (
              <div key={i} className="border p-2 rounded">
                {typeof ex === "string" ? <div>{ex}</div> : <div><div className="font-medium">{ex.title} @ {ex.company}</div><div className="text-sm">{ex.start} - {ex.end}</div><div>{ex.description}</div></div>}
              </div>
            ))}
            {(p.experience || []).length === 0 && <div className="text-sm text-gray-500">No experience parsed</div>}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold">Raw Text</h3>
          <pre className="bg-gray-100 p-3 rounded max-h-64 overflow-auto">{p.rawText || "No raw text saved."}</pre>
        </div>
      </div>
    </div>
  );
}
