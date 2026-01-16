import { EditIcon } from "lucide-react";

import { SuiteCardExtendsSection } from "./suite-card-extends-section";
import { SuiteCardRoutesList } from "./suite-card-routes-list";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Switch } from "@/components/shadcn/ui/switch";

export function SuiteCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>base</CardTitle>
        <CardDescription>Global default configuration</CardDescription>
        <CardAction>
          <Switch />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <SuiteCardExtendsSection />
        <SuiteCardRoutesList
          routes={[
            "auth:success",
            "users-get:list",
            "payments:idle",
            "config:v1",
          ]}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <EditIcon />
      </CardFooter>
    </Card>
  );
}
