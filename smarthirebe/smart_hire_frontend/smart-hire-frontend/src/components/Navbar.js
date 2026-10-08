import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="font-bold text-lg text-indigo-600">SmartHire</Link>

        <div className="space-x-3">
          {token ? (
            <>
              <Link to="/upload" className="text-gray-700 hover:text-indigo-600">Upload</Link>
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600">Profile</Link>
              <button onClick={logout} className="text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="text-gray-700">Login</Link>
              <Link to="/register" className="text-gray-700">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
