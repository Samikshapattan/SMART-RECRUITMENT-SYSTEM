import { useState, useRef, useEffect } from "react";
import { searchCandidatesChat } from "../api/recruiter";
import { getMe } from "../api/auth";

export default function RecruiterDashboard() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recruiterName, setRecruiterName] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const bottomRef = useRef(null);

  const clean = (val) => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'object') {
      return val.title || val.name || val.label || JSON.stringify(val);
    }
    return String(val);
  };

  const handleCandidateClick = (candidate) => {
    console.log("Candidate clicked:", candidate);
    setSelectedCandidate(candidate);
  };

  useEffect(() => {
    getMe().then(data => {
        const user = data.user || data;
        setRecruiterName(user.name || "Recruiter");
    }).catch(() => {});

    setMessages([{
        sender: "bot",
        text: "Hello! I am your AI Recruitment Assistant. Tell me what kind of candidate you are looking for."
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await searchCandidatesChat(userMsg.text);
      
      const botMsg = {
        sender: "bot",
        text: `I found ${data.count} candidates that match your requirements.`,
        filters: data.filters_used,
      };
      
      const candidateMsg = {
        sender: "results",
        candidates: data.candidates || [],
      };

      setMessages((prev) => [...prev, botMsg, candidateMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I couldn't complete the search. Please check the backend logs." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-6 shadow-lg flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white">🎯 Smart Recruitment Dashboard</h1>
            <p className="text-indigo-100 text-sm mt-1">Welcome, {recruiterName}</p>
        </div>
        <div className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-full font-bold">
            AI Search Active ⚡
        </div>
      </div>

      {/* MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setSelectedCandidate(null)} 
          />
          
          <div className="relative bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">{clean(selectedCandidate.name)}</h2>
                <p className="text-indigo-100 text-sm">{clean(selectedCandidate.email)}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-3xl hover:opacity-70 transition-opacity">&times;</button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
                  <span className="text-[11px] font-bold text-green-700 uppercase block mb-1">Years of Experience</span>
                  <p className="text-3xl font-bold text-green-900">{selectedCandidate.experience || 0}</p>
                  <p className="text-xs text-green-600 mt-1">years</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-2xl border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-700 uppercase block mb-1">Contact</span>
                  <p className="text-sm font-bold text-blue-900 break-all">{clean(selectedCandidate.email)}</p>
                  {selectedCandidate.phone && (
                    <p className="text-xs text-blue-600 mt-2">{clean(selectedCandidate.phone)}</p>
                  )}
                </div>
              </div>

              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-3">Technical Skills ({selectedCandidate.skills.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold shadow-sm">
                        {clean(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedCandidate.summary && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">Professional Summary</span>
                  <div className="bg-indigo-50 p-5 rounded-2xl border-l-4 border-indigo-400">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {clean(selectedCandidate.summary)}
                    </p>
                  </div>
                </div>
              )}

              {selectedCandidate.location && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">Location</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">📍 {clean(selectedCandidate.location)}</p>
                </div>
              )}

              {selectedCandidate.github && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">GitHub Profile</span>
                  <a href={selectedCandidate.github} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {clean(selectedCandidate.github)}
                  </a>
                </div>
              )}

              {selectedCandidate.linkedin && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">LinkedIn Profile</span>
                  <a href={selectedCandidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                    {clean(selectedCandidate.linkedin)}
                  </a>
                </div>
              )}

              {selectedCandidate.portfolio && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">Portfolio</span>
                  <a href={selectedCandidate.portfolio} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline break-all">
                    {clean(selectedCandidate.portfolio)}
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 sticky bottom-0">
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full font-bold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            
            {/* User Message */}
            {msg.sender === "user" && (
              <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none max-w-xl shadow-md">
                {msg.text}
              </div>
            )}

            {/* Bot Message */}
            {msg.sender === "bot" && (
              <div className="bg-white border text-gray-800 px-5 py-3 rounded-2xl rounded-tl-none max-w-xl shadow-sm">
                <p>{msg.text}</p>
                {msg.filters && (
                  <div className="mt-3 text-xs bg-gray-100 p-2 rounded border border-gray-200">
                    <strong>Search Filters Applied:</strong>
                    <ul className="list-disc list-inside mt-1 text-gray-600">
                        {msg.filters.skills?.length > 0 && <li>Skills: {msg.filters.skills.join(", ")}</li>}
                        {msg.filters.min_experience > 0 && <li>Min Experience: {msg.filters.min_experience} Years</li>}
                        {msg.filters.role_keywords?.length > 0 && <li>Keywords: {msg.filters.role_keywords.join(", ")}</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Results Cards */}
            {msg.sender === "results" && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {msg.candidates.map((cand) => (
                  <div 
                    key={cand.id} 
                    onClick={() => handleCandidateClick(cand)}
                    className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer hover:scale-[1.02] group flex flex-col"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition">{cand.name}</h3>
                        <p className="text-sm text-gray-500">{cand.email}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                        {cand.experience} Yrs
                      </span>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(cand.skills || []).slice(0, 4).map((skill, i) => (
                        <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                          {skill}
                        </span>
                      ))}
                      {cand.skills.length > 4 && <span className="text-xs text-gray-400">+{cand.skills.length - 4}</span>}
                    </div>

                    <div className="mt-3 pt-3 border-t text-sm text-gray-600 line-clamp-2 flex-grow">
                      {cand.summary || "No summary available."}
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCandidateClick(cand);
                      }}
                      className="mt-3 w-full py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium transition"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
                {msg.candidates.length === 0 && (
                    <div className="col-span-3 text-center text-gray-500 italic py-4 bg-gray-100 rounded-lg">
                        No candidates found matching those criteria.
                    </div>
                )}
              </div>
            )}
          </div>
        ))}
        {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm ml-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                Thinking...
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-6 border-t border-gray-100 shadow-lg">
        <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
          <input
            className="flex-1 border-2 border-gray-200 rounded-full px-6 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-sm"
            placeholder="🔍 e.g., Java Developer with 5+ years of experience in Bangalore..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>
    </div>
  );
}