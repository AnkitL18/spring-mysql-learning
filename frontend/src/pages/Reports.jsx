import {
    ArrowUpRight,
    BarChart3,
    CircleDollarSign,
    Package,
    ShoppingBag,
    TriangleAlert,
    Users
} from "lucide-react";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import { get } from "../api/api";


function Reports() {

    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [orderStatuses, setOrderStatuses] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);


    /* =========================================================
       LOAD REPORT DATA
       ========================================================= */

    useEffect(() => {

        async function loadReports() {

            try {

                setLoading(true);
                setError("");

                const [
                    summaryResponse,
                    topProductsResponse,
                    topCustomersResponse,
                    orderStatusResponse,
                    lowStockResponse
                ] = await Promise.all([

                    get("/reports/summary"),

                    get(
                        "/reports/top-products?page=0&size=5"
                    ),

                    get(
                        "/reports/top-customers?page=0&size=5"
                    ),

                    get("/reports/order-status"),

                    get(
                        "/reports/low-stock?page=0&size=5"
                    )

                ]);


                setSummary(summaryResponse);


                setTopProducts(
                    Array.isArray(topProductsResponse)
                        ? topProductsResponse
                        : topProductsResponse?.content || []
                );


                setTopCustomers(
                    Array.isArray(topCustomersResponse)
                        ? topCustomersResponse
                        : topCustomersResponse?.content || []
                );


                setOrderStatuses(
                    Array.isArray(orderStatusResponse)
                        ? orderStatusResponse
                        : []
                );


                setLowStockProducts(
                    Array.isArray(lowStockResponse)
                        ? lowStockResponse
                        : lowStockResponse?.content || []
                );


            } catch (err) {

                setError(
                    err?.message ||
                    "Unable to load reports."
                );

            } finally {

                setLoading(false);

            }

        }

        loadReports();

    }, []);


    /* =========================================================
       SUMMARY VALUES
       ========================================================= */

    const totalSales =
        summary?.totalSales ??
        summary?.totalRevenue ??
        0;


    const totalOrders =
        summary?.totalOrders ??
        summary?.orderCount ??
        0;


    const totalCustomers =
        summary?.totalCustomers ??
        summary?.customerCount ??
        0;


    const totalProducts =
        summary?.totalProducts ??
        summary?.productCount ??
        0;


    /* =========================================================
       ORDER STATUS DATA
       ========================================================= */

    const orderStatusData = useMemo(() => {

        return orderStatuses.map((item) => {

            const status =
                item.status ||
                item.orderStatus ||
                item.name ||
                "UNKNOWN";

            const count = Number(
                item.count ??
                item.total ??
                item.value ??
                0
            );

            return {
                status,
                count
            };

        });

    }, [orderStatuses]);


    const totalStatusOrders = useMemo(() => {

        return orderStatusData.reduce(
            (total, item) =>
                total + item.count,
            0
        );

    }, [orderStatusData]);


    /* =========================================================
       FORMAT CURRENCY
       ========================================================= */

    function formatCurrency(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "₹0";
        }

        const numeric =
            Number(value);

        if (Number.isNaN(numeric)) {
            return String(value);
        }

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(numeric);

    }


    /* =========================================================
       STATUS LABEL
       ========================================================= */

    function formatStatus(status) {

        return String(status)
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );

    }


    /* =========================================================
       STATUS CLASS
       ========================================================= */

    function statusClass(status) {

        switch (
            String(status).toUpperCase()
            ) {

            case "DELIVERED":
                return "report-status-success";

            case "SHIPPED":
                return "report-status-primary";

            case "PROCESSING":
                return "report-status-purple";

            case "CONFIRMED":
                return "report-status-blue";

            case "PENDING":
                return "report-status-warning";

            case "CANCELLED":
                return "report-status-danger";

            default:
                return "report-status-primary";

        }

    }


    /* =========================================================
       STATUS PERCENTAGE
       ========================================================= */

    function statusPercentage(count) {

        if (
            totalStatusOrders === 0
        ) {
            return 0;
        }

        return Math.round(
            (count / totalStatusOrders) * 100
        );

    }


    /* =========================================================
       TOP PRODUCT VALUES
       ========================================================= */

    function productName(product) {

        return (
            product.productName ||
            product.name ||
            "Product"
        );

    }


    function productRevenue(product) {

        return (
            product.totalRevenue ??
            product.revenue ??
            product.totalSales ??
            0
        );

    }


    /* =========================================================
       TOP CUSTOMER VALUES
       ========================================================= */

    function customerName(customer) {

        return (
            customer.customerName ||
            customer.name ||
            "Customer"
        );

    }


    function customerSpent(customer) {

        return (
            customer.totalSpent ??
            customer.totalAmount ??
            customer.spent ??
            0
        );

    }


    /* =========================================================
       LOW STOCK VALUES
       ========================================================= */

    function lowStockName(item) {

        return (
            item.productName ||
            item.product?.name ||
            "Product"
        );

    }


    function lowStockQuantity(item) {

        return Number(
            item.currentStock ??
            item.stock ??
            item.quantity ??
            0
        );

    }


    return (

        <div className="management-page reports-page">


            {/* =====================================================
                PAGE HEADER
               ===================================================== */}

            <div className="management-header">

                <div className="management-header-content">

                    <span className="management-kicker">
                        Business intelligence
                    </span>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Understand sales, orders and customer performance.
                    </p>

                </div>


                <div className="report-period-button">
                    Last 30 days
                </div>

            </div>


            {/* =====================================================
                ERROR
               ===================================================== */}

            {error && (

                <div className="error-message management-page-error">
                    {error}
                </div>

            )}


            {/* =====================================================
                KPI CARDS
               ===================================================== */}

            <div className="report-kpi-grid">


                <ReportKpi
                    icon={
                        <CircleDollarSign
                            size={19}
                        />
                    }
                    label="Total Sales"
                    value={
                        loading
                            ? "—"
                            : formatCurrency(totalSales)
                    }
                    description="Recorded business sales"
                    className="green"
                />


                <ReportKpi
                    icon={
                        <ShoppingBag
                            size={19}
                        />
                    }
                    label="Total Orders"
                    value={
                        loading
                            ? "—"
                            : totalOrders
                    }
                    description="Orders in the system"
                    className="blue"
                />


                <ReportKpi
                    icon={
                        <Users
                            size={19}
                        />
                    }
                    label="Customers"
                    value={
                        loading
                            ? "—"
                            : totalCustomers
                    }
                    description="Registered customers"
                    className="purple"
                />


                <ReportKpi
                    icon={
                        <Package
                            size={19}
                        />
                    }
                    label="Products"
                    value={
                        loading
                            ? "—"
                            : totalProducts
                    }
                    description="Products in catalog"
                    className="orange"
                />


            </div>


            {/* =====================================================
                MAIN REPORT GRID
               ===================================================== */}

            <div className="reports-grid">


                {/* =================================================
                    SALES SUMMARY
                   ================================================= */}

                <section className="report-card report-large">

                    <div className="report-card-header">

                        <div>

                            <span className="report-card-kicker">
                                SALES OVERVIEW
                            </span>

                            <h2>
                                Sales Performance
                            </h2>

                            <span>
                                Current recorded sales performance
                            </span>

                        </div>

                        <div className="report-card-header-icon green">
                            <CircleDollarSign size={18} />
                        </div>

                    </div>


                    <div className="report-sales-highlight">

                        <span>
                            Total recorded sales
                        </span>

                        <strong>
                            {loading
                                ? "—"
                                : formatCurrency(totalSales)
                            }
                        </strong>

                    </div>


                    <div className="report-sales-breakdown">

                        <div className="report-sales-item">

                            <span>
                                Orders
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalOrders
                                }
                            </strong>

                        </div>


                        <div className="report-sales-item">

                            <span>
                                Customers
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalCustomers
                                }
                            </strong>

                        </div>


                        <div className="report-sales-item">

                            <span>
                                Products
                            </span>

                            <strong>
                                {loading
                                    ? "—"
                                    : totalProducts
                                }
                            </strong>

                        </div>

                    </div>


                    <div className="report-info-panel">

                        <BarChart3 size={18} />

                        <div>

                            <strong>
                                Sales data is calculated by the backend.
                            </strong>

                            <span>
                                This report uses recorded order totals rather than fabricated chart values.
                            </span>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ORDER PERFORMANCE
                   ================================================= */}

                <section className="report-card">

                    <div className="report-card-header">

                        <div>

                            <span className="report-card-kicker">
                                ORDER ACTIVITY
                            </span>

                            <h2>
                                Order Performance
                            </h2>

                            <span>
                                Current status distribution
                            </span>

                        </div>

                    </div>


                    {loading ? (

                        <div className="report-inline-loading">
                            Loading order status...
                        </div>

                    ) : orderStatusData.length === 0 ? (

                        <div className="report-inline-empty">

                            <ShoppingBag size={20} />

                            <span>
                                No order status data available.
                            </span>

                        </div>

                    ) : (

                        <div className="report-bars">

                            {orderStatusData.map(
                                (item) => {

                                    const percentage =
                                        statusPercentage(
                                            item.count
                                        );

                                    return (

                                        <div
                                            className="report-bar-row"
                                            key={item.status}
                                        >

                                            <div>

                                                <span>
                                                    {formatStatus(
                                                        item.status
                                                    )}
                                                </span>

                                                <strong>
                                                    {item.count}
                                                </strong>

                                            </div>


                                            <div className="report-bar-track">

                                                <div
                                                    className={`report-bar-fill ${statusClass(
                                                        item.status
                                                    )}`}
                                                    style={{
                                                        width: `${percentage}%`
                                                    }}
                                                />

                                            </div>


                                            <small>
                                                {percentage}%
                                            </small>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    TOP PRODUCTS
                   ================================================= */}

                <section className="report-card report-large">

                    <div className="report-card-header">

                        <div>

                            <span className="report-card-kicker">
                                PRODUCT PERFORMANCE
                            </span>

                            <h2>
                                Top Products
                            </h2>

                            <span>
                                Products generating the most revenue
                            </span>

                        </div>

                        <ArrowUpRight size={18} />

                    </div>


                    {loading ? (

                        <div className="report-inline-loading">
                            Loading top products...
                        </div>

                    ) : topProducts.length === 0 ? (

                        <div className="report-inline-empty">

                            <Package size={20} />

                            <span>
                                No product report data available.
                            </span>

                        </div>

                    ) : (

                        <div className="report-list">

                            {topProducts.map(
                                (product, index) => (

                                    <ReportListItem
                                        key={
                                            product.productId ||
                                            product.id ||
                                            index
                                        }
                                        rank={
                                            String(
                                                index + 1
                                            ).padStart(2, "0")
                                        }
                                        name={
                                            productName(
                                                product
                                            )
                                        }
                                        value={
                                            formatCurrency(
                                                productRevenue(
                                                    product
                                                )
                                            )
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    TOP CUSTOMERS
                   ================================================= */}

                <section className="report-card">

                    <div className="report-card-header">

                        <div>

                            <span className="report-card-kicker">
                                CUSTOMER PERFORMANCE
                            </span>

                            <h2>
                                Top Customers
                            </h2>

                            <span>
                                Customers with the highest recorded spend
                            </span>

                        </div>

                    </div>


                    {loading ? (

                        <div className="report-inline-loading">
                            Loading top customers...
                        </div>

                    ) : topCustomers.length === 0 ? (

                        <div className="report-inline-empty">

                            <Users size={20} />

                            <span>
                                No customer report data available.
                            </span>

                        </div>

                    ) : (

                        <div className="report-list">

                            {topCustomers.map(
                                (customer, index) => (

                                    <ReportListItem
                                        key={
                                            customer.customerId ||
                                            customer.id ||
                                            index
                                        }
                                        rank={
                                            String(
                                                index + 1
                                            ).padStart(2, "0")
                                        }
                                        name={
                                            customerName(
                                                customer
                                            )
                                        }
                                        value={
                                            formatCurrency(
                                                customerSpent(
                                                    customer
                                                )
                                            )
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================================
                    LOW STOCK
                   ================================================= */}

                <section className="report-card report-large">

                    <div className="report-card-header">

                        <div>

                            <span className="report-card-kicker">
                                INVENTORY ATTENTION
                            </span>

                            <h2>
                                Low Stock Products
                            </h2>

                            <span>
                                Products currently below their reorder level
                            </span>

                        </div>

                        <div className="report-card-header-icon orange">
                            <TriangleAlert size={18} />
                        </div>

                    </div>


                    {loading ? (

                        <div className="report-inline-loading">
                            Loading inventory report...
                        </div>

                    ) : lowStockProducts.length === 0 ? (

                        <div className="report-inline-empty">

                            <Package size={20} />

                            <span>
                                No low-stock products reported.
                            </span>

                        </div>

                    ) : (

                        <div className="report-list">

                            {lowStockProducts.map(
                                (item, index) => (

                                    <div
                                        className="report-list-item report-low-stock-item"
                                        key={
                                            item.id ||
                                            item.productId ||
                                            index
                                        }
                                    >

                                        <span className="report-rank">
                                            {String(
                                                index + 1
                                            ).padStart(2, "0")}
                                        </span>

                                        <div className="report-list-name-group">

                                            <span className="report-list-name">
                                                {lowStockName(
                                                    item
                                                )}
                                            </span>

                                            <small>
                                                Inventory item
                                            </small>

                                        </div>

                                        <strong className="report-low-stock-value">

                                            {lowStockQuantity(
                                                item
                                            )}

                                            <span>
                                                units
                                            </span>

                                        </strong>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                </section>


            </div>

        </div>
    );
}


/* =============================================================
   KPI COMPONENT
   ============================================================= */

function ReportKpi({
                       icon,
                       label,
                       value,
                       description,
                       className
                   }) {

    return (

        <div className="report-kpi-card">

            <div
                className={`report-kpi-icon ${className}`}
            >
                {icon}
            </div>

            <div className="report-kpi-content">

                <span>
                    {label}
                </span>

                <strong>
                    {value}
                </strong>

                <small>
                    {description}
                </small>

            </div>

        </div>

    );
}


/* =============================================================
   LIST COMPONENT
   ============================================================= */

function ReportListItem({
                            rank,
                            name,
                            value
                        }) {

    return (

        <div className="report-list-item">

            <span className="report-rank">
                {rank}
            </span>

            <span className="report-list-name">
                {name}
            </span>

            <strong>
                {value}
            </strong>

        </div>

    );

}


export default Reports;