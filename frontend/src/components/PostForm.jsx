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
    <form
      onSubmit={submit}
      className="mb-4 space-y-4 rounded-3xl border border-sky-100 bg-sky-50/90 p-5 shadow-lg shadow-indigo-500/5 dark:border-slate-800 dark:bg-slate-950/70"
    >
      <textarea
        className="w-full rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-300 dark:focus:ring-indigo-500/30"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={1}
        placeholder={"What's happening?"}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Attach image or video
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-2 text-xs"
          />
        </label>
        <button
          className="ml-auto inline-flex items-center rounded-full bg-indigo-600 px-6 py-1 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:opacity-50"
          disabled={loading}
          type="submit"
        >
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
    </form>
  )
}
