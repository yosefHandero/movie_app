import { Movie } from "@/interfaces/interfaces";

/** TMDB standard genre id -> name map for card-level logic */
export const GENRE_ID_TO_NAME: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const MATURE_KEYWORDS = [
  "erotic",
  "erotica",
  "softcore",
  "hardcore",
  "porn",
  "pornographic",
  "nudity",
  "nude",
  "sex",
  "sexual",
  "explicit",
  "incest",
  "fetish",
  "bdsm",
  "orgy",
  "prostitute",
  "prostitution",
  "masturbation",
  "lesbian sex",
  "gay sex",
] as const;

export interface FunGenreLabel {
  label: string;
  description: string;
}

export const GENRE_FUN_LABELS: Record<string, FunGenreLabel> = {
  Action: { label: "Adrenaline", description: "action, speed, fights" },
  Adventure: { label: "Big Quest", description: "adventure, journeys, quests" },
  Animation: {
    label: "Animated Escape",
    description: "animation, family, adventure",
  },
  Comedy: { label: "Laugh Fix", description: "comedy, laughs, fun" },
  Crime: { label: "Crime Corner", description: "crime, detectives, tension" },
  Documentary: {
    label: "Real Stuff",
    description: "documentary, real stories, facts",
  },
  Drama: { label: "Deep Feels", description: "drama, emotion, character" },
  Family: { label: "Family Safe", description: "family, all ages, wholesome" },
  Fantasy: { label: "Magic Worlds", description: "fantasy, magic, worlds" },
  History: { label: "Time Machine", description: "history, period, real events" },
  Horror: { label: "Midnight Scares", description: "horror, scares, suspense" },
  Music: { label: "Soundtrack Mode", description: "music, songs, rhythm" },
  Mystery: { label: "Mind Benders", description: "mystery, twists, puzzles" },
  Romance: { label: "Love Lane", description: "romance, love, relationships" },
  "Science Fiction": {
    label: "Future Shock",
    description: "sci-fi, future, technology",
  },
  "TV Movie": { label: "Couch Picks", description: "TV movie, cozy watch" },
  Thriller: { label: "Edge Seat", description: "thriller, suspense, tension" },
  War: { label: "Battle Zone", description: "war, conflict, intensity" },
  Western: { label: "Dust & Guns", description: "western, frontier, guns" },
};

export type MovieInsightInput = {
  genre_ids?: number[];
  vote_average: number;
  popularity: number;
  overview?: string | null;
  adult: boolean;
  vote_count: number;
  release_date: string;
  genres?: { id: number; name: string }[];
  runtime?: number | null;
};

export type AwkwardMeterTone =
  | "safe"
  | "moderate"
  | "caution"
  | "unknown";

export interface AwkwardMeterResult {
  label: string;
  description: string;
  tone: AwkwardMeterTone;
}

