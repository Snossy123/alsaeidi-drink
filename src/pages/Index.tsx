import { SidebarProvider } from "@/components/ui/sidebar";
import { IndexLayout } from "./IndexLayout";

const isWideScreen = () =>
  typeof window !== "undefined" && window.innerWidth >= 1600;

export default function Index() {
  return (
    <SidebarProvider defaultOpen={isWideScreen()}>
      <IndexLayout />
    </SidebarProvider>
  );
}
