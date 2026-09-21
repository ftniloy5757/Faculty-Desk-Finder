import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FACULTY_LIST_URL = "https://cse.bracu.ac.bd/faculty_list";
const DATA_FILE_PATH = path.join(__dirname, "../src/data/facultyData.json");

async function syncFaculty() {
  console.log(`Fetching faculty directory from ${FACULTY_LIST_URL}...`);
  const response = await fetch(FACULTY_LIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch faculty list: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  console.log(`Fetched ${html.length} bytes of HTML. Parsing faculty cards...`);

  const cardRegex = /<div class="relative fac-card">([\s\S]*?)<\/div>\s*<\/div>\s*<!-- Livewire Component/g;
  const scraped = [];
  let m;
  while ((m = cardRegex.exec(html)) !== null) {
    const block = m[1];
    const linkMatch = block.match(/href="([^"]*faculty_profile[^"]*)"/);
    const imgMatch = block.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*fac-card-img/);
    const nameMatch = block.match(/<p class="[^"]*normal-case[^"]*">([^<]+)<\/p>/);
    const emailMatch = block.match(/<p class="[^"]*text-slate-500[^"]*">([^<]+@[^<]+)<\/p>/);
    const pMatches = [...block.matchAll(/<p[^>]*>([^<]+)<\/p>/g)].map((x) => x[1].trim());

    const name = nameMatch ? nameMatch[1].trim() : (pMatches[0] || "");
    const email = emailMatch ? emailMatch[1].trim().toLowerCase() : "";
    const roles = pMatches.filter((p) => p !== name && !p.includes("@"));

    let imageUrl = imgMatch ? imgMatch[1].trim() : "";
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = "https://cse.bracu.ac.bd" + imageUrl;
    }

    scraped.push({
      name,
      email,
      roles: roles.join(" • "),
      profileUrl: linkMatch ? linkMatch[1].trim() : "",
      imageUrl,
    });
  }

  console.log(`Successfully extracted ${scraped.length} faculty cards from live website.`);

  // Load existing faculty data
  const existing = JSON.parse(fs.readFileSync(DATA_FILE_PATH, "utf8"));
  let matchedCount = 0;

  const updated = existing.map((f) => {
    if (!f.initial || f.position === "Room") {
      return f;
    }

    const fEmail = (f.email || "").toLowerCase().trim();
    const liveMatch = scraped.find((s) => s.email && s.email === fEmail);

    if (liveMatch) {
      matchedCount++;
      return {
        ...f,
        name: liveMatch.name || f.name,
        position: liveMatch.roles || f.position,
        imageUrl: liveMatch.imageUrl || "",
        profileUrl: liveMatch.profileUrl || `https://cse.bracu.ac.bd/faculty_list?search=${f.initial}`,
      };
    }

    // Unmatched fallback
    return {
      ...f,
      imageUrl: "",
      profileUrl: `https://cse.bracu.ac.bd/faculty_list?search=${f.initial}`,
    };
  });

  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(updated, null, 2), "utf8");
  console.log(`Updated ${DATA_FILE_PATH}: ${matchedCount} faculty matched with real photos and profiles.`);
}

syncFaculty().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
