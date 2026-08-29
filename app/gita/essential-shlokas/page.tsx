import type { Metadata } from "next";
import EssentialShlokasExperience from "./EssentialShlokasExperience";

export const metadata: Metadata = {
  title: "10 Essential Shlokas of the Bhagavad Gita",
  description: "Read ten essential Bhagavad Gita shlokas, take a free assessment and receive a guest completion certificate—no login required.",
};

export default function EssentialShlokasPage() {
  return <EssentialShlokasExperience />;
}
