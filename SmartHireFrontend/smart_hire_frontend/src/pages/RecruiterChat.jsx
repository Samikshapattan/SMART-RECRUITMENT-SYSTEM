import { useState, useRef, useEffect } from "react";
import { searchCandidatesChat } from "../api/recruiter";

export default function RecruiterChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ 
    sender: "bot", 
    text: "AI Search active. Try searching for specific companies or 'Java but not Python'." 
  }]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null); 
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CRITICAL FIX: The clean function extracts text from objects like {title: "Java"}
  // This prevents the "Objects are not valid as a React child" crash.
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

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await searchCandidatesChat(input);
      setInput("");
      
      const botMsg = {
        sender: "bot",
        text: data.count > 0 
          ? `I found ${data.count} candidates matching your request.` 
          : "No candidates found matching those criteria.",
      };

      setMessages(prev => [...prev, botMsg, { 
        sender: "results", 
        candidates: data.candidates || [] 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "bot", text: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-indigo-50 to-gray-50 font-sans relative">
      
      {/* 1. THE MODAL (Z-INDEX FIX) */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300">
          {/* Blur Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setSelectedCandidate(null)} 
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white sticky top-0">
              <div>
                <h2 className="text-2xl font-bold">{clean(selectedCandidate.name)}</h2>
                <p className="text-indigo-100 text-sm">{clean(selectedCandidate.email)}</p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-3xl hover:opacity-70 transition-opacity">&times;</button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              {/* Experience & Contact Row */}
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

              {/* Technical Skills */}
              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-3">Technical Skills ({selectedCandidate.skills.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((s, i) => (
                      <span key={i} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-shadow">
                        {clean(s)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Summary */}
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

              {/* Location Info */}
              {selectedCandidate.location && (
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2">Location</span>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl">📍 {clean(selectedCandidate.location)}</p>
                </div>
              )}

              {/* Additional Fields */}
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

              {/* Portfolio or Website */}
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

      {/* 2. CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {(msg.sender === "user" || msg.sender === "bot") && (
              <div className={`p-4 rounded-2xl max-w-md shadow-sm text-sm ${
                msg.sender === "user" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-800"
              }`}>
                {clean(msg.text)}
              </div>
            )}

            {msg.sender === "results" && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {msg.candidates.map((cand, i) => (
                  <div 
                    key={i} 
                    onClick={() => handleCandidateClick(cand)}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-200 flex flex-col cursor-pointer hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-indigo-900">{clean(cand.name)}</h3>
                        <p className="text-xs text-gray-400">{clean(cand.email)}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded">
                        {cand.experience || 0} YRS
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {cand.skills?.slice(0, 4).map((s, si) => (
                        <span key={si} className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {clean(s)}
                        </span>
                      ))}
                      {cand.skills?.length > 4 && <span className="text-[9px] text-gray-400">+{cand.skills.length - 4}</span>}
                    </div>

                    <div 
                      className="mt-auto w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all text-center cursor-pointer"
                    >
                      View Profile
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="text-indigo-600 text-xs font-bold animate-pulse">Analysing profiles...</div>}
        <div ref={bottomRef} />
      </div>

      {/* 3. INPUT FORM */}
      <div className="p-6 bg-white border-t border-gray-100 shadow-lg">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <input 
            className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-full px-6 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            placeholder="🔍 e.g., Java developers with 5+ years of experience in Bangalore..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Searching..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}