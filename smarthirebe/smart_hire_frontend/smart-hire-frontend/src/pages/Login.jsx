import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      nav("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    }
  }

  return (
    <div className="h-[80vh] flex items-center justify-center">
      <form className="bg-white p-6 rounded shadow w-full max-w-md" onSubmit={submit}>
        <h2 className="text-2xl font-semibold mb-4">Login</h2>

        <input className="w-full border p-2 rounded mb-3" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="w-full border p-2 rounded mb-4" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />

        <button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
      </form>
    </div>
  );
}
