export function meta() {
  return [
    { title: "Asetukset" },
    { name: "description", content: "Sovelluksen asetukset" },
  ];
}

export default function SettingsPage() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 p-6">
      <h1 className="text-2xl font-bold text-dark">Asetukset</h1>
      <p className="mt-2 text-dark/60">Ei asetuksia vielä.</p>
    </main>
  );
}
