export const getHeadshot = async (name) => {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/search/v2?query=${encodeURIComponent(name)}`
    );
    const data = await res.json();
    const imageUrl = data?.results?.[0]?.contents?.[0]?.image?.default;

    return imageUrl || null;
  } catch (err) {
    console.error("Error fetching ESPN headshot:", err);
    return null;
  }
};
