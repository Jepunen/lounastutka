import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import AuthModal from "~/components/AuthModal";
import BottomNav from "~/components/BottomNav";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <Outlet />

      {/* Sign In button — top right */}
      <div className="fixed top-4 right-4 z-[1000]">
        <button
          onClick={() => setAuthOpen(true)}
          className="bg-primary text-white font-bold text-sm px-5 py-2.5 rounded-4xl shadow-lg hover:brightness-110 active:scale-95 transition-all"
        >
          Sign In
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-4 z-[1000] inset-x-0 flex justify-center px-4">
        <BottomNav />
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
