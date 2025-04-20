const cleanNameForESPN = (name) => {
  return name
    .normalize("NFD")                   // Remove diacritics
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

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

  
  return "https://cdn.nba.com/headshots/nba/latest/1040x760/101126.png";
};
