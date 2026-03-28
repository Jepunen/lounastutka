
import React from "react";
import Button from "../components/_components/Button";

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
    return (
        <main className="mx-auto min-h-screen max-w-5xl p-6 md:p-10">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Component Playground</h1>
                <p className="mt-2 text-gray-600">
                    Use this page to test simple frontend components and layouts.
                </p>
            </header>

            <div className="grid gap-5 md:grid-cols-2">
                <DemoCard title="Buttons">
                    <div className="flex flex-wrap gap-3">
                        <Button variant="primary">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                    </div >
                </DemoCard>

                <DemoCard title="Status Badges">
                    <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                            Open
                        </span>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                            In Progress
                        </span>
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">
                            Closed
                        </span>
                    </div>
                </DemoCard>

                <DemoCard title="Input Fields">
                    <form className="space-y-3">
                        <input
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                            placeholder="Component name"
                        />
                        <textarea
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
                            placeholder="Notes"
                            rows={3}
                        />
                    </form>
                </DemoCard>

                <DemoCard title="List Item">
                    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                        <li className="flex items-center justify-between px-3 py-2">
                            <span>Card component</span>
                            <span className="text-sm text-gray-500">Ready</span>
                        </li>
                        <li className="flex items-center justify-between px-3 py-2">
                            <span>Dropdown component</span>
                            <span className="text-sm text-gray-500">Draft</span>
                        </li>
                    </ul>
                </DemoCard>
            </div>
        </main>
    );
}
