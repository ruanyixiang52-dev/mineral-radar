import { allSpecies } from "@/lib/dataset";
import SpeciesClient from "./SpeciesClient";

export function generateStaticParams() {
  return allSpecies.map((s) => ({ slug: encodeURIComponent(s.slug) }));
}

export default async function SpeciesPage({ params }: { params: { slug: string } }) {
  return <SpeciesClient slug={params.slug} />;
}
