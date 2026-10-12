import { useState, useEffect } from "react";

const API = "https://api.mail.tm";

export default function App() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [token, setToken] = useState("");

  async function generate() {
    try {
      setLoading(true);
      let domain = "maxxspace.com";
      try {
        const r = await fetch(API + "/domains?page=1");
        const j = await r.json();
        const d = j["hydra:member"]?.[0]?.domain;
        if (d) domain = d;
      } catch {}
      const name = Math.random().toString(36).substring(2, 10);
      const address = name + "@" + domain;
      const password = "Pass123!" + Math.random().toString(36).substring(2, 8);
      
      const ac = await fetch(API + "/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      if (!ac.ok) throw new Error(await ac.text());
      
      const tk = await fetch(API + "/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, password })
      });
      const tj = await tk.json();
      setToken(tj.token);
      setEmail(address);
      setMessages([]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(API + "/messages?page=1", {
          headers: { Authorization: "Bearer " + token }
        });
        const j = await r.json();
        setMessages(j["hydra:member"] || []);
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>Email Times</h1>
      <p style={{ color: "green" }}>Working - Ready</p>
      <button onClick={generate} disabled={loading} style={{ padding: 10 }}>
        {loading ? "Loading..." : "Generate Email"}
      </button>
      {email && <div style={{ marginTop: 20, background: "#f0f0f0", padding: 10 }}>{email}</div>}
      <div style={{ marginTop: 20 }}>
        <h3>Messages ({messages.length})</h3>
        {messages.map((m: any) => (
          <div key={m.id} style={{ border: "1px solid #ccc", padding: 8, marginBottom: 8 }}>
            <b>{m.subject}</b><br/>{m.from?.address}
          </div>
        ))}
      </div>
    </div>
  );
}
