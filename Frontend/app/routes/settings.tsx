import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import AuthForm from "~/components/AuthModal";
import { getJWTEmail, clearJWTToken } from "~/services/auth/api";
import {
  previewRestaurantFromUrl,
  addRestaurantManually,
  type RestaurantPreview,
} from "~/services/protected/restaurant";

// SettingsPage
// This component renders the settings page of the application. It includes a header with the title "Asetukset" and an AuthForm component for managing user authentication settings. 
// The page is styled to be responsive and centered, with padding and a maximum width to ensure a good user experience on different screen sizes.
export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const inputClass =
  "w-full border border-dark/15 rounded-xl px-4 py-2.5 text-sm text-dark bg-white outline-none focus:border-dark/40 transition";

type FormData = {
  name: string;
  address: string;
  lat: string;
  lon: string;
  category: string;
  description: string;
  priceLevel: string;
  phone: string;
  website: string;
  menuItems: string[];
};

const emptyForm: FormData = {
  name: "", address: "", lat: "", lon: "",
  category: "", description: "", priceLevel: "", phone: "", website: "",
  menuItems: [""],
};

function previewToForm(p: RestaurantPreview): FormData {
  return {
    name: p.name,
    address: p.address,
    lat: String(p.position[0]),
    lon: String(p.position[1]),
    category: p.category ?? "",
    description: p.description ?? "",
    priceLevel: p.priceLevel ?? "",
    phone: p.phone ?? "",
    website: p.website ?? "",
    menuItems: p.todayMenu?.filter(Boolean).length ? p.todayMenu : [""],
  };
}

