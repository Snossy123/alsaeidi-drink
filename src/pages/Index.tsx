import { SidebarProvider } from "@/components/ui/sidebar";
import { IndexLayout } from "./IndexLayout";

export default function Index() {
  return (
    <SidebarProvider defaultOpen>
      <IndexLayout />
    </SidebarProvider>
  );
}
