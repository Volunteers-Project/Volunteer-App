"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface NewsItem {
  id: string;
  title: string;
  thumbnail: string;
  previewUrl?: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const res = await fetch("/api/news/latest");
      const json = await res.json();
      setNews(json);
      setLoadingNews(false);
    }
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex flex-col items-center">
      
      {/* HERO SECTION */}
      <div className="mt-24 text-center max-w-2xl px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to <span className="text-blue-600">Volunteer App</span>
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Join us today and be part of something meaningful.
        </p>

        {/* <button
          onClick={() => router.push(`/${locale}/auth`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium shadow-md transition-all hover:scale-[1.03]"
        >
          Go to Login
        </button> */}
      </div>

      {/* LATEST NEWS */}
      <div className="w-full max-w-5xl mt-16 px-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Latest News
        </h2>

        {loadingNews ? (
          <p className="text-gray-500">Loading…</p>
        ) : news.length === 0 ? (
          <p className="text-gray-500">No news available yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            
            {news.map((item) => (
              <div
                key={item.id}
                className="min-w-[250px] cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition-all"
                onClick={() => router.push(`/${locale}/news/${item.id}`)}
              >
                <img
                  src={item.previewUrl || item.thumbnail}
                  className="w-full h-40 object-cover rounded-t-xl"
                  alt={item.title}
                />

                <div className="p-4">
                  <h3 className="text-md font-semibold text-gray-800 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      <div className="mb-20" />
    </div>
  );
}
