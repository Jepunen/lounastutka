import { useState } from "react";
import { Outlet } from "react-router";
import BottomNav from "~/components/BottomNav";
import SearchBar from "~/components/SearchBar";

export default function Layout() {
	const [searchValue, setSearchValue] = useState("");
    return (
        <>
            <Outlet />
            <div className="fixed top-4 z-1000 inset-x-0 flex justify-center px-4">
                <SearchBar value={searchValue} onChange={setSearchValue} />
            </div>
            <div className="fixed bottom-4 z-1000 inset-x-0 flex justify-center px-4">
                <BottomNav />
            </div>
        </>
    );
}
