import { useState, useRef } from "react";

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
  
  // --- NEW: Image handling state ---
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  // Process image, call backend
  const handleFiles = async (files) => {
    console.log(files)
    let filesArray = Array.from(files);

    const newImages = filesArray.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file: file,
      previewUrl: URL.createObjectURL(file),
      identifiedEquipment: "Detecting...",
    }));
    setImages((prev) => [...prev, ...newImages]);

    const formData = new FormData();
    filesArray.forEach((file) => {
      formData.append("files", file); 
    });

    try {
      const res = await fetch("http://localhost:8080/api/detect", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        // Assuming your Java method returns a JSON array of strings
        const detectedEquipmentArray = await res.json(); 
        console.log("Spring Boot detected:", detectedEquipmentArray);
        
        // TODO: Update your image state with the returned labels!
      } else {
        console.error("Server returned an error:", res.status);
      }
    } catch (error) {
      console.error("Could not connect to Spring Boot:", error);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const updateEquipmentText = (id, newText) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, identifiedEquipment: newText } : img))
    );
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
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
        body: JSON.stringify({ ...form, images }),
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

  // --- Reusable UI Components ---
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
          <button onClick={() => { setSubmitted(false); setStatus(null); setImages([]); }}
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

        {/* Equipment Chip Selection */}
        <Section>
          <Label>Available equipment</Label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {EQUIPMENT.map((e) => (
              <Chip key={e} label={e} active={form.availableEquipment.includes(e)} onClick={() => toggleItem("availableEquipment", e)} />
            ))}
          </div>
        </Section>

        {/* NEW: Image Upload & Preview Section */}
        <Section>
          <Label>Or upload gym photos to auto-detect equipment</Label>
          
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `1.5px dashed ${isDragging ? "#C8F264" : "#333"}`,
              backgroundColor: isDragging ? "#1a1f0a" : "#111",
              borderRadius: "8px",
              padding: "32px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: images.length > 0 ? "24px" : "0",
            }}
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              hidden 
              ref={fileInputRef} 
              onChange={(e) => handleFiles(e.target.files)} 
            />
            <div style={{ fontSize: "20px", marginBottom: "8px", color: isDragging ? "#C8F264" : "#888" }}>
              {isDragging ? "Drop images here" : "+ Drag & drop or click to upload"}
            </div>
            <div style={{ fontSize: "11px", color: "#555" }}>JPG, PNG up to 5MB</div>
          </div>

          {/* Image Previews & Editable Text */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {images.map((img) => (
              <div key={img.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "#151515", padding: "12px", borderRadius: "8px", border: "1px solid #222" }}>
                
                {/* Image Thumbnail */}
                <div style={{ position: "relative", width: "120px", height: "120px", flexShrink: 0 }}>
                  <img 
                    src={img.previewUrl} 
                    alt="Upload preview" 
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }} 
                  />
                  <button 
                    onClick={() => removeImage(img.id)}
                    style={{ position: "absolute", top: "4px", right: "4px", background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}
                  >
                    ×
                  </button>
                </div>

                {/* Editable Text Section */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", height: "120px" }}>
                  <Label>Detected Equipment:</Label>
                  <input
                    type="text"
                    value={img.identifiedEquipment}
                    onChange={(e) => updateEquipmentText(img.id, e.target.value)}
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: "1.5px solid #333",
                      color: "#C8F264",
                      fontSize: "14px",
                      fontFamily: "'DM Mono', monospace",
                      padding: "8px 0",
                      outline: "none",
                      width: "100%",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderBottom = "1.5px solid #C8F264"}
                    onBlur={(e) => e.target.style.borderBottom = "1.5px solid #333"}
                  />
                  <div style={{ fontSize: "10px", color: "#555", marginTop: "8px" }}>
                    Click the text above to edit if the AI made a mistake.
                  </div>
                </div>
              </div>
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
            {JSON.stringify({ ...form, images: images.map(i => ({ id: i.id, equipment: i.identifiedEquipment })) }, null, 2)}
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