const VIBE_TAG_DESCRIPTIONS: Record<string, string> = {
  Dark: "Moody or intense tone",
  Funny: "Light humor and laughs",
  Emotional: "Feels-heavy storytelling",
  Weird: "Unusual or offbeat vibes",
  Fast: "Quick pacing, little downtime",
  "Slow Burn": "Gradual build, patient pacing",
  Cozy: "Easy, low-stress watch",
  Violent: "Action or violence may appear",
  "Mind-Bending": "Twists and puzzles",
  Family: "Family-friendly tone",
  "Date Night": "Romantic or couple-friendly",
  Mature: "Explicit or adult themes may appear",
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getGenreNames = (movie: MovieInsightInput): string[] => {
  if (movie.genres?.length) {
    return movie.genres.map((g) => g.name);
  }
  return (movie.genre_ids || [])
    .map((id) => GENRE_ID_TO_NAME[id])
    .filter(Boolean);
};

const getOverview = (movie: MovieInsightInput): string =>
  (movie.overview || "").toLowerCase();

const hasGenre = (movie: MovieInsightInput, ...names: string[]): boolean => {
  const genres = getGenreNames(movie).map((g) => g.toLowerCase());
  return names.some((name) => genres.includes(name.toLowerCase()));
};

/** Word-boundary overview match — avoids substring false positives */
const overviewHas = (movie: MovieInsightInput, ...keywords: string[]): boolean => {
  const text = getOverview(movie);
  if (!text) return false;
  return keywords.some((kw) => {
    const pattern = new RegExp(`\\b${escapeRegex(kw.toLowerCase())}\\b`, "i");
    return pattern.test(text);
  });
};

/** Multi-word phrase match in overview */
const overviewHasPhrase = (
  movie: MovieInsightInput,
  ...phrases: string[]
): boolean => {
  const text = getOverview(movie);
  if (!text) return false;
  return phrases.some((phrase) => text.includes(phrase.toLowerCase()));
};

const hasTmdbKeyword = (
  keywords: string[] | undefined,
  ...targets: string[]
): boolean => {
  if (!keywords?.length) return false;
  const normalized = keywords.map((k) => k.toLowerCase());
  return targets.some((target) => {
    const t = target.toLowerCase();
    return normalized.some((k) => k === t || k.includes(t));
  });
};

const isFamilyCert = (cert?: string | null): boolean =>
  !!cert && ["G", "PG"].includes(cert.toUpperCase());

const isTeenCert = (cert?: string | null): boolean =>
  !!cert && ["PG-13", "TV-PG", "TV-14"].includes(cert.toUpperCase());

const isAdultCert = (cert?: string | null): boolean => {
  if (!cert) return false;
  const upper = cert.toUpperCase();
  return ["R", "NC-17", "X", "TV-MA"].includes(upper);
};

const hasMatureSignal = (
  movie: MovieInsightInput,
  certification?: string | null,
  keywords?: string[]
): boolean => {
  if (movie.adult) return true;
  if (isAdultCert(certification)) return true;
  if (hasTmdbKeyword(keywords, ...MATURE_KEYWORDS)) return true;
  if (
    overviewHas(
      movie,
      "erotic",
      "nudity",
      "nude",
      "pornographic",
      "explicit",
      "sexual"
    )
  ) {
    return true;
  }
  if (
    overviewHasPhrase(
      movie,
      "sex scene",
      "full frontal",
      "graphic sex",
      "sexual content"
    )
  ) {
    return true;
  }
  return false;
};

const hasStrongMatureSignal = (
  movie: MovieInsightInput,
  certification?: string | null,
  keywords?: string[]
): boolean => {
  if (movie.adult) return true;
  if (isAdultCert(certification)) return true;
  if (
    hasTmdbKeyword(
      keywords,
      "erotic",
      "erotica",
      "softcore",
      "hardcore",
      "porn",
      "pornographic",
      "nudity",
      "explicit"
    )
  ) {
    return true;
  }
  return false;
};

export const getFunGenreLabel = (genreName: string): FunGenreLabel => {
  const mapped = GENRE_FUN_LABELS[genreName];
  if (mapped) return mapped;
  return {
    label: genreName,
    description: `${genreName.toLowerCase()} movies`,
  };
};

export const getVibeTagDescription = (tag: string): string =>
  VIBE_TAG_DESCRIPTIONS[tag] || `Vibe: ${tag}`;

const resolvePacingTag = (
  movie: MovieInsightInput
): "Fast" | "Slow Burn" | null => {
  const runtime = movie.runtime ?? null;

  const fastScore =
    (hasGenre(movie, "Action", "Thriller", "Adventure") ? 2 : 0) +
    (overviewHas(movie, "fast", "chase", "race") ? 1 : 0);

  const slowScore =
    (hasGenre(movie, "Drama", "Documentary") ? 2 : 0) +
    (runtime !== null && runtime > 140 ? 1 : 0) +
    (overviewHas(movie, "slow", "patient", "gradual") ? 1 : 0);

  if (fastScore > slowScore && fastScore > 0) return "Fast";
  if (slowScore > fastScore && slowScore > 0) return "Slow Burn";
  return null;
};

export const getVibeTags = (
  movie: MovieInsightInput,
  max = 3,
  keywords?: string[],
  certification?: string | null
): string[] => {
  const tags: string[] = [];

  if (hasMatureSignal(movie, certification, keywords)) {
    tags.push("Mature");
  }
  if (hasGenre(movie, "Horror") || overviewHas(movie, "dark", "nightmare", "evil")) {
    tags.push("Dark");
  }
  if (hasGenre(movie, "Comedy") || overviewHas(movie, "funny", "laugh", "hilarious")) {
    tags.push("Funny");
  }
  if (hasGenre(movie, "Drama") || overviewHas(movie, "emotional", "heart", "tear")) {
    tags.push("Emotional");
  }
  if (overviewHas(movie, "strange", "bizarre", "weird", "surreal")) {
    tags.push("Weird");
  }

  const pacingTag = resolvePacingTag(movie);
  if (pacingTag) tags.push(pacingTag);

  if (
    hasGenre(movie, "Family", "Animation") ||
    (movie.vote_average >= 6 &&
      movie.vote_average <= 7.5 &&
      hasGenre(movie, "Comedy"))
  ) {
    tags.push("Cozy");
  }
  if (
    hasGenre(movie, "Action", "War", "Horror", "Thriller") ||
    overviewHas(movie, "violence", "blood", "kill", "fight")
  ) {
    tags.push("Violent");
  }
  if (
    hasGenre(movie, "Mystery", "Science Fiction") ||
    overviewHasPhrase(
      movie,
      "mind-bending",
      "time travel",
      "twist ending",
      "plot twist"
    ) ||
    (hasGenre(movie, "Mystery") && overviewHas(movie, "twist", "puzzle"))
  ) {
    tags.push("Mind-Bending");
  }
  if (hasGenre(movie, "Family", "Animation")) {
    tags.push("Family");
  }
  if (
    hasGenre(movie, "Romance") &&
    !hasGenre(movie, "Documentary") &&
    !hasMatureSignal(movie, certification, keywords)
  ) {
    tags.push("Date Night");
  }

  const unique = [...new Set(tags)];
  return unique.slice(0, max);
};

export const getWhyWatch = (movie: MovieInsightInput): string => {
  const genres = getGenreNames(movie);
  const runtime = movie.runtime ?? null;
  const rating = movie.vote_average;
  const overview = movie.overview?.trim();

  if (hasGenre(movie, "Action") && (runtime === null || runtime < 120)) {
    return "Fast-paced action with almost no slow parts.";
  }
  if (hasGenre(movie, "Horror", "Thriller", "Mystery")) {
    return "A dark mystery for a late-night watch.";
  }
  if (hasGenre(movie, "Comedy", "Animation", "Family")) {
    return "Easy fun when you do not want to think too much.";
  }
  if (hasGenre(movie, "Documentary")) {
    return "A real-story pick if you want something grounded and informative.";
  }
  if (hasGenre(movie, "Romance")) {
    return "A warm pick if you are in the mood for love stories.";
  }
  if (hasGenre(movie, "Drama") && rating >= 7.5) {
    return "Well-rated drama with strong emotional payoff.";
  }
  if (hasGenre(movie, "Science Fiction", "Fantasy")) {
    return "Imaginative world-building for an escape from reality.";
  }
  if (rating >= 8 && movie.vote_count > 500) {
    return "Highly rated by many viewers — a safe crowd-pleaser.";
  }
  if (movie.popularity > 100) {
    return "Popular right now — worth seeing what the buzz is about.";
  }
  if (overview && overview.length > 40) {
    const snippet = overview.split(/[.!?]/)[0]?.trim();
    if (snippet && snippet.length > 20) {
      return `${snippet}.`;
    }
  }
  if (genres.length > 0) {
    return `A solid ${genres[0].toLowerCase()} pick based on its genre and rating.`;
  }
  return "Worth a look based on its rating and popularity.";
};

export const getSkipIf = (
  movie: MovieInsightInput,
  certification?: string | null,
  keywords?: string[]
): string => {
  const runtime = movie.runtime ?? null;

  if (hasMatureSignal(movie, certification, keywords)) {
    return "Skip if explicit content bothers you.";
  }
  if (hasGenre(movie, "Horror") || overviewHas(movie, "violence", "blood", "kill")) {
    return "Skip if violence bothers you.";
  }
  if (
    hasGenre(movie, "Drama") &&
    !hasGenre(movie, "Comedy") &&
    movie.vote_average >= 7
  ) {
    return "Skip if you want something light.";
  }
  if (runtime !== null && runtime > 150) {
    return "Skip if you hate slow movies.";
  }
  if (hasGenre(movie, "Horror", "Thriller")) {
    return "Skip if you are looking for comedy.";
  }
  if (hasGenre(movie, "Documentary", "History")) {
    return "Skip if you want pure entertainment over real stories.";
  }
  if (movie.adult) {
    return "Skip if you need a family-friendly pick.";
  }
  if (hasGenre(movie, "Romance") && !hasGenre(movie, "Comedy")) {
    return "Skip if romance is not your thing.";
  }
  return "Skip if you prefer something very different from its genre.";
};

export const getAwkwardMeter = (
  movie: MovieInsightInput,
  certification?: string | null,
  keywords?: string[]
): AwkwardMeterResult => {
  const mature = hasMatureSignal(movie, certification, keywords);
  const strongMature = hasStrongMatureSignal(movie, certification, keywords);
  const hasDetailSignals =
    certification != null || (keywords != null && keywords.length > 0);

  if (strongMature || movie.adult) {
    return {
      label: "Better Alone",
      description: "Marked adult or explicit — best watched solo.",
      tone: "caution",
    };
  }

  if (mature) {
    return {
      label: "Not for Family",
      description: "Mature themes detected — not ideal with family or casual groups.",
      tone: "caution",
    };
  }

  if (isFamilyCert(certification) && hasGenre(movie, "Family", "Animation")) {
    return {
      label: "Family Safe",
      description: "Family-friendly rating and genres.",
      tone: "safe",
    };
  }

  if (isFamilyCert(certification)) {
    return {
      label: "Parent Friendly",
      description: "Rated for general or parental guidance audiences.",
      tone: "safe",
    };
  }

  if (hasGenre(movie, "Horror") || isAdultCert(certification)) {
    return {
      label: "Not for Family",
      description: "Intense or mature themes — not ideal with family.",
      tone: "caution",
    };
  }

  const isDocRomance =
    hasGenre(movie, "Romance", "Documentary") &&
    (hasGenre(movie, "Romance") && hasGenre(movie, "Documentary"));

  if (
    hasGenre(movie, "Romance") &&
    !hasGenre(movie, "Horror", "Thriller") &&
    !isDocRomance &&
    (isFamilyCert(certification) || isTeenCert(certification))
  ) {
    return {
      label: "Date Night Safe",
      description: "Romance-forward pick that works for couples.",
      tone: "safe",
    };
  }

  if (
    isTeenCert(certification) ||
    hasGenre(movie, "Thriller", "Crime") ||
    overviewHas(movie, "violence", "murder", "drug")
  ) {
    return {
      label: "Maybe Awkward",
      description: "Some mature themes — depends on your crowd.",
      tone: "moderate",
    };
  }

  if (!hasDetailSignals && !certification) {
    return {
      label: "Comfort unknown",
      description: "Not enough data to judge watch comfort.",
      tone: "unknown",
    };
  }

  if (!certification && !movie.genres?.length && !movie.genre_ids?.length) {
    return {
      label: "Comfort unknown",
      description: "Not enough data to judge watch comfort.",
      tone: "unknown",
    };
  }

  return {
    label: "Parent Friendly",
    description: "Likely fine for most casual group watches.",
    tone: "moderate",
  };
};

export const pickSurpriseMovie = (movies: Movie[]): Movie | null => {
  if (!movies.length) return null;

  const pool = movies.filter((m) => m.poster_path && m.title);
  if (!pool.length) return null;

  const weighted = pool.map((movie) => {
    const ratingScore = Math.max(movie.vote_average, 0) * 2;
    const popularityScore = Math.min(movie.popularity / 50, 5);
    const weight = Math.max(1, ratingScore + popularityScore);
    return { movie, weight };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;
    if (random <= 0) return item.movie;
  }

  return weighted[weighted.length - 1].movie;
};

export const getMovieInsights = (
  movie: MovieInsightInput,
  certification?: string | null,
  keywords?: string[]
) => ({
  vibeTags: getVibeTags(movie, 3, keywords, certification),
  whyWatch: getWhyWatch(movie),
  skipIf: getSkipIf(movie, certification, keywords),
  awkwardMeter: getAwkwardMeter(movie, certification, keywords),
});
