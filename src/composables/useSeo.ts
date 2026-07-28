import { useHead } from "@unhead/vue";

interface SeoInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
}

const canonicalOrigin = "https://ushkovet.ru";

export function useSeo({
  title,
  description,
  path,
  image = "/og.jpg",
  noindex = false,
}: SeoInput): void {
  const canonical = new URL(path, canonicalOrigin).toString();
  const imageUrl = new URL(image, canonicalOrigin).toString();

  useHead({
    title,
    htmlAttrs: { lang: "ru" },
    link: [{ rel: "canonical", href: canonical }],
    meta: [
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex ? "noindex, nofollow" : "index, follow",
      },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "УшкоВет" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: imageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
  });
}
