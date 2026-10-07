import { PageContent } from "@/components/layout/PageContent";
import { PageHeader } from "@/components/layout/PageHeader";

export const SchemaPage = () => {
  return (
    <>
      <PageHeader title="Схема производства" />
      <PageContent>
        <section className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white p-8">
          <p className="text-sm font-medium text-slate-500">
            Здесь будет схема участков и оборудования
          </p>
        </section>
      </PageContent>
    </>
  );
};
