import LibraryApp from "../components/LibraryApp";
import { requirePageUser } from "../auth/guards";

export const metadata = { title: "Achievement Certificate" };

export default async function CertificatePage() {
  await requirePageUser("/certificate");
  return <LibraryApp view="certificate" />;
}
