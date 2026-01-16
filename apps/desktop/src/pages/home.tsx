import { PlusIcon } from "lucide-react";

import { Button } from "@/components/shadcn/ui/button";
import SuiteCard from "@/components/suites/suite-card";

export function Home() {
  return (
    <>
      <div className="flex flex-row justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">
          Suites Configuration Overview
        </h2>
        <Button>
          <PlusIcon /> New Suite
        </Button>
      </div>
      <section>
        <SuiteCard />
      </section>
    </>
  );
}
