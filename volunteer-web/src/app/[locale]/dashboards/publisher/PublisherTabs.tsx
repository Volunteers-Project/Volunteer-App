"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublisherTabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "Create News", slug: "create" },
    { name: "My Articles", slug: "my-articles" },
  ];

  const base = pathname.split("/").slice(0, 4).join("/");

  return (
    <div className="flex gap-4 border-b pb-2 mb-6">
      {tabs.map(t => (
        <Link
          key={t.slug}
          href={`${base}/${t.slug}`}
          className={`px-3 py-1 border-b-2 ${
            pathname.includes(t.slug)
              ? "border-blue-600 font-semibold"
              : "border-transparent"
          }`}
        >
          {t.name}
        </Link>
      ))}
    </div>
  );
}
