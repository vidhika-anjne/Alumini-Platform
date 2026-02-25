import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PostForm({ onCreated, initialPrompt = "", minimal = false, onExpand }) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialPrompt || "");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Update content when a suggestion card sets a new prompt
  useEffect(() => {
    setContent(initialPrompt || "");
  }, [initialPrompt]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (minimal && onExpand) {
      onExpand();
      return;
    }
    if (!user?.id) {
      setError("Missing alumni id");
      return;
    }
    if (!content.trim() && !file) {
      setError("Post content cannot be empty");
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

  if (minimal) {
    return (
      <div 
        onClick={onExpand}
        className="flex items-center gap-3 cursor-pointer"
      >
        <textarea
          readOnly
          className="flex-1 resize-none rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500"
          value={content}
          rows={1}
          placeholder={"What's on your mind?"}
        />
        <button
          type="button"
          className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
        >
          Post
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4"
    >
      <textarea
        className="w-full min-h-[120px] rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-300 dark:focus:ring-indigo-500/30"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={"What's happening?"}
        autoFocus
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
            <span>🖼️ Attach Media</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
          </label>
          {file && (
            <span className="text-xs text-indigo-600 font-medium">
              Selected: {file.name}
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                className="ml-2 text-rose-500"
              >
                ✕
              </button>
            </span>
          )}
        </div>
        
        <button
          className="ml-auto inline-flex items-center rounded-full bg-indigo-600 px-8 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 disabled:opacity-50"
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
