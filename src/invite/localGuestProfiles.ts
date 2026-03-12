import type { UserProfile } from "./types";
import { formatGuestName, normalizeNameKey, sanitizeEntryId } from "./utils";

const localGuestProfiles: UserProfile[] = [
  { name: "Pahal", entryId: "060610", gender: "Female" },
  { name: "Aditi", entryId: "090726", gender: "Female" },
  { name: "Sarvagya", entryId: "220422", gender: "Male" },
  { name: "Anay", entryId: "111109", gender: "Male" },
  { name: "Shivasheesh", entryId: "300525", gender: "Male" },
  { name: "Simar", entryId: "2006", gender: "Male" },
  { name: "Vikram", entryId: "2016", gender: "Male" },
  { name: "Roshan Kumar", entryId: "2026", gender: "Male" },
  { name: "Ankita", entryId: "2036", gender: "Female" },
  { name: "Tanvi", entryId: "2046", gender: "Female" },
  { name: "Arya", entryId: "2056", gender: "Male" },
  { name: "Spandan", entryId: "2066", gender: "Male" },
  { name: "Deepanshi", entryId: "2076", gender: "Female" },
  { name: "Shlok Kumar", entryId: "2086", gender: "Male" },
  { name: "Arushi", entryId: "2096", gender: "Female" },
  { name: "Ishan", entryId: "2106", gender: "Male" },
  { name: "Huzaifa", entryId: "2116", gender: "Male" },
  { name: "Aryan Majumdar", entryId: "2126", gender: "Male" },
  { name: "Sarvesh", entryId: "2136", gender: "Male" },
  { name: "Ananya", entryId: "2146", gender: "Female" },
  { name: "Roshan", entryId: "2156", gender: "Male" },
  { name: "Sanjiban", entryId: "2166", gender: "Male" },
  { name: "Puja", entryId: "2176", gender: "Female" },
  { name: "Lodh", entryId: "2186", gender: "Male" },
  { name: "Hanshika", entryId: "2196", gender: "Female" },
  { name: "Yushi", entryId: "2206", gender: "Female" },
  { name: "Pari", entryId: "2216", gender: "Female" },
  { name: "Shray", entryId: "2226", gender: "Male" },
  { name: "Krisha", entryId: "2236", gender: "Female" },
  { name: "Anshika Suman", entryId: "2246", gender: "Female" },
  { name: "Vats", entryId: "2256", gender: "Male" },
  { name: "Navya", entryId: "2266", gender: "Female" },
  { name: "Ashika", entryId: "2276", gender: "Female" },
  { name: "Swarit", entryId: "2286", gender: "Male" },
  { name: "Hazique", entryId: "2296", gender: "Male" },
  { name: "Rishabh", entryId: "2306", gender: "Male" },
  { name: "Pratham", entryId: "2316", gender: "Male" },
  { name: "Prateek", entryId: "2326", gender: "Male" },
  { name: "Kamali", entryId: "2336", gender: "Female" },
  { name: "Asad", entryId: "2346", gender: "Male" },
  { name: "Raj Nandani", entryId: "2356", gender: "Female" },
  { name: "Rishik", entryId: "2366", gender: "Male" },
  { name: "Vishwaraj", entryId: "2376", gender: "Male" },
  { name: "Abhishek", entryId: "2386", gender: "Male" },
  { name: "Kawal", entryId: "2396", gender: "Male" },
  { name: "Atul", entryId: "2406", gender: "Male" },
  { name: "Ayansh", entryId: "2416", gender: "Male" },
  { name: "Shlok Mishra", entryId: "2426", gender: "Male" },
  { name: "Rohan", entryId: "2436", gender: "Male" },
  { name: "Anshuman", entryId: "2446", gender: "Male" },
  { name: "Darsh", entryId: "2456", gender: "Male" },
  { name: "Ayushman", entryId: "2466", gender: "Male" },
  { name: "Jasmine", entryId: "2476", gender: "Female" },
  { name: "Atul Agarwal", entryId: "2486", gender: "Male" },
  { name: "Ayushi Das", entryId: "2496", gender: "Female" },
  { name: "Anushka", entryId: "2506", gender: "Female" },
  { name: "Anusha", entryId: "2516", gender: "Female" },
  { name: "Alankrita", entryId: "2526", gender: "Female" },
];

const guestProfilesByEntryId = new Map(
  localGuestProfiles.map((profile) => [sanitizeEntryId(profile.entryId), profile])
);

const guestProfilesByName = new Map(
  localGuestProfiles.map((profile) => [
    normalizeNameKey(profile.name),
    profile,
  ])
);

export const getLocalGuestByEntryId = (rawEntryId: string) => {
  const entryId = sanitizeEntryId(rawEntryId);
  return entryId ? guestProfilesByEntryId.get(entryId) ?? null : null;
};

export const getLocalGuestByName = (rawName: string) => {
  const formattedName = formatGuestName(rawName);
  return formattedName
    ? guestProfilesByName.get(normalizeNameKey(formattedName)) ?? null
    : null;
};

export const listLocalGuests = () =>
  [...localGuestProfiles].sort((left, right) =>
    left.name.localeCompare(right.name, "en", { sensitivity: "base" })
  );
