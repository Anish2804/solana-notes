"use client";

import { FC, useState } from "react";
import { useNoteProgram } from "@/hooks/useNoteProgram";
import { MAX_TITLE_LENGTH, MAX_CONTENT_LENGTH } from "@/utils/constants";
import toast from "react-hot-toast";

interface Props {
  onNoteCreated: () => void;
}

export const CreateNote: FC<Props> = ({ onNoteCreated }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { createNote } = useNoteProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setLoading(true);

    try {
      const tx = await createNote(title, content);
      toast.success(`Note created! TX: ${tx.slice(0, 8)}...`);
      setTitle("");
      setContent("");
      onNoteCreated();
    } catch (error: any) {
      console.error("Error creating note:", error);
      toast.error(error.message || "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Create New Note</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Note title"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/{MAX_TITLE_LENGTH} characters
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium mb-2">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={5}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Write your note here..."
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {content.length}/{MAX_CONTENT_LENGTH} characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? "Creating..." : "Create Note"}
        </button>
      </form>
    </div>
  );
};
