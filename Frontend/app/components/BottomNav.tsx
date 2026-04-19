import { useNavigate, useLocation } from "@tanstack/react-router";
import { IoLocationSharp, IoListSharp, IoSettingsOutline } from "react-icons/io5";

const tabs = [
  { label: "Kartta", icon: IoLocationSharp, path: "/" },
  { label: "Lista", icon: IoListSharp, path: "/list" },
  { label: "Asetukset", icon: IoSettingsOutline, path: "/settings" },
] as const;

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="flex items-center justify-around bg-neutral rounded-4xl px-4 py-3 shadow-lg max-w-sm w-full">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate({ to: path })}
            className="flex flex-col items-center gap-1 flex-1 cursor-pointer"
          >
            <span
              className={`text-2xl p-3 rounded-3xl transition-colors duration-200 ${
                active ? "bg-primary text-neutral" : "text-dark/60"
              }`}
            >
              <Icon />
            </span>
            <span className={`text-sm font-bold transition-colors duration-200 ${active ? "text-dark" : "text-dark/60"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;
