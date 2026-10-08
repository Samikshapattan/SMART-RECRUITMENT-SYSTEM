import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);

      // --- LOGIC CHANGE FOR REDIRECT ---
      if (data.user.role === "recruiter") {
        nav("/recruiter-dashboard");
      } else {
        nav("/profile");
      }
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <div className="text-5xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-indigo-100 mt-2">Login to your SmartHire account</p>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="p-8">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                <input
                  required
                  type="email"
                  className="w-full mt-2 border-2 border-gray-200 p-3 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Password</label>
                <input
                  required
                  type="password"
                  className="w-full mt-2 border-2 border-gray-200 p-3 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Sign up now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}