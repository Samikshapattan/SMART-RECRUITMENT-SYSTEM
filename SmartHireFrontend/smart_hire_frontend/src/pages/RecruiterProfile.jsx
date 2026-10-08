import { useEffect, useState } from "react";
import { getMe, updateMe } from "../api/auth";
import Loader from "../components/Loader";

export default function RecruiterProfile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        const u = data.user || data;
        setUser(u);
        // Load existing recruiter details
        setFormData({
            name: u.name,
            email: u.email,
            company: u.recruiterProfile?.company || "",
            position: u.recruiterProfile?.position || ""
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  async function handleSave() {
    try {
        await updateMe({
            name: formData.name,
            email: formData.email,
            recruiterProfile: {
                company: formData.company,
                position: formData.position
            }
        });
        alert("Profile Updated Successfully");
    } catch (err) {
        alert("Update failed");
    }
  }

  if (loading) return <Loader text="Loading Recruiter Profile..." />;

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Recruiter Profile</h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                <input 
                    className="w-full mt-1 p-3 border rounded-lg"
                    value={formData.name || ""}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input 
                    className="w-full mt-1 p-3 border rounded-lg bg-gray-50"
                    value={formData.email || ""}
                    disabled
                />
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Company Name</label>
            <input 
                className="w-full mt-1 p-3 border rounded-lg"
                placeholder="e.g. Google, Microsoft, Startup Inc."
                value={formData.company || ""}
                onChange={e => setFormData({...formData, company: e.target.value})}
            />
        </div>

        <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Your Position</label>
            <input 
                className="w-full mt-1 p-3 border rounded-lg"
                placeholder="e.g. HR Manager, Senior Tech Recruiter"
                value={formData.position || ""}
                onChange={e => setFormData({...formData, position: e.target.value})}
            />
        </div>

        <button 
            onClick={handleSave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md"
        >
            Save Changes
        </button>
      </div>
    </div>
  );
}