import { PageContent } from "@/components/layout/PageContent";
import { PageHeader } from "@/components/layout/PageHeader";

export const ForecastPage = () => {
  return (
    <>
      <PageHeader title="AI-прогноз" />
      <PageContent>
        <section className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white p-8">
          <p className="text-sm font-medium text-slate-500">
            Здесь будет прогноз выпуска и простоев
          </p>
        </section>
      </PageContent>
    </>
  );
};
