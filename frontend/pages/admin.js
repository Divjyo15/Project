import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const initialForm = {
  title: "",
  content: "",
  author: "",
  category: "general",
};

export default function AdminPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    // Basic client-side validation
    if (!form.title.trim() || !form.content.trim() || !form.author.trim()) {
      setAlert({ type: "error", message: "Add all fields!" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Feed Not Added");
      }

      setAlert({
        type: "success",
        message: "✅ Feed successfully added! Check it on the home page.",
      });
      setForm(initialForm); // form reset
    } catch (error) {
      setAlert({
        type: "error",
        message: `❌ ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">
          Add new coaching feeds — they will be visible in real-time
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
          {alert.type === "success" && (
            <>
              {" "}
              <Link href="/" style={{ color: "inherit", fontWeight: 600 }}>
                Check it out →
              </Link>
            </>
          )}
        </div>
      )}

      {/* Form */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              type="text"
              name="title"
              placeholder="e.g. Today's Motivation 🔥"
              value={form.title}
              onChange={handleChange}
              maxLength={100}
              disabled={loading}
            />
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label">Content *</label>
            <textarea
              className="form-textarea"
              name="content"
              placeholder="Write your coaching message here..."
              value={form.content}
              onChange={handleChange}
              maxLength={1000}
              disabled={loading}
            />
            <small style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {form.content.length}/1000
            </small>
          </div>

          {/* Author */}
          <div className="form-group">
            <label className="form-label">Author *</label>
            <input
              className="form-input"
              type="text"
              name="author"
              placeholder="e.g. Coach Divya"
              value={form.author}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category"
              value={form.category}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="general">General</option>
              <option value="motivation">Motivation</option>
              <option value="tip">Tip</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Adding...
              </>
            ) : (
              "🚀 Publish Feed"
            )}
          </button>
        </form>
      </div>

      {/* Info box */}
      <div style={{
        marginTop: "1.5rem",
        padding: "1rem",
        background: "rgba(108, 99, 255, 0.05)",
        border: "1px solid rgba(108, 99, 255, 0.2)",
        borderRadius: "8px",
        fontSize: "0.8rem",
        color: "var(--text-muted)",
        lineHeight: 1.6
      }}>
        <strong style={{ color: "var(--accent)" }}>ℹ️ How it works:</strong>
        <br />
        After adding a feed, the home page will update in real time automatically — without needing a refresh. The Redis cache will also be cleared so that users always get fresh data.
      </div>
    </div>
  );
}
