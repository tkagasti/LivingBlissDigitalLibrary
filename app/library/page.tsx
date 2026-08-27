import LibraryApp from "../components/LibraryApp";

export const metadata = { title: "Explore the Library" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = "" } = await searchParams;
  return <LibraryApp view="library" initialSearch={search} />;
}
