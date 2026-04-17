import { createFileRoute } from "@tanstack/react-router";
import AuthForm from "~/components/AuthModal";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <main className="flex flex-col flex-1 p-4 pb-28 gap-6 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-dark mt-4">Asetukset</h1>
      <AuthForm />
    </main>
  );
}
