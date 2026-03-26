import { useState } from "react";

const MUSCLES = ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "LEGS", "GLUTES", "CORE", "CALVES"];
const EQUIPMENT = ["BARBELL", "DUMBBELLS", "PULL_UP_BAR", "RESISTANCE_BANDS", "KETTLEBELL", "CABLE_MACHINE", "BODYWEIGHT"];

export default function WorkoutForm() {
  const [form, setForm] = useState({
    userGoal: "",
    userLevel: "",
    numDays: 3,
    targetMuscles: [],
    availableEquipment: [],
  });
  const [status, setStatus] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmit = async () => {
    if (!form.userGoal || !form.userLevel || form.targetMuscles.length === 0) {
      setStatus({ ok: false, msg: "Please fill in all required fields." });
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
        setStatus({ ok: true, msg: "Submitted successfully!" });
      } else {
        setStatus({ ok: false, msg: `Server error: ${res.status}` });
      }
    } catch {
      setStatus({ ok: false, msg: "Could not reach the server. Is Spring Boot running?" });
    }
  };

  const Chip = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "999px",
        border: `1.5px solid ${active ? "#C8F264" : "#2e2e2e"}`,
        background: active ? "#C8F264" : "#1a1a1a",
        color: active ? "#0d0d0d" : "#aaa",
        fontSize: "12px",
        fontFamily: "'DM Mono', monospace",
        cursor: "pointer",
        fontWeight: active ? "600" : "400",
        transition: "all 0.15s ease",
        letterSpacing: "0.03em",
      }}
    >
      {label}
    </button>
  );

  const Label = ({ children, required }) => (
    <div style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
      {children}{required && <span style={{ color: "#C8F264", marginLeft: 4 }}>*</span>}
    </div>
  );

  const Section = ({ children, style }) => (
    <div style={{ marginBottom: "32px", ...style }}>{children}</div>
  );

  if (submitted) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d0d", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono', monospace",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>✓</div>
          <div style={{ fontSize: "22px", color: "#C8F264", fontWeight: 600, marginBottom: 8 }}>Program received.</div>
          <div style={{ color: "#555", fontSize: "13px" }}>Your workout config has been sent to the backend.</div>
          <button onClick={() => { setSubmitted(false); setStatus(null); }}
            style={{ marginTop: 32, padding: "10px 28px", background: "transparent", border: "1.5px solid #333", color: "#888", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", color: "#e8e8e8", padding: "60px 24px", fontFamily: "'DM Mono', monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: "48px", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em", lineHeight: 1, color: "#fff" }}>
            THIS IS A TEMPorary<br />
            <span style={{ color: "#C8F264" }}>EXAMPLE</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#555", letterSpacing: "0.08em" }}>
            Configure your workout preferences below
          </div>
        </div>

        {/* Goal */}
        <Section>
          <Label required>Goal</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["STRENGTH", "MUSCLE", "BOTH"].map((g) => (
              <Chip key={g} label={g} active={form.userGoal === g} onClick={() => setForm({ ...form, userGoal: g })} />
            ))}
          </div>
        </Section>

        {/* Level */}
        <Section>
          <Label required>Experience level</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((l) => (
              <Chip key={l} label={l} active={form.userLevel === l} onClick={() => setForm({ ...form, userLevel: l })} />
            ))}
          </div>
        </Section>

        {/* Num days */}
        <Section>
          <Label>Days per week</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <input
              type="range" min={1} max={7} value={form.numDays}
              onChange={(e) => setForm({ ...form, numDays: parseInt(e.target.value) })}
              style={{ flex: 1, accentColor: "#C8F264" }}
            />
            <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", color: "#C8F264", minWidth: 28 }}>
              {form.numDays}
            </div>
          </div>
        </Section>

        {/* Target muscles */}
        <Section>
          <Label required>Target muscles</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MUSCLES.map((m) => (
              <Chip key={m} label={m} active={form.targetMuscles.includes(m)} onClick={() => toggleItem("targetMuscles", m)} />
            ))}
          </div>
        </Section>

        {/* Equipment */}
        <Section>
          <Label>Available equipment</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EQUIPMENT.map((e) => (
              <Chip key={e} label={e} active={form.availableEquipment.includes(e)} onClick={() => toggleItem("availableEquipment", e)} />
            ))}
          </div>
        </Section>

        {/* JSON preview */}
        <Section>
          <Label>Preview</Label>
          <pre style={{
            background: "#111", border: "1px solid #1e1e1e", borderRadius: 8,
            padding: "16px", fontSize: 11, color: "#555", overflowX: "auto", lineHeight: 1.7,
          }}>
            {JSON.stringify(form, null, 2)}
          </pre>
        </Section>

        {/* Error */}
        {status && !status.ok && (
          <div style={{ marginBottom: 16, padding: "10px 16px", background: "#1a0a0a", border: "1px solid #4a1a1a", borderRadius: 8, color: "#e07070", fontSize: 12 }}>
            {status.msg}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%", padding: "16px", background: "#C8F264", color: "#0d0d0d",
            border: "none", borderRadius: 8, fontSize: 13, fontFamily: "'DM Mono', monospace",
            fontWeight: 600, letterSpacing: "0.08em", cursor: "pointer",
            textTransform: "uppercase", transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.target.style.opacity = 0.85}
          onMouseLeave={e => e.target.style.opacity = 1}
        >
          Send to backend →
        </button>
      </div>
    </div>
  );
}
