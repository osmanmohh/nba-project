import { useEffect, useState } from "react";

// 🧼 Name cleaning function for ESPN search
const cleanNameForESPN = (name) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// 📸 The async fetcher function (still useful standalone if needed)
export const getHeadshot = async (name) => {
  const cleanName = cleanNameForESPN(name);

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/search/v2?query=${encodeURIComponent(cleanName)}`
    );
    const data = await res.json();
    const results = data?.results || [];

    for (const result of results) {
      const contents = result.contents || [];
      for (const item of contents) {
        const imageUrl = item?.image?.default;
        const isESPNImage = imageUrl?.includes(
          "a.espncdn.com/i/headshots/nba/players/full/"
        );
        if (isESPNImage) {
          
          return imageUrl;
        }
      }
    }
  } catch (err) {
    console.error("Error fetching ESPN headshot:", err);
  }

  
};
// 🎣 The hook for React components (one-liner usage!)
export const useHeadshot = (name) => {
  const [headshot, setHeadshot] = useState(null);

  useEffect(() => {
    if (!name) return;

    getHeadshot(name).then(setHeadshot);
  }, [name]);

  return headshot;
};
