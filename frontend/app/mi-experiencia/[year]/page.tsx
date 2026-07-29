import MiExperienciaPage from "@/components/mi-experiencia/MiExperienciaPage";

export default async function Page({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  return <MiExperienciaPage year={isNaN(yearNum) ? 2026 : yearNum} />;
}
