import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <div className="mx-auto mt-6 w-fit rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
        <Link to="/components" className="font-medium text-blue-700 hover:underline">
          Open component playground
        </Link>
      </div>
      <Welcome />
    </>
  );
}
