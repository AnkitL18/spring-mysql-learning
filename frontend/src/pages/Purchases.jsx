import {
    ArrowDownToLine,
    Ban,
    CalendarDays,
    ChevronRight,
    CircleDollarSign,
    Eye,
    Package,
    Plus,
    Search,
    ShoppingCart,
    Truck,
    UserRound,
    X
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { apiRequest, get, post } from "../api/api";
import { getUser } from "../utils/auth";

function Purchases() {
    const currentUser = getUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const [purchases, setPurchases] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);

    const [selectedPurchase, setSelectedPurchase] = useState(null);

    const [form, setForm] = useState({
        supplierId: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        items: [
            {
                productId: "",
                quantity: "1",
                unitPrice: ""
            }
        ]
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadPurchases();
        loadSuppliers();
        loadProducts();
    }, []);

    // =========================================================
    // LOAD PURCHASES
    // =========================================================

    async function loadPurchases() {
        try {
            setLoading(true);
            setError("");

            const response =
                await get("/purchases?page=0&size=100");

            const items =
                Array.isArray(response)
                    ? response
                    : response?.content || [];

            setPurchases(items);
        } catch (err) {
            setError(
                err?.message || "Unable to load purchases."
            );
        } finally {
            setLoading(false);
        }
    }

    // =========================================================
    // LOAD SUPPLIERS
    // =========================================================

    async function loadSuppliers() {
        try {
            const response =
                await get("/suppliers?page=0&size=100");

            const items =
                Array.isArray(response)
                    ? response
                    : response?.content || [];

            setSuppliers(items);
        } catch (err) {
            setError(
                err?.message || "Unable to load suppliers."
            );
        }
    }

    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    async function loadProducts() {
        try {
            const response =
                await get("/products?page=0&size=100");

            const items =
                Array.isArray(response)
                    ? response
                    : response?.content || [];

            setProducts(items);
        } catch (err) {
            setError(
                err?.message || "Unable to load products."
            );
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================

    function resetMessages() {
        setError("");
        setSuccess("");
    }

    function defaultForm() {
        return {
            supplierId: "",
            purchaseDate:
                new Date().toISOString().split("T")[0],
            items: [
                {
                    productId: "",
                    quantity: "1",
                    unitPrice: ""
                }
            ]
        };
    }

    function openCreateModal() {
        resetMessages();
        setForm(defaultForm());
        setFormErrors({});
        setModalOpen(true);
    }

    function closeCreateModal() {
        if (formLoading) {
            return;
        }

        setModalOpen(false);
        setFormErrors({});
    }

    function openViewModal(purchase) {
        resetMessages();
        setSelectedPurchase(purchase);
        setViewModalOpen(true);
    }

    function closeViewModal() {
        setSelectedPurchase(null);
        setViewModalOpen(false);
    }

    function handleFormChange(event) {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));

        setFormErrors((current) => ({
            ...current,
            [name]: ""
        }));
    }

    function handleItemChange(index, field, value) {
        setForm((current) => ({
            ...current,
            items: current.items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value
                    }
                    : item
            )
        }));

        setFormErrors((current) => ({
            ...current,
            [`item-${index}`]: ""
        }));
    }

    function addItem() {
        setForm((current) => ({
            ...current,
            items: [
                ...current.items,
                {
                    productId: "",
                    quantity: "1",
                    unitPrice: ""
                }
            ]
        }));
    }

    function removeItem(index) {
        if (form.items.length === 1) {
            return;
        }

        setForm((current) => ({
            ...current,
            items: current.items.filter(
                (_, itemIndex) => itemIndex !== index
            )
        }));
    }

    function getProduct(productId) {
        return products.find(
            (product) =>
                String(product.id) === String(productId)
        );
    }

    function getItemSubtotal(item) {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);

        return quantity * unitPrice;
    }

    const formTotal = useMemo(() => {
        return form.items.reduce(
            (total, item) =>
                total + getItemSubtotal(item),
            0
        );
    }, [form.items]);

    // =========================================================
    // VALIDATION
    // =========================================================

    function validateForm() {
        const errors = {};

        if (!form.supplierId) {
            errors.supplierId =
                "Supplier is required.";
        }

        if (!form.purchaseDate) {
            errors.purchaseDate =
                "Purchase date is required.";
        }

        if (!form.items.length) {
            errors.items =
                "Purchase must contain at least one item.";
        }

        const usedProducts = new Set();

        form.items.forEach((item, index) => {
            if (!item.productId) {
                errors[`item-${index}`] =
                    "Select a product.";
                return;
            }

            const productKey =
                String(item.productId);

            if (usedProducts.has(productKey)) {
                errors[`item-${index}`] =
                    "This product is already added.";
            }

            usedProducts.add(productKey);

            const quantity = Number(
                item.quantity
            );

            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                errors[`item-${index}`] =
                    "Quantity must be a whole number greater than 0.";
            }

            const unitPrice =
                Number(item.unitPrice);

            if (
                !Number.isFinite(unitPrice) ||
                unitPrice <= 0
            ) {
                errors[`item-${index}`] =
                    "Unit price must be greater than 0.";
            } else if (
                !/^\d+(\.\d{1,2})?$/.test(
                    item.unitPrice
                )
            ) {
                errors[`item-${index}`] =
                    "Unit price can have maximum 2 decimal places.";
            }
        });

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    // =========================================================
    // CREATE PURCHASE
    // =========================================================

    async function handleSubmit(event) {
        event.preventDefault();

        resetMessages();

        if (!validateForm()) {
            return;
        }

        const payload = {
            supplierId: Number(form.supplierId),

            purchaseDate:
            form.purchaseDate,

            items: form.items.map((item) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice)
            }))
        };

        try {
            setFormLoading(true);

            await post(
                "/purchases",
                payload
            );

            setSuccess(
                "Purchase created successfully."
            );

            setModalOpen(false);
            setFormErrors({});
            setForm(defaultForm());

            await loadPurchases();
        } catch (err) {
            setError(
                err?.message ||
                "Unable to create purchase."
            );
        } finally {
            setFormLoading(false);
        }
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    async function updateStatus(
        purchase,
        newStatus
    ) {
        let message;

        if (newStatus === "ORDERED") {
            message =
                `Mark purchase #${purchase.id} as ORDERED?`;
        } else if (
            newStatus === "RECEIVED"
        ) {
            message =
                `Receive purchase #${purchase.id}?\n\nThis will increase inventory stock for all purchase items.`;
        } else {
            message =
                `Cancel purchase #${purchase.id}?`;
        }

        const confirmed =
            window.confirm(message);

        if (!confirmed) {
            return;
        }

        try {
            resetMessages();

            setActionLoading(
                `${purchase.id}-${newStatus}`
            );

            await apiRequest(
                `/purchases/${purchase.id}/status?status=${encodeURIComponent(
                    newStatus
                )}`,
                {
                    method: "PUT"
                }
            );

            if (newStatus === "RECEIVED") {
                setSuccess(
                    `Purchase #${purchase.id} received. Inventory has been updated.`
                );
            } else if (
                newStatus === "ORDERED"
            ) {
                setSuccess(
                    `Purchase #${purchase.id} marked as ordered.`
                );
            } else {
                setSuccess(
                    `Purchase #${purchase.id} cancelled.`
                );
            }

            await loadPurchases();
        } catch (err) {
            setError(
                err?.message ||
                "Unable to update purchase status."
            );
        } finally {
            setActionLoading(null);
        }
    }

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredPurchases = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) {
            return purchases;
        }

        return purchases.filter(
            (purchase) => {
                const itemText =
                    purchase.items
                        ?.map(
                            (item) =>
                                `${item.productName || ""} ${
                                    item.sku || ""
                                }`
                        )
                        .join(" ") || "";

                const text = [
                    purchase.id,
                    purchase.supplierName,
                    purchase.purchaseDate,
                    purchase.status,
                    purchase.totalAmount,
                    itemText
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(query);
            }
        );
    }, [purchases, search]);

    // =========================================================
    // STATS
    // =========================================================

    const purchaseStats = useMemo(() => {
        return {
            total: purchases.length,

            draft: purchases.filter(
                (purchase) =>
                    purchase.status === "DRAFT"
            ).length,

            ordered: purchases.filter(
                (purchase) =>
                    purchase.status === "ORDERED"
            ).length,

            received: purchases.filter(
                (purchase) =>
                    purchase.status === "RECEIVED"
            ).length,

            cancelled: purchases.filter(
                (purchase) =>
                    purchase.status === "CANCELLED"
            ).length
        };
    }, [purchases]);

    function formatCurrency(value) {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(Number(value || 0));
    }

    function statusClass(status) {
        switch (status) {
            case "RECEIVED":
                return "badge-success";

            case "ORDERED":
                return "badge-primary";

            case "DRAFT":
                return "badge-warning";

            case "CANCELLED":
                return "badge-danger";

            default:
                return "badge-neutral";
        }
    }

    function itemCount(purchase) {
        return purchase.items?.length || 0;
    }

    function availableProductsForRow(index) {
        const selectedIds =
            form.items
                .filter(
                    (_, itemIndex) =>
                        itemIndex !== index
                )
                .map(
                    (item) =>
                        String(item.productId)
                );

        return products.filter(
            (product) =>
                !selectedIds.includes(
                    String(product.id)
                )
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="management-page purchases-page">

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="management-header">

                <div className="management-header-content">

                    <span className="management-kicker">
                        Procurement operations
                    </span>

                    <h1>Purchases</h1>

                    <p>
                        Create purchase orders, track
                        supplier deliveries, and receive
                        stock into inventory.
                    </p>

                </div>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={
                            openCreateModal
                        }
                    >
                        <Plus size={17} />
                        Create Purchase
                    </button>
                )}

            </div>

            {/* =================================================
                MESSAGES
                ================================================= */}

            {error && (
                <div className="error-message management-page-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="purchase-success-message">
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        aria-label="Dismiss success message"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* =================================================
                STATS
                ================================================= */}

            <div className="management-stat-grid">

                <div className="management-stat-card">

                    <div className="management-stat-icon purchase-stat-blue">
                        <ShoppingCart size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Total Purchases</span>

                        <strong>
                            {loading
                                ? "—"
                                : purchaseStats.total}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon purchase-stat-yellow">
                        <CalendarDays size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Draft</span>

                        <strong>
                            {loading
                                ? "—"
                                : purchaseStats.draft}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon purchase-stat-purple">
                        <Truck size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Ordered</span>

                        <strong>
                            {loading
                                ? "—"
                                : purchaseStats.ordered}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon purchase-stat-green">
                        <ArrowDownToLine size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Received</span>

                        <strong>
                            {loading
                                ? "—"
                                : purchaseStats.received}
                        </strong>
                    </div>

                </div>

            </div>

            {/* =================================================
                SEARCH
                ================================================= */}

            <div className="management-toolbar">

                <div className="management-search">

                    <Search size={17} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search purchases..."
                        aria-label="Search purchases"
                    />

                    {search && (
                        <button
                            type="button"
                            className="management-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear purchase search"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                <div className="toolbar-summary">
                    {loading
                        ? "Loading..."
                        : `${filteredPurchases.length} ${
                            filteredPurchases.length ===
                            1
                                ? "purchase"
                                : "purchases"
                        }`}
                </div>

            </div>

            {/* =================================================
                TABLE
                ================================================= */}

            <div className="management-card">

                {loading ? (
                    <div className="management-loading">

                        <div className="loading-spinner" />

                        <strong>
                            Loading purchases...
                        </strong>

                        <span>
                            Fetching procurement records.
                        </span>

                    </div>
                ) : filteredPurchases.length ===
                0 ? (
                    <div className="management-empty">

                        <div className="empty-icon">
                            <ShoppingCart size={22} />
                        </div>

                        <h3>
                            {search
                                ? "No purchases found"
                                : "No purchases yet"}
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search criteria."
                                : "Create your first purchase order to start tracking procurement."}
                        </p>

                        {!search && isAdmin && (
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={
                                    openCreateModal
                                }
                            >
                                <Plus size={16} />
                                Create Purchase
                            </button>
                        )}

                    </div>
                ) : (
                    <div className="management-table-wrapper">

                        <table className="management-table">

                            <thead>

                            <tr>
                                <th>Purchase</th>
                                <th>Supplier</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>

                            </thead>

                            <tbody>

                            {filteredPurchases.map(
                                (purchase) => (
                                    <tr
                                        key={
                                            purchase.id
                                        }
                                    >

                                        <td>
                                            <div className="purchase-id-cell">

                                                <div className="purchase-icon">
                                                    <ShoppingCart
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <strong>
                                                        #
                                                        {
                                                            purchase.id
                                                        }
                                                    </strong>

                                                    <span>
                                                            Purchase
                                                        </span>
                                                </div>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="purchase-supplier-cell">

                                                <div className="person-avatar supplier-avatar">
                                                    {
                                                        (
                                                            purchase.supplierName ||
                                                            "S"
                                                        )
                                                            .charAt(
                                                                0
                                                            )
                                                            .toUpperCase()
                                                    }
                                                </div>

                                                <span>
                                                        {
                                                            purchase.supplierName ||
                                                            "-"
                                                        }
                                                    </span>

                                            </div>
                                        </td>

                                        <td>
                                            <div className="icon-text">
                                                <CalendarDays
                                                    size={
                                                        14
                                                    }
                                                />

                                                <span>
                                                        {
                                                            purchase.purchaseDate ||
                                                            "-"
                                                        }
                                                    </span>
                                            </div>
                                        </td>

                                        <td>
                                                <span className="soft-tag">
                                                    {
                                                        itemCount(
                                                            purchase
                                                        )
                                                    }{" "}
                                                    {itemCount(
                                                        purchase
                                                    ) === 1
                                                        ? "item"
                                                        : "items"}
                                                </span>
                                        </td>

                                        <td>
                                            <strong className="purchase-total">
                                                {formatCurrency(
                                                    purchase.totalAmount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                                <span
                                                    className={`badge ${statusClass(
                                                        purchase.status
                                                    )}`}
                                                >
                                                    {
                                                        purchase.status
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                            <div className="purchase-action-group">

                                                <button
                                                    type="button"
                                                    className="table-action-button"
                                                    onClick={() =>
                                                        openViewModal(
                                                            purchase
                                                        )
                                                    }
                                                    title={`View purchase #${purchase.id}`}
                                                    aria-label={`View purchase #${purchase.id}`}
                                                >
                                                    <Eye
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                {isAdmin &&
                                                    purchase.status ===
                                                    "DRAFT" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="purchase-status-button purchase-order-button"
                                                                disabled={
                                                                    actionLoading ===
                                                                    `${purchase.id}-ORDERED`
                                                                }
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        purchase,
                                                                        "ORDERED"
                                                                    )
                                                                }
                                                            >
                                                                {actionLoading ===
                                                                `${purchase.id}-ORDERED`
                                                                    ? "..."
                                                                    : "Order"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="purchase-icon-status-button purchase-cancel-button"
                                                                disabled={
                                                                    actionLoading ===
                                                                    `${purchase.id}-CANCELLED`
                                                                }
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        purchase,
                                                                        "CANCELLED"
                                                                    )
                                                                }
                                                                title="Cancel purchase"
                                                                aria-label="Cancel purchase"
                                                            >
                                                                <Ban
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>
                                                        </>
                                                    )}

                                                {isAdmin &&
                                                    purchase.status ===
                                                    "ORDERED" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="purchase-status-button purchase-receive-button"
                                                                disabled={
                                                                    actionLoading ===
                                                                    `${purchase.id}-RECEIVED`
                                                                }
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        purchase,
                                                                        "RECEIVED"
                                                                    )
                                                                }
                                                            >
                                                                {actionLoading ===
                                                                `${purchase.id}-RECEIVED`
                                                                    ? "..."
                                                                    : "Receive"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="purchase-icon-status-button purchase-cancel-button"
                                                                disabled={
                                                                    actionLoading ===
                                                                    `${purchase.id}-CANCELLED`
                                                                }
                                                                onClick={() =>
                                                                    updateStatus(
                                                                        purchase,
                                                                        "CANCELLED"
                                                                    )
                                                                }
                                                                title="Cancel purchase"
                                                                aria-label="Cancel purchase"
                                                            >
                                                                <Ban
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            </button>
                                                        </>
                                                    )}

                                                <ChevronRight
                                                    size={
                                                        14
                                                    }
                                                    className="purchase-row-arrow"
                                                />

                                            </div>
                                        </td>

                                    </tr>
                                )
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* =================================================
                CREATE PURCHASE MODAL
                ================================================= */}

            {modalOpen && (
                <div
                    className="purchase-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >

                    <div
                        className="purchase-modal purchase-create-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="purchase-create-title"
                    >

                        <div className="purchase-modal-header">

                            <div>

                                <span className="purchase-modal-kicker">
                                    Procurement operations
                                </span>

                                <h2 id="purchase-create-title">
                                    Create Purchase
                                </h2>

                                <p>
                                    Create a draft purchase
                                    with supplier and item
                                    details.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="purchase-modal-close"
                                onClick={
                                    closeCreateModal
                                }
                                disabled={
                                    formLoading
                                }
                                aria-label="Close purchase form"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            className="purchase-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="purchase-form-grid">

                                <div className="purchase-form-field">

                                    <label htmlFor="purchase-supplier">
                                        Supplier
                                        <span>*</span>
                                    </label>

                                    <select
                                        id="purchase-supplier"
                                        name="supplierId"
                                        value={
                                            form.supplierId
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        disabled={
                                            formLoading
                                        }
                                    >
                                        <option value="">
                                            Select supplier
                                        </option>

                                        {suppliers.map(
                                            (
                                                supplier
                                            ) => (
                                                <option
                                                    key={
                                                        supplier.id
                                                    }
                                                    value={
                                                        supplier.id
                                                    }
                                                >
                                                    {
                                                        supplier.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {formErrors.supplierId && (
                                        <small className="purchase-field-error">
                                            {
                                                formErrors.supplierId
                                            }
                                        </small>
                                    )}

                                </div>

                                <div className="purchase-form-field">

                                    <label htmlFor="purchase-date">
                                        Purchase Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="purchase-date"
                                        name="purchaseDate"
                                        type="date"
                                        value={
                                            form.purchaseDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        disabled={
                                            formLoading
                                        }
                                    />

                                    {formErrors.purchaseDate && (
                                        <small className="purchase-field-error">
                                            {
                                                formErrors.purchaseDate
                                            }
                                        </small>
                                    )}

                                </div>

                            </div>

                            <div className="purchase-items-section">

                                <div className="purchase-items-heading">

                                    <div>
                                        <h3>
                                            Purchase Items
                                        </h3>

                                        <p>
                                            Add the products
                                            and quantities
                                            being purchased.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn purchase-add-item-button"
                                        onClick={
                                            addItem
                                        }
                                        disabled={
                                            formLoading ||
                                            form.items.length >=
                                            products.length
                                        }
                                    >
                                        <Plus
                                            size={
                                                15
                                            }
                                        />
                                        Add Item
                                    </button>

                                </div>

                                {formErrors.items && (
                                    <small className="purchase-field-error">
                                        {
                                            formErrors.items
                                        }
                                    </small>
                                )}

                                <div className="purchase-item-list">

                                    {form.items.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                className="purchase-item-row"
                                                key={
                                                    index
                                                }
                                            >

                                                <div className="purchase-item-number">
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </div>

                                                <div className="purchase-form-field purchase-item-product">

                                                    <label>
                                                        Product
                                                    </label>

                                                    <select
                                                        value={
                                                            item.productId
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleItemChange(
                                                                index,
                                                                "productId",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            formLoading
                                                        }
                                                    >
                                                        <option value="">
                                                            Select
                                                            product
                                                        </option>

                                                        {availableProductsForRow(
                                                            index
                                                        ).map(
                                                            (
                                                                product
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    value={
                                                                        product.id
                                                                    }
                                                                >
                                                                    {
                                                                        product.name
                                                                    }{" "}
                                                                    (
                                                                    {
                                                                        product.sku
                                                                    }
                                                                    )
                                                                </option>
                                                            )
                                                        )}

                                                        {item.productId &&
                                                            !availableProductsForRow(
                                                                index
                                                            ).some(
                                                                (
                                                                    product
                                                                ) =>
                                                                    String(
                                                                        product.id
                                                                    ) ===
                                                                    String(
                                                                        item.productId
                                                                    )
                                                            ) && (
                                                                <option
                                                                    value={
                                                                        item.productId
                                                                    }
                                                                >
                                                                    {
                                                                        getProduct(
                                                                            item.productId
                                                                        )
                                                                            ?.name
                                                                    }
                                                                </option>
                                                            )}
                                                    </select>

                                                </div>

                                                <div className="purchase-form-field purchase-item-quantity">

                                                    <label>
                                                        Qty
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={
                                                            item.quantity
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleItemChange(
                                                                index,
                                                                "quantity",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            formLoading
                                                        }
                                                    />

                                                </div>

                                                <div className="purchase-form-field purchase-item-price">

                                                    <label>
                                                        Unit Cost
                                                    </label>

                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="0.00"
                                                        value={
                                                            item.unitPrice
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleItemChange(
                                                                index,
                                                                "unitPrice",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        disabled={
                                                            formLoading
                                                        }
                                                    />

                                                </div>

                                                <div className="purchase-item-subtotal">

                                                    <span>
                                                        Subtotal
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            getItemSubtotal(
                                                                item
                                                            )
                                                        )}
                                                    </strong>

                                                </div>

                                                <button
                                                    type="button"
                                                    className="purchase-remove-item"
                                                    onClick={() =>
                                                        removeItem(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        formLoading ||
                                                        form
                                                            .items
                                                            .length ===
                                                        1
                                                    }
                                                    aria-label={`Remove item ${index + 1}`}
                                                    title="Remove item"
                                                >
                                                    <X
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </button>

                                                {formErrors[
                                                    `item-${index}`
                                                    ] && (
                                                    <small className="purchase-field-error purchase-item-error">
                                                        {
                                                            formErrors[
                                                                `item-${index}`
                                                                ]
                                                        }
                                                    </small>
                                                )}

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                            <div className="purchase-total-bar">

                                <span>
                                    Purchase Total
                                </span>

                                <strong>
                                    {formatCurrency(
                                        formTotal
                                    )}
                                </strong>

                            </div>

                            <div className="purchase-form-actions">

                                <button
                                    type="button"
                                    className="btn purchase-cancel-form-button"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={
                                        formLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        formLoading ||
                                        suppliers.length ===
                                        0 ||
                                        products.length ===
                                        0
                                    }
                                >
                                    {formLoading ? (
                                        <>
                                            <span className="mini-spinner light" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus
                                                size={
                                                    16
                                                }
                                            />
                                            Create Purchase
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                VIEW PURCHASE MODAL
                ================================================= */}

            {viewModalOpen &&
                selectedPurchase && (
                    <div
                        className="purchase-modal-backdrop"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeViewModal();
                            }
                        }}
                    >

                        <div
                            className="purchase-modal purchase-view-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="purchase-view-title"
                        >

                            <div className="purchase-modal-header">

                                <div>

                                    <span className="purchase-modal-kicker">
                                        Purchase details
                                    </span>

                                    <h2 id="purchase-view-title">
                                        Purchase #
                                        {
                                            selectedPurchase.id
                                        }
                                    </h2>

                                    <p>
                                        Supplier and line-item
                                        details for this
                                        purchase.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="purchase-modal-close"
                                    onClick={
                                        closeViewModal
                                    }
                                    aria-label="Close purchase details"
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <div className="purchase-detail-content">

                                <div className="purchase-detail-summary">

                                    <div className="purchase-detail-block">
                                        <span>
                                            Supplier
                                        </span>

                                        <strong>
                                            {
                                                selectedPurchase.supplierName
                                            }
                                        </strong>
                                    </div>

                                    <div className="purchase-detail-block">
                                        <span>
                                            Date
                                        </span>

                                        <strong>
                                            {
                                                selectedPurchase.purchaseDate
                                            }
                                        </strong>
                                    </div>

                                    <div className="purchase-detail-block">
                                        <span>
                                            Status
                                        </span>

                                        <strong>
                                            <span
                                                className={`badge ${statusClass(
                                                    selectedPurchase.status
                                                )}`}
                                            >
                                                {
                                                    selectedPurchase.status
                                                }
                                            </span>
                                        </strong>
                                    </div>

                                    <div className="purchase-detail-block">
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                selectedPurchase.totalAmount
                                            )}
                                        </strong>
                                    </div>

                                </div>

                                <div className="purchase-detail-items">

                                    <h3>
                                        Items
                                    </h3>

                                    <div className="management-table-wrapper">

                                        <table className="management-table">

                                            <thead>

                                            <tr>
                                                <th>
                                                    Product
                                                </th>
                                                <th>
                                                    SKU
                                                </th>
                                                <th>
                                                    Qty
                                                </th>
                                                <th>
                                                    Unit Cost
                                                </th>
                                                <th>
                                                    Subtotal
                                                </th>
                                            </tr>

                                            </thead>

                                            <tbody>

                                            {(
                                                selectedPurchase.items ||
                                                []
                                            ).map(
                                                (
                                                    item
                                                ) => (
                                                    <tr
                                                        key={
                                                            item.id ||
                                                            `${selectedPurchase.id}-${item.productId}`
                                                        }
                                                    >

                                                        <td>
                                                            <div className="purchase-detail-product">

                                                                <Package
                                                                    size={
                                                                        15
                                                                    }
                                                                />

                                                                <span>
                                                                        {
                                                                            item.productName
                                                                        }
                                                                    </span>

                                                            </div>
                                                        </td>

                                                        <td>
                                                                <span className="table-id">
                                                                    {
                                                                        item.sku
                                                                    }
                                                                </span>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.quantity
                                                            }
                                                        </td>

                                                        <td>
                                                            {formatCurrency(
                                                                item.unitPrice
                                                            )}
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {formatCurrency(
                                                                    item.subtotal
                                                                )}
                                                            </strong>
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                                <div className="purchase-view-actions">

                                    {isAdmin &&
                                        selectedPurchase.status ===
                                        "DRAFT" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn purchase-order-large-button"
                                                    onClick={() => {
                                                        closeViewModal();
                                                        updateStatus(
                                                            selectedPurchase,
                                                            "ORDERED"
                                                        );
                                                    }}
                                                >
                                                    <Truck
                                                        size={
                                                            16
                                                        }
                                                    />
                                                    Mark Ordered
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn purchase-cancel-large-button"
                                                    onClick={() => {
                                                        closeViewModal();
                                                        updateStatus(
                                                            selectedPurchase,
                                                            "CANCELLED"
                                                        );
                                                    }}
                                                >
                                                    <Ban
                                                        size={
                                                            16
                                                        }
                                                    />
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                    {isAdmin &&
                                        selectedPurchase.status ===
                                        "ORDERED" && (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn purchase-receive-large-button"
                                                    onClick={() => {
                                                        closeViewModal();
                                                        updateStatus(
                                                            selectedPurchase,
                                                            "RECEIVED"
                                                        );
                                                    }}
                                                >
                                                    <ArrowDownToLine
                                                        size={
                                                            16
                                                        }
                                                    />
                                                    Receive Purchase
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn purchase-cancel-large-button"
                                                    onClick={() => {
                                                        closeViewModal();
                                                        updateStatus(
                                                            selectedPurchase,
                                                            "CANCELLED"
                                                        );
                                                    }}
                                                >
                                                    <Ban
                                                        size={
                                                            16
                                                        }
                                                    />
                                                    Cancel
                                                </button>
                                            </>
                                        )}

                                    <button
                                        type="button"
                                        className="btn purchase-cancel-form-button"
                                        onClick={
                                            closeViewModal
                                        }
                                    >
                                        Close
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Purchases;