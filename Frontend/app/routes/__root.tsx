import { createRootRoute, Outlet } from "@tanstack/react-router";
import BottomNav from "~/components/BottomNav";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />

      {/* Bottom navigation */}
      <div className="fixed bottom-4 z-1000 inset-x-0 flex justify-center px-4">
        <BottomNav />
      </div>
    </>
  );
}
