import { useState, useEffect } from "react";
import { getDomains, createAccount, getToken, getMessages } from "./services/mailtm";

export default function App() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [token, setToken] = useState("");

  const generate = async () => {
    try {
      setLoading(true);
      const domains = await getDomains();
      const domain = domains[0] || "maxxspace.com";
      const name = Math.random().toString(36).substring(2, 10);
      const address = `${name}@${domain}`;
      const password = "Pass123!" + Math.random().toString(36).substring(2, 8);

      await createAccount(address, password);
      const t = await getToken(address, password);
      setToken(t);
      setEmail(address);
      setMessages([]);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      const msgs = await getMessages(token);
      setMessages(msgs);
    }, 3000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div style={{ fontFamily: "system-ui", padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>📧 Email Times / الايميل المؤقت</h1>
      <p style={{ color: "green" }}>✅ الموقع شغال! Ready 21s</p>
      
      <button onClick={generate} disabled={loading} style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}>
        {loading ? "جاري التوليد..." : "توليد ايميل جديد"}
      </button>

      {email && (
        <div style={{ marginTop: 20, padding: 15, background: "#f0f0f0", borderRadius: 8 }}>
          <strong>ايميلك:</strong> {email}
          <br />
          <small>انسخه واستخدمه</small>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <h3>الرسائل ({messages.length})</h3>
        {messages.length === 0 ? <p>لا توجد رسائل بعد - انتظر 3 ثواني...</p> : null}
        {messages.map((m: any) => (
          <div key={m.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10, borderRadius: 6 }}>
            <strong>{m.subject}</strong>
            <div>من: {m.from?.address}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

