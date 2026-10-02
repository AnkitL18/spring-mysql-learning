import { Link, useNavigate } from "react-router-dom";
import { getUser, logout } from "../utils/auth";

function Navbar() {
    const navigate = useNavigate();
    const user = getUser();

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                Business Operations
            </div>

            <div className="navbar-links">
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/customers">Customers</Link>
                <Link to="/products">Products</Link>
                <Link to="/orders">Orders</Link>
                <Link to="/inventory">Inventory</Link>
                <Link to="/ai">AI Assistant</Link>
            </div>

            <div className="navbar-user">
                {user?.email && (
                    <span>{user.email}</span>
                )}

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;