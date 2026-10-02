import { useEffect, useRef, useState } from "react";
import {
    Bell,
    ChevronDown,
    LogOut,
    Menu,
    Search,
    User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

function Topbar({ onMenuClick }) {
    const user = getUser();

    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);

    const profileRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    return (
        <header className="app-topbar">

            <button
                className="mobile-menu-button"
                onClick={onMenuClick}
                aria-label="Open navigation"
            >
                <Menu size={21} />
            </button>


            {/* SEARCH */}

            <div className="topbar-search">

                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search anything..."
                    aria-label="Search"
                />

                <span className="search-shortcut">
                    /
                </span>

            </div>


            {/* ACTIONS */}

            <div className="topbar-actions">

                <button
                    className="topbar-icon-button"
                    aria-label="Notifications"
                    type="button"
                >
                    <Bell size={19} />

                    <span className="notification-dot" />
                </button>


                <div className="topbar-divider" />


                {/* PROFILE */}

                <div
                    className="topbar-user-wrapper"
                    ref={profileRef}
                >

                    <button
                        className="topbar-user"
                        onClick={() =>
                            setProfileOpen((current) => !current)
                        }
                        type="button"
                        aria-expanded={profileOpen}
                        aria-label="Open profile menu"
                    >

                        <div className="topbar-avatar">
                            {user?.email
                                ? user.email
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}
                        </div>

                        <div className="topbar-user-text">

                            <strong>
                                {user?.email || "User"}
                            </strong>

                            <span>
                                {user?.role || "USER"}
                            </span>

                        </div>

                        <ChevronDown
                            className="profile-chevron"
                            size={15}
                        />

                    </button>


                    {profileOpen && (
                        <div className="profile-dropdown">

                            <div className="profile-dropdown-header">

                                <strong>
                                    {user?.name ||
                                        user?.email ||
                                        "User"}
                                </strong>

                                <span>
                                    {user?.role || "USER"}
                                </span>

                            </div>


                            <button
                                className="profile-menu-button"
                                type="button"
                                onClick={() =>
                                    setProfileOpen(false)
                                }
                            >
                                <User size={16} />

                                <span>
                                    Profile
                                </span>
                            </button>


                            <button
                                className="profile-menu-button logout-button"
                                type="button"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} />

                                <span>
                                    Logout
                                </span>
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
}

export default Topbar;