"use client";

import { FC, useState } from "react";
import { NoteWithPubkey } from "@/types/note";
import { useNoteProgram } from "@/hooks/useNoteProgram";
import { MAX_CONTENT_LENGTH } from "@/utils/constants";
import toast from "react-hot-toast";
import { BN } from "@coral-xyz/anchor";

interface Props {
  note: NoteWithPubkey;
  onNoteUpdated: () => void;
  onNoteDeleted: () => void;
}

export const NoteCard: FC<Props> = ({ note, onNoteUpdated, onNoteDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [loading, setLoading] = useState(false);
  const { updateNote, deleteNote } = useNoteProgram();

  const noteId = note.id instanceof BN ? note.id.toNumber() : Number(note.id);

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const tx = await updateNote(noteId, editContent);
      toast.success(`Note updated! TX: ${tx.slice(0, 8)}...`);
      setIsEditing(false);
      onNoteUpdated();
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast.error(error.message || "Failed to update note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    setLoading(true);

    try {
      const tx = await deleteNote(noteId);
      toast.success(`Note deleted! TX: ${tx.slice(0, 8)}...`);
      onNoteDeleted();
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast.error(error.message || "Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-purple-400">{note.title}</h3>
        <span className="text-xs text-gray-500">#{noteId}</span>
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mb-2">
            {editContent.length}/{MAX_CONTENT_LENGTH} characters
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={loading || !editContent.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(note.content);
              }}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-300 whitespace-pre-wrap mb-4">
            {note.content}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        PDA: {note.publicKey.toString().slice(0, 20)}...
      </div>
    </div>
  );
};
