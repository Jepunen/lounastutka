import { createRootRoute, Outlet } from "@tanstack/react-router";
import BottomNav from "~/components/BottomNav";
import { UserLocationProvider } from "~/components/UserLocationProvider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <UserLocationProvider>
      <>
        <Outlet />

        {/* Bottom navigation */}
        <div data-bottom-nav className="fixed bottom-4 z-1000 inset-x-0 flex justify-center px-4">
          <BottomNav />
        </div>
      </>
    </UserLocationProvider>
  );
}