function AddRestaurantSection() {
  const [tab, setTab] = useState<"url" | "manual">("url");
  const [url, setUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [formVisible, setFormVisible] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  function setField(field: keyof Omit<FormData, "menuItems">, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setMenuItem(index: number, value: string) {
    setForm((f) => {
      const items = [...f.menuItems];
      items[index] = value;
      return { ...f, menuItems: items };
    });
  }

  function addMenuItem() {
    setForm((f) => ({ ...f, menuItems: [...f.menuItems, ""] }));
  }

  function removeMenuItem(index: number) {
    setForm((f) => ({ ...f, menuItems: f.menuItems.filter((_, i) => i !== index) }));
  }

  async function handlePreview() {
    if (!url.trim()) return;
    setPreviewLoading(true);
    setPreviewError(null);
    setFormVisible(false);
    setSubmitSuccess(false);
    try {
      const data = await previewRestaurantFromUrl(url.trim());
      setForm(previewToForm(data));
      setFormVisible(true);
    } catch (err: any) {
      setPreviewError(err.message ?? "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }

  function switchTab(next: "url" | "manual") {
    setTab(next);
    setForm(emptyForm);
    setFormVisible(next === "manual");
    setPreviewError(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    setUrl("");
  }

  async function handleSubmit() {
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      const lat = parseFloat(form.lat);
      const lon = parseFloat(form.lon);
      if (!form.name.trim()) throw new Error("Name is required.");
      if (!form.address.trim()) throw new Error("Address is required.");
      if (isNaN(lat) || isNaN(lon)) throw new Error("Valid coordinates are required.");

      const payload: RestaurantPreview = {
        name: form.name.trim(),
        address: form.address.trim(),
        position: [lat, lon],
        category: form.category.trim() || undefined,
        description: form.description.trim() || undefined,
        priceLevel: form.priceLevel.trim() || undefined,
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        todayMenu: form.menuItems.map((m) => m.trim()).filter(Boolean),
      };
      await addRestaurantManually(payload);
      setSubmitSuccess(true);
      setForm(emptyForm);
      setFormVisible(tab === "manual");
      setUrl("");
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to add restaurant.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-dark">Lisää ravintola</h2>

      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-dark/10 w-fit">
        {(["url", "manual"] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`px-5 py-2 text-sm font-semibold transition-colors cursor-pointer ${
              tab === t
                ? "bg-primary text-white"
                : "bg-white text-dark/60 hover:text-dark"
            }`}
          >
            {t === "url" ? "URL:sta" : "Manuaalisesti"}
          </button>
        ))}
      </div>

      {/* URL input */}
      {tab === "url" && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://ravintola.fi/lounas"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePreview()}
            className={inputClass}
          />
          <button
            onClick={handlePreview}
            disabled={previewLoading || !url.trim()}
            className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:brightness-110 disabled:opacity-50 transition-all whitespace-nowrap cursor-pointer"
          >
            {previewLoading ? "Haetaan..." : "Esikatsele"}
          </button>
        </div>
      )}

      {previewError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
          {previewError}
        </p>
      )}

      {/* Restaurant form */}
      {formVisible && (
        <div className="flex flex-col gap-4 border border-dark/10 rounded-2xl p-5 bg-white">
          <p className="text-xs text-dark/50 font-medium uppercase tracking-wide">
            {tab === "url" ? "Tarkista ja muokkaa tiedot" : "Ravintolan tiedot"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-dark/50 mb-1">Nimi *</label>
              <input value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} placeholder="Ravintola Esimerkki" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-dark/50 mb-1">Osoite *</label>
              <input value={form.address} onChange={(e) => setField("address", e.target.value)} className={inputClass} placeholder="Esimerkkikatu 1, 53100 Lappeenranta" />
            </div>
            <div>
              <label className="block text-xs text-dark/50 mb-1">Leveysaste (lat) *</label>
              <input type="number" step="any" value={form.lat} onChange={(e) => setField("lat", e.target.value)} className={inputClass} placeholder="61.0569" />
            </div>
            <div>
              <label className="block text-xs text-dark/50 mb-1">Pituusaste (lon) *</label>
              <input type="number" step="any" value={form.lon} onChange={(e) => setField("lon", e.target.value)} className={inputClass} placeholder="28.1906" />
            </div>
            <div>
              <label className="block text-xs text-dark/50 mb-1">Kategoria</label>
              <input value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputClass} placeholder="Ravintola" />
            </div>
            <div>
              <label className="block text-xs text-dark/50 mb-1">Hinta</label>
              <input value={form.priceLevel} onChange={(e) => setField("priceLevel", e.target.value)} className={inputClass} placeholder="Lounas 12 EUR" />
            </div>
            <div>
              <label className="block text-xs text-dark/50 mb-1">Puhelin</label>
              <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputClass} placeholder="+358 40 123 4567" />
            </div>
            <div>
              <label className="block text-xs text-dark/50 mb-1">Verkkosivusto</label>
              <input value={form.website} onChange={(e) => setField("website", e.target.value)} className={inputClass} placeholder="https://ravintola.fi" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-dark/50 mb-1">Kuvaus</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Lyhyt kuvaus ravintolasta" />
            </div>
          </div>

          {/* Menu items */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-dark/50 font-medium">Päivän menu</label>
            {form.menuItems.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={item}
                  onChange={(e) => setMenuItem(i, e.target.value)}
                  className={inputClass}
                  placeholder={`Ruoka ${i + 1}`}
                />
                {form.menuItems.length > 1 && (
                  <button
                    onClick={() => removeMenuItem(i)}
                    className="px-3 text-dark/40 hover:text-red-500 transition-colors text-lg leading-none cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addMenuItem}
              className="self-start text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              + Lisää ruoka
            </button>
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-xl">
              Ravintola lisätty onnistuneesti!
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitLoading ? "Lisätään..." : "Lisää ravintola"}
          </button>
        </div>
      )}
    </section>
  );
}

function SettingsPage() {
  const [email, setEmail] = useState(() => getJWTEmail());

  function handleLoginSuccess() {
    setEmail(getJWTEmail());
  }

  function handleLogout() {
    clearJWTToken();
    setEmail(null);
  }

  return (
    <main className="flex flex-col flex-1 p-4 pb-28 gap-6 w-full max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-dark mt-4">Asetukset</h1>

      {email ? (
        <>
          {/* User info */}
          <section className="flex items-center justify-between bg-white border border-dark/10 rounded-2xl px-5 py-4">
            <div>
              <p className="text-xs text-dark/50 mb-0.5">Kirjautunut sisään</p>
              <p className="text-sm font-semibold text-dark">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-dark/60 border border-dark/15 rounded-xl hover:border-dark/30 hover:text-dark transition-all cursor-pointer"
            >
              Kirjaudu ulos
            </button>
          </section>

          <AddRestaurantSection />
        </>
      ) : (
        <AuthForm onSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}
