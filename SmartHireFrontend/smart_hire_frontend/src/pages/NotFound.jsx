import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] text-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <div className="mb-8">
        <div className="text-9xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Oops! Page Not Found</h1>
        <p className="text-gray-600 text-lg mb-8">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      
      <Link 
        to="/" 
        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
      >
        🏠 Back to Home
      </Link>
    </div>
  );
}
