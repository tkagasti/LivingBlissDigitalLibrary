import LibraryApp from "./components/LibraryApp";

// Hostinger can retain prerendered HTML across deployments after its hashed
// Next.js assets have been replaced. Render the entry page per request so it
// always points at the assets from the active release.
export const dynamic = "force-dynamic";

export default function Home() {
  return <LibraryApp view="home" />;
}
