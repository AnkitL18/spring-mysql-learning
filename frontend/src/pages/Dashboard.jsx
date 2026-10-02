import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Boxes,
    CircleDollarSign,
    ClipboardList,
    Package,
    Sparkles,
    TrendingUp,
    Users
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { get } from "../api/api";

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                setError("");

                const response = await get("/dashboard/summary");

                setData(response);
            } catch (err) {
                setError(
                    err?.message ||
                    "Unable to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, []);

    const totalSales = getFirstValue(
        data,
        [
            "totalSales",
            "totalRevenue",
            "sales",
            "revenue"
        ],
        "₹0"
    );

    const totalOrders = getFirstValue(
        data,
        [
            "totalOrders",
            "orderCount",
            "orders"
        ],
        0
    );

    const totalCustomers = getFirstValue(
        data,
        [
            "totalCustomers",
            "customerCount",
            "customers"
        ],
        0
    );

    const totalProducts = getFirstValue(
        data,
        [
            "totalProducts",
            "productCount",
            "products"
        ],
        0
    );

    const lowStockCount = getFirstValue(
        data,
        [
            "lowStockCount",
            "lowStockProducts",
            "lowStock"
        ],
        0
    );

    const pendingOrders = getFirstValue(
        data,
        [
            "pendingOrders",
            "pendingOrderCount"
        ],
        0
    );

    const deliveredOrders = getFirstValue(
        data,
        [
            "deliveredOrders",
            "deliveredOrderCount"
        ],
        0
    );

    const processingOrders = getFirstValue(
        data,
        [
            "processingOrders",
            "processingOrderCount"
        ],
        0
    );

    const recentOrders = useMemo(() => {
        return (
            data?.recentOrders ||
            data?.latestOrders ||
            data?.orders ||
            []
        );
    }, [data]);

    const salesTrend = useMemo(() => {
        return (
            data?.salesTrend ||
            data?.salesHistory ||
            data?.salesByDay ||
            data?.revenueTrend ||
            []
        );
    }, [data]);


    return (
        <div className="dashboard-page">

            {/* =====================================================
                PAGE HEADER
               ===================================================== */}

            <section className="dashboard-welcome">

                <div>

                    <span className="dashboard-kicker">
                        Business overview
                    </span>

                    <h1>
                        Good morning 👋
                    </h1>

                    <p>
                        Here's what's happening with your business today.
                    </p>

                </div>

                <div className="dashboard-header-actions">

                    <Link
                        to="/orders"
                        className="dashboard-secondary-button"
                    >
                        <ClipboardList size={17} />
                        View Orders
                    </Link>

                    <Link
                        to="/ai"
                        className="dashboard-primary-button"
                    >
                        <Sparkles size={17} />
                        Ask AI
                    </Link>

                </div>

            </section>


            {/* =====================================================
                ERROR
               ===================================================== */}

            {error && (
                <div className="error-message dashboard-error">
                    {error}
                </div>
            )}


            {/* =====================================================
                KPI CARDS
               ===================================================== */}

            <section className="dashboard-kpi-grid">

                <DashboardKpi
                    icon={<CircleDollarSign size={20} />}
                    label="Total Sales"
                    value={
                        loading
                            ? "..."
                            : formatValue(totalSales)
                    }
                    meta="Business revenue"
                    trend="+18%"
                    trendUp={true}
                    iconClass="sales"
                />

                <DashboardKpi
                    icon={<ClipboardList size={20} />}
                    label="Total Orders"
                    value={
                        loading
                            ? "..."
                            : formatNumber(totalOrders)
                    }
                    meta="All recorded orders"
                    trend="+12%"
                    trendUp={true}
                    iconClass="orders"
                />

                <DashboardKpi
                    icon={<Users size={20} />}
                    label="Customers"
                    value={
                        loading
                            ? "..."
                            : formatNumber(totalCustomers)
                    }
                    meta="Registered customers"
                    trend="+8%"
                    trendUp={true}
                    iconClass="customers"
                />

                <DashboardKpi
                    icon={<Package size={20} />}
                    label="Products"
                    value={
                        loading
                            ? "..."
                            : formatNumber(totalProducts)
                    }
                    meta="Products in catalog"
                    trend="+5%"
                    trendUp={true}
                    iconClass="products"
                />

            </section>


            {/* =====================================================
                MAIN ANALYTICS GRID
               ===================================================== */}

            <section className="dashboard-main-grid">

                {/* SALES OVERVIEW */}

                <div className="dashboard-card dashboard-sales-card">

                    <div className="dashboard-card-header">

                        <div>

                            <span className="dashboard-card-kicker">
                                PERFORMANCE
                            </span>

                            <h2>
                                Sales Overview
                            </h2>

                            <p>
                                Revenue activity across your business.
                            </p>

                        </div>

                        <div className="dashboard-card-icon">
                            <TrendingUp size={18} />
                        </div>

                    </div>


                    <div className="dashboard-sales-summary">

                        <strong>
                            {loading
                                ? "..."
                                : formatValue(totalSales)}
                        </strong>

                        <span className="dashboard-growth-positive">
                            <ArrowUpRight size={15} />
                            18%
                        </span>

                    </div>


                    <SalesChart
                        data={salesTrend}
                        loading={loading}
                    />

                </div>


                {/* ORDER ACTIVITY */}

                <div className="dashboard-card dashboard-orders-card">

                    <div className="dashboard-card-header">

                        <div>

                            <span className="dashboard-card-kicker">
                                OPERATIONS
                            </span>

                            <h2>
                                Order Activity
                            </h2>

                            <p>
                                Current order status overview.
                            </p>

                        </div>

                        <div className="dashboard-card-icon blue">
                            <BarChart3 size={18} />
                        </div>

                    </div>


                    <div className="dashboard-order-stats">

                        <DashboardOrderStat
                            label="Delivered"
                            value={deliveredOrders}
                            percent={
                                deliveredOrders > 0
                                    ? 82
                                    : 0
                            }
                            className="success"
                        />

                        <DashboardOrderStat
                            label="Processing"
                            value={processingOrders}
                            percent={
                                processingOrders > 0
                                    ? 48
                                    : 0
                            }
                            className="warning"
                        />

                        <DashboardOrderStat
                            label="Pending"
                            value={pendingOrders}
                            percent={
                                pendingOrders > 0
                                    ? 24
                                    : 0
                            }
                            className="pending"
                        />

                    </div>


                    <Link
                        to="/orders"
                        className="dashboard-card-link"
                    >
                        View all orders
                        <ArrowUpRight size={15} />
                    </Link>

                </div>

            </section>


            {/* =====================================================
                BOTTOM GRID
               ===================================================== */}

            <section className="dashboard-bottom-grid">

                {/* RECENT ORDERS */}

                <div className="dashboard-card dashboard-recent-card">

                    <div className="dashboard-card-header">

                        <div>

                            <span className="dashboard-card-kicker">
                                RECENT ACTIVITY
                            </span>

                            <h2>
                                Recent Orders
                            </h2>

                            <p>
                                Latest orders recorded in the system.
                            </p>

                        </div>

                        <Link
                            to="/orders"
                            className="dashboard-text-link"
                        >
                            View all
                        </Link>

                    </div>


                    {recentOrders.length > 0 ? (

                        <div className="dashboard-order-table">

                            <div className="dashboard-order-row dashboard-order-table-header">

                                <span>Order</span>
                                <span>Customer</span>
                                <span>Status</span>
                                <span>Total</span>

                            </div>

                            {recentOrders
                                .slice(0, 5)
                                .map((order, index) => (
                                    <RecentOrderRow
                                        key={
                                            order?.id ||
                                            order?.orderId ||
                                            index
                                        }
                                        order={order}
                                    />
                                ))}

                        </div>

                    ) : (

                        <div className="dashboard-empty-state">

                            <div className="dashboard-empty-icon">
                                <ClipboardList size={22} />
                            </div>

                            <strong>
                                No recent orders
                            </strong>

                            <span>
                                Recent order activity will appear here.
                            </span>

                        </div>

                    )}

                </div>


                {/* AI INSIGHT */}

                <div className="dashboard-ai-card">

                    <div className="dashboard-ai-glow" />

                    <div className="dashboard-ai-content">

                        <div className="dashboard-ai-icon">
                            <Sparkles size={21} />
                        </div>

                        <span className="dashboard-ai-label">
                            BUSINESSOPS AI
                        </span>

                        <h2>
                            Your business data,
                            <br />
                            turned into insight.
                        </h2>

                        <p>
                            Ask questions about orders,
                            inventory, customers and business
                            performance using natural language.
                        </p>


                        <div className="dashboard-ai-suggestions">

                            <span>
                                What's selling best?
                            </span>

                            <span>
                                Which products are low?
                            </span>

                            <span>
                                Show today's summary
                            </span>

                        </div>


                        <Link
                            to="/ai"
                            className="dashboard-ai-button"
                        >
                            Open AI Assistant
                            <ArrowUpRight size={16} />
                        </Link>

                    </div>

                </div>

            </section>


            {/* =====================================================
                QUICK BUSINESS HEALTH
               ===================================================== */}

            <section className="dashboard-health-grid">

                <HealthCard
                    icon={<Boxes size={19} />}
                    title="Inventory"
                    value={formatNumber(lowStockCount)}
                    label="Low-stock items"
                    className="orange"
                    to="/inventory"
                />

                <HealthCard
                    icon={<ClipboardList size={19} />}
                    title="Orders"
                    value={formatNumber(pendingOrders)}
                    label="Pending orders"
                    className="blue"
                    to="/orders"
                />

                <HealthCard
                    icon={<Users size={19} />}
                    title="Customers"
                    value={formatNumber(totalCustomers)}
                    label="Active customer base"
                    className="purple"
                    to="/customers"
                />

                <HealthCard
                    icon={<Package size={19} />}
                    title="Products"
                    value={formatNumber(totalProducts)}
                    label="Catalog size"
                    className="green"
                    to="/products"
                />

            </section>

        </div>
    );
}


/* =============================================================
   KPI COMPONENT
   ============================================================= */

function DashboardKpi({
                          icon,
                          label,
                          value,
                          meta,
                          trend,
                          trendUp,
                          iconClass
                      }) {
    return (
        <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

                <div className={`dashboard-kpi-icon ${iconClass}`}>
                    {icon}
                </div>

                <span
                    className={
                        trendUp
                            ? "dashboard-kpi-trend positive"
                            : "dashboard-kpi-trend negative"
                    }
                >
                    {trendUp
                        ? <ArrowUpRight size={14} />
                        : <ArrowDownRight size={14} />}

                    {trend}
                </span>

            </div>

            <span className="dashboard-kpi-label">
                {label}
            </span>

            <strong className="dashboard-kpi-value">
                {value}
            </strong>

            <span className="dashboard-kpi-meta">
                {meta}
            </span>

        </div>
    );
}


/* =============================================================
   ORDER STAT
   ============================================================= */

function DashboardOrderStat({
                                label,
                                value,
                                percent,
                                className
                            }) {
    return (
        <div className="dashboard-order-stat">

            <div className="dashboard-order-stat-header">

                <div>

                    <span
                        className={`dashboard-status-dot ${className}`}
                    />

                    <span>
                        {label}
                    </span>

                </div>

                <strong>
                    {formatNumber(value)}
                </strong>

            </div>

            <div className="dashboard-order-progress">

                <div
                    className={`dashboard-order-progress-fill ${className}`}
                    style={{
                        width: `${percent}%`
                    }}
                />

            </div>

        </div>
    );
}


/* =============================================================
   SALES CHART
   ============================================================= */

function SalesChart({ data, loading }) {

    if (loading) {
        return (
            <div className="dashboard-chart-loading">
                Loading sales activity...
            </div>
        );
    }

    const values = extractChartValues(data);

    if (values.length === 0) {

        return (
            <div className="dashboard-chart-placeholder">

                <div className="dashboard-chart-grid-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                <div className="dashboard-chart-placeholder-line">

                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />

                </div>

                <div className="dashboard-chart-empty-label">
                    Sales trend will appear as historical data grows.
                </div>

            </div>
        );
    }

    const maxValue = Math.max(...values, 1);

    return (
        <div className="dashboard-chart">

            <div className="dashboard-chart-grid-lines">
                <span />
                <span />
                <span />
                <span />
            </div>

            <div className="dashboard-chart-bars">

                {values.slice(0, 12).map((value, index) => {

                    const height =
                        Math.max(
                            8,
                            (Number(value) / maxValue) * 100
                        );

                    return (
                        <div
                            className="dashboard-chart-bar-wrapper"
                            key={index}
                        >
                            <div
                                className="dashboard-chart-bar"
                                style={{
                                    height: `${height}%`
                                }}
                            />
                        </div>
                    );
                })}

            </div>

        </div>
    );
}


/* =============================================================
   RECENT ORDER ROW
   ============================================================= */

function RecentOrderRow({ order }) {

    const orderId =
        order?.orderNumber ||
        order?.orderNo ||
        order?.id ||
        order?.orderId ||
        "—";

    const customer =
        order?.customerName ||
        order?.customer?.name ||
        order?.customer?.fullName ||
        "Customer";

    const status =
        order?.status ||
        "PENDING";

    const total =
        order?.totalAmount ??
        order?.total ??
        order?.grandTotal ??
        "—";

    return (
        <div className="dashboard-order-row">

            <span className="dashboard-order-number">
                #{orderId}
            </span>

            <span className="dashboard-order-customer">
                {customer}
            </span>

            <span>
                <StatusBadge status={status} />
            </span>

            <strong>
                {formatValue(total)}
            </strong>

        </div>
    );
}


/* =============================================================
   STATUS BADGE
   ============================================================= */

function StatusBadge({ status }) {

    const normalized =
        String(status)
            .toLowerCase();

    let className = "neutral";

    if (
        normalized === "delivered" ||
        normalized === "completed" ||
        normalized === "confirmed"
    ) {
        className = "success";
    }

    if (
        normalized === "processing" ||
        normalized === "shipped"
    ) {
        className = "warning";
    }

    if (
        normalized === "pending"
    ) {
        className = "pending";
    }

    if (
        normalized === "cancelled" ||
        normalized === "canceled"
    ) {
        className = "danger";
    }

    return (
        <span className={`dashboard-status-badge ${className}`}>
            {String(status)}
        </span>
    );
}


/* =============================================================
   HEALTH CARD
   ============================================================= */

function HealthCard({
                        icon,
                        title,
                        value,
                        label,
                        className,
                        to
                    }) {
    return (
        <Link
            to={to}
            className="dashboard-health-card"
        >

            <div className={`dashboard-health-icon ${className}`}>
                {icon}
            </div>

            <div className="dashboard-health-info">

                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>

                <small>
                    {label}
                </small>

            </div>

            <ArrowUpRight
                size={17}
                className="dashboard-health-arrow"
            />

        </Link>
    );
}


/* =============================================================
   HELPERS
   ============================================================= */

function getFirstValue(object, keys, fallback) {

    if (!object) {
        return fallback;
    }

    for (const key of keys) {

        const value = object[key];

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            return value;
        }
    }

    return fallback;
}


function formatNumber(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "0";
    }

    const numericValue =
        Number(value);

    if (
        !Number.isNaN(numericValue)
    ) {
        return numericValue.toLocaleString("en-IN");
    }

    return String(value);
}


function formatValue(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "₹0";
    }

    if (typeof value === "number") {
        return `₹${value.toLocaleString("en-IN")}`;
    }

    const stringValue =
        String(value);

    if (
        stringValue.includes("₹")
    ) {
        return stringValue;
    }

    const numericValue =
        Number(
            stringValue.replace(
                /[^0-9.-]+/g,
                ""
            )
        );

    if (!Number.isNaN(numericValue)) {
        return `₹${numericValue.toLocaleString("en-IN")}`;
    }

    return stringValue;
}


function extractChartValues(data) {

    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item) => {

            if (
                typeof item === "number"
            ) {
                return item;
            }

            if (
                typeof item === "string"
            ) {
                return Number(item);
            }

            return (
                item?.value ??
                item?.sales ??
                item?.revenue ??
                item?.amount ??
                0
            );
        })
        .map(Number)
        .filter(
            (value) =>
                !Number.isNaN(value)
        );
}


export default Dashboard;