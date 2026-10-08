import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="mb-8 animate-fade-in">
          <span className="inline-block text-6xl mb-4">✨</span>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Smart Hiring Simplified
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Upload your resume in seconds, get AI-powered analysis, instant ATS score, and connect with top recruiters.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center mb-16 flex-wrap">
          <Link
            to="/register?role=candidate"
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 transform"
          >
            👨‍💼 Find Your Dream Job
          </Link>
          <Link
            to="/register?role=recruiter"
            className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105 transform"
          >
            🎯 Find Candidates
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Instant Resume Parsing</h3>
            <p className="text-gray-600">Upload your resume and get AI-powered instant parsing with detailed breakdown</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">ATS Score Analysis</h3>
            <p className="text-gray-600">Get your ATS compatibility score and receive personalized recommendations</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Smart Matching</h3>
            <p className="text-gray-600">Connect with recruiters and jobs that match your profile perfectly</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">AI-Powered Search</h3>
            <p className="text-gray-600">Recruiters use advanced AI to find candidates with exact skill match</p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Real-time Updates</h3>
            <p className="text-gray-600">Get instant notifications about new job matches and recruiter interactions</p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl mb-4">🎖️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Verified Profiles</h3>
            <p className="text-gray-600">Build a verified profile that stands out to employers and recruiters</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <p className="text-indigo-100">Candidates Hired</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-indigo-100">Companies</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <p className="text-indigo-100">Success Rate</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mb-8">
          <p className="text-gray-600 mb-4">Ready to get started?</p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transition-all hover:scale-105"
          >
            Join SmartHire Today
          </Link>
        </div>
      </div>
    </div>
  );
}
