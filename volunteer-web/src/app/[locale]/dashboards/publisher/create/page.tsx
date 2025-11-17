'use client';

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function CreateNews() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";

  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  async function handleSubmit() {
    if (!title || !file || !thumbnail) {
      alert("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("tags", JSON.stringify(tags));
    formData.append("thumbnail", thumbnail);
    formData.append("file", file);

    const res = await fetch("/api/publisher/news/create", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("News created!");
      location.reload();
    } else {
      alert("Failed to create news.");
    }
  }

  function addTag() {
    if (tagInput.trim() !== "") {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-200">

      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Create News Article
      </h1>

      {/* Title */}
      <div>
        <label className="block font-medium mb-1 text-gray-700">Title</label>
        <input
          className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg w-full transition"
          placeholder="Enter headline..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Thumbnail */}
      <div>
        <label className="block font-medium mb-1 text-gray-700">
          Thumbnail Image
        </label>

        <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
            className="w-full text-gray-600"
          />
        </div>

        {thumbnail && (
          <p className="text-sm text-green-600 mt-1">
            ✔ Selected: {thumbnail.name}
          </p>
        )}
      </div>

      {/* File Upload */}
      <div>
        <label className="block font-medium mb-1 text-gray-700">
          Upload Document (PDF / DOCX)
        </label>

        <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition cursor-pointer">
          <input
            type="file"
            accept=".doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-gray-600"
          />
        </div>

        {file && (
          <p className="text-sm text-green-600 mt-1">
            ✔ Selected: {file.name}
          </p>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="font-medium text-gray-700">Tags</label>

        <div className="flex gap-3 mt-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Enter tag..."
            className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg w-full transition"
          />

          <button
            onClick={addTag}
            className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Add
          </button>
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {tags.map((t, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm border border-blue-300"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium w-full transition"
      >
        Publish News
      </button>

    </div>
  );
}
