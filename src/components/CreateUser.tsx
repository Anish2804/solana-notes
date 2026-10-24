"use client";

import { FC, useState } from "react";
import { useNoteProgram } from "@/hooks/useNoteProgram";
import { MAX_USERNAME_LENGTH } from "@/utils/constants";
import toast from "react-hot-toast";

interface Props {
  onUserCreated: () => void;
}

export const CreateUser: FC<Props> = ({ onUserCreated }) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { createUser } = useNoteProgram();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (username.length > MAX_USERNAME_LENGTH) {
      toast.error(`Username must be ${MAX_USERNAME_LENGTH} characters or less`);
      return;
    }

    setLoading(true);

    try {
      const tx = await createUser(username);
      toast.success(`Profile created! TX: ${tx.slice(0, 8)}...`);
      onUserCreated();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
      <p className="text-gray-400 mb-4">
        You need to create a profile before you can start taking notes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={MAX_USERNAME_LENGTH}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your username"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            {username.length}/{MAX_USERNAME_LENGTH} characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? "Creating..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
};
