import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PostForm({ onCreated, initialPrompt = "" }) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialPrompt || "");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update content when a suggestion card sets a new prompt
  useEffect(() => {
    if (initialPrompt) {
      setContent(initialPrompt);
    }
  }, [initialPrompt]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setError("Missing alumni id");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("content", content);
      if (file) form.append("media", file);
      const { data } = await api.post(`/api/v1/posts/create/${user.id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setContent("");
      setFile(null);
      onCreated?.(data);
    } catch (err) {
      const backendData = err?.response?.data;
      let message = "Failed to create post";

      if (typeof backendData === "string") {
        message = backendData;
      } else if (backendData && typeof backendData === "object") {
        message = backendData.message || backendData.error || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h4 style={{ margin: 0 }}>Create Post</h4>
      </div>

      <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--muted)" }}>
        Share updates, advice, or experiences with your juniors.
      </p>

      <textarea
        className="textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder={"What's happening?"}
        style={{ marginTop: 4, marginBottom: 10, resize: "vertical" }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <label style={{ fontSize: 13, color: "var(--muted)" }}>
          Attach image or video:
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: "block", marginTop: 4, fontSize: 12 }}
          />
        </label>
        <button className="button primary" disabled={loading} type="submit">
          {loading ? "Posting…" : "Post"}
        </button>
      </div>

      {error && (
        <p style={{ color: "tomato", marginBottom: 8, fontSize: 13 }}>
          {error}
        </p>
      )}
    </form>
  );
}
