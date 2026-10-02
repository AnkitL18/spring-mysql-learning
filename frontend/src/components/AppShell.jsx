import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShell() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function openSidebar() {
        setSidebarOpen(true);
    }

    function closeSidebar() {
        setSidebarOpen(false);
    }

    return (
        <div className="app-shell">

            <Sidebar
                mobileOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                />
            )}

            <div className="app-main">

                <Topbar
                    onMenuClick={openSidebar}
                />

                <main className="app-content">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}

export default AppShell;