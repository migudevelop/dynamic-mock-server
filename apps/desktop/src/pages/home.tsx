import { PlusIcon } from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import SuiteCard from "@/components/suites/suite-card";
import { PageHeader } from "@/components/ui/page-header/page-header";

export function Home() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Suites Configuration Overview"
        actions={
          <Button>
            <PlusIcon /> New Suite
          </Button>
        }
      />
      <section>
        <SuiteCard />
      </section>
    </div>
  );
}
