import {
    BarChart3,
    Boxes,
    ClipboardList,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Sparkles,
    Truck,
    Users,
    X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { getUser } from "../utils/auth";

function Sidebar({ mobileOpen, onClose }) {
    const user = getUser();

    const navigation = [
        {
            label: "Overview",
            items: [
                {
                    name: "Dashboard",
                    path: "/dashboard",
                    icon: LayoutDashboard
                },
                {
                    name: "Reports",
                    path: "/reports",
                    icon: BarChart3
                }
            ]
        },
        {
            label: "Management",
            items: [
                {
                    name: "Customers",
                    path: "/customers",
                    icon: Users
                },
                {
                    name: "Products",
                    path: "/products",
                    icon: Package
                },
                {
                    name: "Categories",
                    path: "/categories",
                    icon: Boxes
                },
                {
                    name: "Suppliers",
                    path: "/suppliers",
                    icon: Truck
                }
            ]
        },
        {
            label: "Operations",
            items: [
                {
                    name: "Purchases",
                    path: "/purchases",
                    icon: ShoppingCart
                },
                {
                    name: "Inventory",
                    path: "/inventory",
                    icon: Boxes
                },
                {
                    name: "Orders",
                    path: "/orders",
                    icon: ClipboardList
                }
            ]
        }
    ];

    return (
        <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}>

            <div className="sidebar-header">

                <div className="sidebar-brand">

                    <div className="sidebar-logo">
                        <Boxes size={20} strokeWidth={2.2} />
                    </div>

                    <div className="sidebar-brand-text">
                        <strong>BusinessOps</strong>
                        <span>Smart Business Management</span>
                    </div>

                </div>

                <button
                    className="mobile-close-button"
                    onClick={onClose}
                    aria-label="Close navigation"
                >
                    <X size={19} />
                </button>

            </div>

            <nav className="sidebar-navigation">

                {navigation.map((section) => (
                    <div
                        className="sidebar-section"
                        key={section.label}
                    >

                        <span className="sidebar-section-title">
                            {section.label}
                        </span>

                        {section.items.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    <span className="sidebar-link-icon">
                                        <Icon size={18} strokeWidth={2} />
                                    </span>

                                    <span className="sidebar-link-text">
                                        {item.name}
                                    </span>
                                </NavLink>
                            );
                        })}

                    </div>
                ))}

                <div className="sidebar-section sidebar-ai-section">

                    <span className="sidebar-section-title">
                        Intelligence
                    </span>

                    <NavLink
                        to="/ai"
                        onClick={onClose}
                        className={({ isActive }) =>
                            `sidebar-link ai-link ${isActive ? "active" : ""}`
                        }
                    >
                        <span className="sidebar-link-icon">
                            <Sparkles size={18} strokeWidth={2} />
                        </span>

                        <span className="sidebar-link-text">
                            AI Assistant
                        </span>

                        <span className="ai-badge">
                            AI
                        </span>
                    </NavLink>

                </div>

            </nav>

            <div className="sidebar-bottom">

                <div className="sidebar-user">

                    <div className="sidebar-avatar">
                        {user?.email
                            ? user.email.charAt(0).toUpperCase()
                            : "U"}
                    </div>

                    <div className="sidebar-user-info">

                        <strong>
                            {user?.name || user?.email || "User"}
                        </strong>

                        <span>
                            {user?.role || "USER"}
                        </span>

                    </div>

                </div>

            </div>

        </aside>
    );
}

export default Sidebar;