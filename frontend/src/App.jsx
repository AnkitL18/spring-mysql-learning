import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import AiAssistant from "./pages/AiAssistant";

import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* =========================
                    PUBLIC
                   ========================= */}

                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =========================
                    PROTECTED APPLICATION
                   ========================= */}

                <Route
                    element={
                        <ProtectedRoute>
                            <AppShell />
                        </ProtectedRoute>
                    }
                >

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/customers"
                        element={<Customers />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/categories"
                        element={<Categories />}
                    />

                    <Route
                        path="/suppliers"
                        element={<Suppliers />}
                    />

                    <Route
                        path="/purchases"
                        element={<Purchases />}
                    />

                    <Route
                        path="/inventory"
                        element={<Inventory />}
                    />

                    <Route
                        path="/orders"
                        element={<Orders />}
                    />

                    <Route
                        path="/reports"
                        element={<Reports />}
                    />

                    <Route
                        path="/ai"
                        element={<AiAssistant />}
                    />

                </Route>


                {/* =========================
                    FALLBACK
                   ========================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;