import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getMe, updateMe } from "../api/auth";
import { getJob } from "../api/resume";
import Loader from "../components/Loader";
import axios from "axios"; // ✅ Added missing import

export default function Profile() {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState({});
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [parseJob, setParseJob] = useState(null);
  const [warningMsg, setWarningMsg] = useState(null);
  
  const pollRef = useRef(null);
  const location = useLocation();

  // --- 1. DATA LOADING ---
  const loadUserData = async () => {
    try {
      const data = await getMe();
      const user = data.user || data;
      setMe(user);
      
      setProfile(user.candidateProfile || {
          fullName: user.name || "",
          email: user.email || "",
          skills: [],
          education: [],
          experience: [],
          certifications: []
      });
    } catch (err) {
      console.error("Profile Load Error", err);
    }
  };

  useEffect(() => {
    if (location.state?.warning) {
        setWarningMsg(location.state.warning);
        window.history.replaceState({}, document.title);
    }
    loadUserData(); 

    return () => clearInterval(pollRef.current);
  }, [location]);

  // --- 2. UPDATERS ---
  function updateField(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function updateArrayItem(section, index, key, value) {
    setProfile(prev => {
        const newArray = [...(prev[section] || [])];
        if (!newArray[index]) newArray[index] = {}; 
        if (typeof newArray[index] === 'string') newArray[index] = { title: newArray[index] }; 
        newArray[index] = { ...newArray[index], [key]: value };
        return { ...prev, [section]: newArray };
    });
  }

  // --- 3. ACTIONS ---
  async function saveProfile() {
    try {
      await updateMe({ candidateProfile: profile });
      setWarningMsg(null);
      alert("Profile Saved Successfully!");
    } catch (err) {
      alert("Failed to save profile.");
    }
  }

 const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file first!");
    
    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
        const response = await axios.post('http://localhost:5000/api/resume/parse', formData);
        const parsedData = response.data; 

        console.log("AI Parsed Data received:", parsedData);

        // 🛡️ Data-Type Safety for Arrays
        const ensureArray = (val) => Array.isArray(val) ? val : [];

        setProfile((prev) => ({
            ...prev,
            fullName: parsedData.Name || prev.fullName,
            email: parsedData.Email || prev.email,
            phone: parsedData.Phone || prev.phone,
            summary: parsedData.Summary || prev.summary,
            totalYearsExperience: parsedData.Experience || prev.totalYearsExperience,
            
            // Arrays: Ensure these match the Python SCHEMA keys exactly
            skills: ensureArray(parsedData.Skills),
            certifications: ensureArray(parsedData.Certifications),
            experience: ensureArray(parsedData.WorkExperience),
            education: ensureArray(parsedData.Education)
        }));

        setUploading(false);
        setParseJob({ status: "done" });
        alert("Resume parsed successfully!");
    } catch (error) {
        setUploading(false);
        console.error("Frontend Parsing Error:", error);
        alert("AI Parsing failed. Check browser console (F12) for details.");
    }
  };

  if (!me) return <Loader text="Loading your profile..." />;
  const p = profile || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {warningMsg && (
             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
                <p className="text-red-700 font-bold">⚠️ Action Required</p>
                <p className="text-sm text-red-600">{warningMsg}</p>
             </div>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span>👤</span> Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input value={p.fullName || ""} onChange={e => updateField("fullName", e.target.value)} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input value={p.email || ""} onChange={e => updateField("email", e.target.value)} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                <input value={p.phone || ""} onChange={e => updateField("phone", e.target.value)} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Total Experience (Years)</label>
                <input type="number" step="0.1" value={p.totalYearsExperience || 0} onChange={e => updateField("totalYearsExperience", parseFloat(e.target.value))} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📝</span> Professional Summary</h2>
            <textarea rows={4} value={p.summary || ""} onChange={e => updateField("summary", e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Summary..." />
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span>💼</span> Work Experience</h2>
            <div className="space-y-6">
                {(p.experience || []).map((exp, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <div><label className="text-xs font-bold text-gray-400">Job Title</label><input value={exp.title || ""} onChange={(e) => updateArrayItem("experience", i, "title", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                            <div><label className="text-xs font-bold text-gray-400">Company</label><input value={exp.company || ""} onChange={(e) => updateArrayItem("experience", i, "company", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                        </div>
                        <div className="mb-2"><label className="text-xs font-bold text-gray-400">Duration</label><input value={exp.duration || ""} onChange={(e) => updateArrayItem("experience", i, "duration", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                        <div><label className="text-xs font-bold text-gray-400">Description</label><textarea rows={2} value={exp.description || ""} onChange={(e) => updateArrayItem("experience", i, "description", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                    </div>
                ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎓</span> Education</h2>
            <div className="space-y-4">
                {(p.education || []).map((edu, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-3 p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1"><label className="text-xs font-bold text-gray-400">Degree</label><input value={edu.degree || ""} onChange={(e) => updateArrayItem("education", i, "degree", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                        <div className="flex-1"><label className="text-xs font-bold text-gray-400">Institution</label><input value={edu.institution || ""} onChange={(e) => updateArrayItem("education", i, "institution", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                        <div className="w-full md:w-32"><label className="text-xs font-bold text-gray-400">Year</label><input value={edu.year_range || edu.year || ""} onChange={(e) => updateArrayItem("education", i, "year_range", e.target.value)} className="w-full p-2 bg-white border rounded" /></div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                <h3 className="font-bold text-lg mb-2">Auto-Fill with AI</h3>
                <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-white mb-3" />
                <button onClick={handleUpload} disabled={uploading} className="w-full bg-white text-indigo-700 font-bold py-2 rounded-lg shadow">{uploading ? "Parsing..." : "Upload & Parse"}</button>
                {parseJob && <div className="mt-3 text-xs bg-black/20 p-2 rounded text-center">Status: <span className="font-mono font-bold uppercase">{parseJob.status}</span></div>}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3">🛠 Skills</h3>
                <div className="flex flex-wrap gap-2">
                    {/* 🛡️ Final defense: Check Array.isArray before mapping */}
                    {Array.isArray(p.skills) ? p.skills.map((skill, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                            {skill}
                        </span>
                    )) : null}
                </div>
            </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h3 className="font-bold text-gray-800 mb-3">📜 Certifications</h3>
    <ul className="space-y-2">
        {/* Check if it exists and is an array before mapping */}
        {Array.isArray(p.certifications) && p.certifications.length > 0 ? (
            p.certifications.map((cert, i) => (
                <li key={i} className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    {cert}
                </li>
            ))
        ) : (
            <li className="text-xs text-gray-400 italic">No certifications found</li>
        )}
    </ul>
</div>

            <button onClick={saveProfile} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md">Save Profile Changes</button>
        </div>
      </div>
    </div>
  );
}