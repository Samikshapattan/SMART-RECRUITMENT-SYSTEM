import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../api/auth";
import Loader from "../components/Loader";

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        const user = data.user || data;

        // --- 🔒 THE LOGIC UPDATE IS HERE 🔒 ---
        // Check if profile is "empty". We use 'skills' as the indicator.
        // You can also check for 'totalYearsExperience' or 'fullName'.
        const isProfileIncomplete = 
            !user.candidateProfile || 
            !user.candidateProfile.skills || 
            user.candidateProfile.skills.length === 0;

        if (isProfileIncomplete) {
          // Redirect to profile with a message
          navigate("/profile", { 
            state: { warning: "⚠️ You must complete your profile or upload a resume before viewing jobs." } 
          });
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Auth check failed", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

  if (loading) return <Loader text="Checking profile eligibility..." />;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Available Jobs</h1>
      
      <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
        <p className="text-green-800">
            ✅ <strong>Profile Verified:</strong> Your resume has been parsed successfully. You are now eligible to apply.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder Job Cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <h3 className="font-bold text-lg">Senior Java Developer</h3>
            <p className="text-gray-500 text-sm mb-4">TechCorp Inc • Bangalore</p>
            <div className="flex gap-2 mb-4">
                <span className="bg-gray-100 text-xs px-2 py-1 rounded">Java</span>
                <span className="bg-gray-100 text-xs px-2 py-1 rounded">Spring Boot</span>
            </div>
            <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}