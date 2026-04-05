
import React from "react";
import { useState } from "react";
import Button from "../components/Button";
import { MapPinVisual } from "../components/MapPin";
import FavouriteButton from "~/components/FavouriteButton";
import Rating from "~/components/Rating";
import SearchBar from "~/components/SearchBar";

import { useNavigate } from "react-router";
import BottomNav from "~/components/BottomNav";

function DemoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

export function meta() {
    return [
        { title: "Component Playground" },
        { name: "description", content: "UI component test page" },
    ];
}

export default function ComponentsPage() {
    const navigate = useNavigate();

	const [searchValue, setSearchValue] = useState("");
    return (
        <main className="mx-auto min-h-screen max-w-5xl p-6 md:p-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Component Playground</h1>
                <p className="mt-2 text-gray-600">
                    Use this page to test simple frontend components and layouts.
                </p>
                <Button className="mt-2" variant="outline" onClick={() => navigate("/")}>Back to Map</Button>
            </header>

            <div className="grid gap-5 md:grid-cols-2">
                <DemoCard title="Buttons">
                    <div className="flex flex-wrap gap-3">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                    </div >
                </DemoCard>
                <DemoCard title="Map Pins">
                    <div className="flex items-center justify-center gap-3">
                        <MapPinVisual type="restaurant" size={100} />
                        <MapPinVisual type="pizza" size={75} />
                        <MapPinVisual type="vegan" />
                    </div>
                </DemoCard>
                <DemoCard title="Favourite Button">
                    <div className="flex items-center justify-center gap-3">
                        <FavouriteButton />
                    </div >
                </DemoCard>
                <DemoCard title="Rating Text">
                    <div className="flex items-center justify-center gap-3">
                        <Rating stars={4.9} reviews={120} />
                    </div >
                </DemoCard>
                <DemoCard title="Searchbar">
                    <div className="flex items-center justify-center gap-3">
                        <SearchBar value={searchValue} onChange={setSearchValue} />
                    </div >
                </DemoCard>
                <DemoCard title="Bottom Navigation">
                    <div className="flex items-center justify-center gap-3">
                        <BottomNav />
                    </div >
                </DemoCard>
            </div>
        </main >
    );
}
