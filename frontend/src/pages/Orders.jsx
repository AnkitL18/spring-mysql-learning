import { useEffect, useMemo, useState } from "react";
import { Check, Eye, Plus, Search, X } from "lucide-react";
import { apiRequest, get } from "../api/api";
import { getUser } from "../utils/auth";

const ORDER_STATUSES = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
];

function formatCurrency(value) {
    const number = Number(value || 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(number);
}

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getPageContent(data) {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.content || [];
}

function getCurrentUserIsAdmin() {
    const user = getUser();

    if (!user) return false;

    if (typeof user.role === "string") {
        return user.role.toUpperCase() === "ADMIN";
    }

    if (Array.isArray(user.roles)) {
        return user.roles.some(
            (role) =>
                String(role).toUpperCase() === "ADMIN" ||
                String(role?.name || "").toUpperCase() === "ADMIN" ||
                String(role?.authority || "").toUpperCase() === "ROLE_ADMIN"
        );
    }

    if (Array.isArray(user.authorities)) {
        return user.authorities.some(
            (authority) =>
                String(authority).toUpperCase() === "ROLE_ADMIN" ||
                String(authority?.authority || "").toUpperCase() === "ROLE_ADMIN"
        );
    }

    return false;
}

function getStatusClass(status) {
    switch (status) {
        case "PENDING":
            return "order-status pending";

        case "CONFIRMED":
            return "order-status confirmed";

        case "PROCESSING":
            return "order-status processing";

        case "SHIPPED":
            return "order-status shipped";

        case "DELIVERED":
            return "order-status delivered";

        case "CANCELLED":
            return "order-status cancelled";

        default:
            return "order-status";
    }
}

function getNextActions(status) {
    switch (status) {
        case "PENDING":
            return [
                {
                    label: "Confirm",
                    status: "CONFIRMED",
                    className: "order-action-success"
                },
                {
                    label: "Cancel",
                    status: "CANCELLED",
                    className: "order-action-danger"
                }
            ];

        case "CONFIRMED":
            return [
                {
                    label: "Process",
                    status: "PROCESSING",
                    className: "order-action-primary"
                },
                {
                    label: "Cancel",
                    status: "CANCELLED",
                    className: "order-action-danger"
                }
            ];

        case "PROCESSING":
            return [
                {
                    label: "Ship",
                    status: "SHIPPED",
                    className: "order-action-primary"
                }
            ];

        case "SHIPPED":
            return [
                {
                    label: "Deliver",
                    status: "DELIVERED",
                    className: "order-action-success"
                }
            ];

        default:
            return [];
    }
}

function Orders() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);

    const [customerId, setCustomerId] = useState("");

    const [orderItems, setOrderItems] = useState([
        {
            productId: "",
            quantity: 1
        }
    ]);

    const isAdmin = useMemo(() => getCurrentUserIsAdmin(), []);

    async function loadOrders() {
        try {
            const data = await get("/orders?page=0&size=100");
            setOrders(getPageContent(data));
        } catch (err) {
            setError(err.message || "Failed to load orders");
        }
    }

    async function loadFormData() {
        try {
            const [customersData, productsData, inventoryData] =
                await Promise.all([
                    get("/customers?page=0&size=100"),
                    get("/products?page=0&size=100"),
                    get("/inventory?page=0&size=100")
                ]);

            setCustomers(getPageContent(customersData));
            setProducts(getPageContent(productsData));
            setInventory(getPageContent(inventoryData));
        } catch (err) {
            setError(err.message || "Failed to load order data");
        }
    }

    async function loadAll() {
        setLoading(true);
        setError("");

        await Promise.all([
            loadOrders(),
            loadFormData()
        ]);

        setLoading(false);
    }

    useEffect(() => {
        loadAll();
    }, []);

    function getInventoryForProduct(productId) {
        return inventory.find(
            (item) => Number(item.productId) === Number(productId)
        );
    }

    function updateOrderItem(index, field, value) {
        setOrderItems((currentItems) =>
            currentItems.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        [field]: value
                    }
                    : item
            )
        );
    }

    function addOrderItem() {
        setOrderItems((currentItems) => [
            ...currentItems,
            {
                productId: "",
                quantity: 1
            }
        ]);
    }

    function removeOrderItem(index) {
        setOrderItems((currentItems) =>
            currentItems.filter((_, itemIndex) => itemIndex !== index)
        );
    }

    function resetCreateForm() {
        setCustomerId("");

        setOrderItems([
            {
                productId: "",
                quantity: 1
            }
        ]);

        setError("");
    }

    function openCreateModal() {
        resetCreateForm();
        setShowCreateModal(true);
    }

    function closeCreateModal() {
        if (actionLoading) return;

        setShowCreateModal(false);
    }

    function openViewModal(order) {
        setSelectedOrder(order);
        setShowViewModal(true);
    }

    function closeViewModal() {
        setSelectedOrder(null);
        setShowViewModal(false);
    }

    function validateCreateOrder() {
        if (!customerId) {
            return "Please select a customer.";
        }

        if (!orderItems.length) {
            return "Order must contain at least one item.";
        }

        const selectedProducts = new Set();

        for (const item of orderItems) {
            if (!item.productId) {
                return "Please select a product for every item.";
            }

            if (selectedProducts.has(String(item.productId))) {
                return "The same product cannot be added more than once.";
            }

            selectedProducts.add(String(item.productId));

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                return "Quantity must be a positive whole number.";
            }

            const stock = getInventoryForProduct(item.productId);

            if (stock && quantity > Number(stock.currentStock)) {
                const product = products.find(
                    (productItem) =>
                        Number(productItem.id) === Number(item.productId)
                );

                return `Insufficient stock for ${
                    product?.name || "selected product"
                }. Available: ${stock.currentStock}, required: ${quantity}.`;
            }
        }

        return "";
    }

    function calculateOrderTotal() {
        return orderItems.reduce((total, item) => {
            const product = products.find(
                (productItem) =>
                    Number(productItem.id) === Number(item.productId)
            );

            if (!product) return total;

            const quantity = Number(item.quantity || 0);
            const price = Number(product.price || 0);

            return total + quantity * price;
        }, 0);
    }

    async function handleCreateOrder(event) {
        event.preventDefault();

        const validationError = validateCreateOrder();

        if (validationError) {
            setError(validationError);
            return;
        }

        setActionLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const payload = {
                customerId: Number(customerId),
                items: orderItems.map((item) => ({
                    productId: Number(item.productId),
                    quantity: Number(item.quantity)
                }))
            };

            const createdOrder = await apiRequest("/orders", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            setOrders((currentOrders) => [
                createdOrder,
                ...currentOrders
            ]);

            setShowCreateModal(false);
            resetCreateForm();

            setSuccessMessage(
                `Order #${createdOrder.id} created successfully.`
            );

            await loadOrders();
        } catch (err) {
            setError(err.message || "Failed to create order.");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleStatusChange(order, newStatus) {
        const statusMessages = {
            CONFIRMED:
                "Confirming this order will deduct the ordered quantity from inventory.",
            CANCELLED:
                "Cancelling a confirmed order will restore its quantity to inventory.",
            PROCESSING: "The order will move into processing.",
            SHIPPED: "The order will be marked as shipped.",
            DELIVERED: "The order will be marked as delivered."
        };

        const message =
            statusMessages[newStatus] ||
            `Change order #${order.id} to ${newStatus}?`;

        const confirmed = window.confirm(
            `Order #${order.id}\n\n${message}\n\nContinue?`
        );

        if (!confirmed) return;

        setActionLoading(true);
        setError("");
        setSuccessMessage("");

        try {
            const updatedOrder = await apiRequest(
                `/orders/${order.id}/status?status=${encodeURIComponent(
                    newStatus
                )}`,
                {
                    method: "PUT"
                }
            );

            setOrders((currentOrders) =>
                currentOrders.map((currentOrder) =>
                    currentOrder.id === updatedOrder.id
                        ? updatedOrder
                        : currentOrder
                )
            );

            if (
                selectedOrder &&
                selectedOrder.id === updatedOrder.id
            ) {
                setSelectedOrder(updatedOrder);
            }

            setSuccessMessage(
                `Order #${order.id} changed to ${newStatus}.`
            );

            await loadFormData();
        } catch (err) {
            setError(
                err.message || "Failed to update order status."
            );
        } finally {
            setActionLoading(false);
        }
    }

    const filteredOrders = useMemo(() => {
        const cleanSearch = search.trim().toLowerCase();

        return orders.filter((order) => {
            const matchesStatus =
                !statusFilter ||
                order.status === statusFilter;

            if (!matchesStatus) {
                return false;
            }

            if (!cleanSearch) {
                return true;
            }

            const searchableText = [
                order.id,
                order.customerName,
                order.customerId,
                order.status,
                order.totalAmount,
                ...(order.items || []).flatMap((item) => [
                    item.productName,
                    item.sku,
                    item.productId,
                    item.quantity
                ])
            ]
                .join(" ")
                .toLowerCase();

            return searchableText.includes(cleanSearch);
        });
    }, [orders, search, statusFilter]);

    function getProductUnitPrice(productId) {
        const product = products.find(
            (item) => Number(item.id) === Number(productId)
        );

        return Number(product?.price || 0);
    }

    const totalItems = orders.length;

    const pendingCount = orders.filter(
        (order) => order.status === "PENDING"
    ).length;

    const confirmedCount = orders.filter(
        (order) => order.status === "CONFIRMED"
    ).length;

    const deliveredCount = orders.filter(
        (order) => order.status === "DELIVERED"
    ).length;

    return (
        <div className="management-page">
            <div className="management-header">
                <div>
                    <div className="management-kicker">
                        Sales Management
                    </div>

                    <h1>Orders</h1>

                    <p>
                        Create customer orders and manage their
                        fulfillment lifecycle.
                    </p>
                </div>

                <button
                    className="primary-button"
                    onClick={openCreateModal}
                >
                    <Plus size={18} />
                    Create Order
                </button>
            </div>

            {successMessage && (
                <div className="management-alert success">
                    <Check size={18} />
                    <span>{successMessage}</span>

                    <button
                        onClick={() => setSuccessMessage("")}
                        aria-label="Close success message"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="management-alert error">
                    <span>{error}</span>

                    <button
                        onClick={() => setError("")}
                        aria-label="Close error message"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="management-stats">
                <div className="management-stat-card">
                    <div className="management-stat-label">
                        Total Orders
                    </div>

                    <div className="management-stat-value">
                        {totalItems}
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-label">
                        Pending
                    </div>

                    <div className="management-stat-value">
                        {pendingCount}
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-label">
                        Confirmed
                    </div>

                    <div className="management-stat-value">
                        {confirmedCount}
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-label">
                        Delivered
                    </div>

                    <div className="management-stat-value">
                        {deliveredCount}
                    </div>
                </div>
            </div>

            <div className="management-toolbar">
                <div className="management-search">
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search order, customer, product or SKU..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />
                </div>

                <select
                    className="management-filter-select"
                    value={statusFilter}
                    onChange={(event) =>
                        setStatusFilter(event.target.value)
                    }
                >
                    <option value="">All statuses</option>

                    {ORDER_STATUSES.map((status) => (
                        <option
                            key={status}
                            value={status}
                        >
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            <div className="management-table-card">
                {loading ? (
                    <div className="management-state">
                        <div className="management-spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="management-state">
                        <div className="management-empty-icon">
                            <Search size={22} />
                        </div>

                        <h3>No orders found</h3>

                        <p>
                            {search || statusFilter
                                ? "Try changing your search or filter."
                                : "Create your first customer order to get started."}
                        </p>
                    </div>
                ) : (
                    <div className="management-table-wrapper">
                        <table className="management-table">
                            <thead>
                            <tr>
                                <th>Order</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredOrders.map((order) => {
                                const actions = isAdmin
                                    ? getNextActions(
                                        order.status
                                    )
                                    : [];

                                return (
                                    <tr key={order.id}>
                                        <td>
                                            <div className="order-number">
                                                #{order.id}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="person-cell">
                                                <div className="person-avatar">
                                                    {(
                                                        order.customerName ||
                                                        "C"
                                                    )
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <div className="person-name">
                                                        {
                                                            order.customerName
                                                        }
                                                    </div>

                                                    <div className="person-meta">
                                                        Customer #
                                                        {
                                                            order.customerId
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="order-items-summary">
                                                <strong>
                                                    {
                                                        (
                                                            order.items ||
                                                            []
                                                        ).length
                                                    }{" "}
                                                    product
                                                    {(
                                                        order.items ||
                                                        []
                                                    ).length ===
                                                    1
                                                        ? ""
                                                        : "s"}
                                                </strong>

                                                <span>
                                                        {(
                                                            order.items ||
                                                            []
                                                        )
                                                            .slice(
                                                                0,
                                                                2
                                                            )
                                                            .map(
                                                                (
                                                                    item
                                                                ) =>
                                                                    item.productName
                                                            )
                                                            .join(
                                                                ", "
                                                            )}

                                                    {(
                                                        order.items ||
                                                        []
                                                    ).length >
                                                    2
                                                        ? "..."
                                                        : ""}
                                                    </span>
                                            </div>
                                        </td>

                                        <td>
                                            <strong>
                                                {formatCurrency(
                                                    order.totalAmount
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                                <span
                                                    className={getStatusClass(
                                                        order.status
                                                    )}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>
                                        </td>

                                        <td>
                                                <span className="order-date">
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="management-actions order-row-actions">
                                                <button
                                                    className="icon-button"
                                                    onClick={() =>
                                                        openViewModal(
                                                            order
                                                        )
                                                    }
                                                    title="View order"
                                                >
                                                    <Eye
                                                        size={
                                                            17
                                                        }
                                                    />
                                                </button>

                                                {actions.map(
                                                    (
                                                        action
                                                    ) => (
                                                        <button
                                                            key={
                                                                action.status
                                                            }
                                                            className={`order-status-action ${action.className}`}
                                                            onClick={() =>
                                                                handleStatusChange(
                                                                    order,
                                                                    action.status
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            {
                                                                action.label
                                                            }
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showCreateModal && (
                <div
                    className="management-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreateModal();
                        }
                    }}
                >
                    <div className="management-modal order-modal">
                        <div className="management-modal-header">
                            <div>
                                <div className="management-kicker">
                                    New Transaction
                                </div>

                                <h2>Create Order</h2>

                                <p>
                                    Create a pending order for
                                    a customer.
                                </p>
                            </div>

                            <button
                                className="modal-close-button"
                                onClick={closeCreateModal}
                                disabled={actionLoading}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrder}>
                            <div className="management-form">
                                <div className="management-form-group">
                                    <label>
                                        Customer
                                        <span>*</span>
                                    </label>

                                    <select
                                        value={customerId}
                                        onChange={(event) =>
                                            setCustomerId(
                                                event.target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            actionLoading
                                        }
                                    >
                                        <option value="">
                                            Select customer
                                        </option>

                                        {customers.map(
                                            (customer) => (
                                                <option
                                                    key={
                                                        customer.id
                                                    }
                                                    value={
                                                        customer.id
                                                    }
                                                >
                                                    {
                                                        customer.name
                                                    }{" "}
                                                    —{" "}
                                                    {
                                                        customer.email
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="order-items-form-section">
                                    <div className="order-items-header">
                                        <div>
                                            <h3>
                                                Order Items
                                            </h3>

                                            <p>
                                                Select products
                                                and quantities.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={
                                                addOrderItem
                                            }
                                            disabled={
                                                actionLoading ||
                                                orderItems.length >=
                                                products.length
                                            }
                                        >
                                            <Plus size={16} />
                                            Add Item
                                        </button>
                                    </div>

                                    <div className="order-items-list">
                                        {orderItems.map(
                                            (
                                                item,
                                                index
                                            ) => {
                                                const selectedProduct =
                                                    products.find(
                                                        (
                                                            product
                                                        ) =>
                                                            Number(
                                                                product.id
                                                            ) ===
                                                            Number(
                                                                item.productId
                                                            )
                                                    );

                                                const stock =
                                                    getInventoryForProduct(
                                                        item.productId
                                                    );

                                                const subtotal =
                                                    getProductUnitPrice(
                                                        item.productId
                                                    ) *
                                                    Number(
                                                        item.quantity ||
                                                        0
                                                    );

                                                return (
                                                    <div
                                                        className="order-item-form-row"
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        <div className="management-form-group product-select-group">
                                                            <label>
                                                                Product
                                                                <span>
                                                                    *
                                                                </span>
                                                            </label>

                                                            <select
                                                                value={
                                                                    item.productId
                                                                }
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    updateOrderItem(
                                                                        index,
                                                                        "productId",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select product
                                                                </option>

                                                                {products.map(
                                                                    (
                                                                        product
                                                                    ) => {
                                                                        const alreadySelected =
                                                                            orderItems.some(
                                                                                (
                                                                                    currentItem,
                                                                                    currentIndex
                                                                                ) =>
                                                                                    currentIndex !==
                                                                                    index &&
                                                                                    Number(
                                                                                        currentItem.productId
                                                                                    ) ===
                                                                                    Number(
                                                                                        product.id
                                                                                    )
                                                                            );

                                                                        if (
                                                                            alreadySelected
                                                                        ) {
                                                                            return null;
                                                                        }

                                                                        return (
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
                                                                                —{" "}
                                                                                {
                                                                                    product.sku
                                                                                }
                                                                            </option>
                                                                        );
                                                                    }
                                                                )}
                                                            </select>

                                                            {selectedProduct && (
                                                                <div className="order-product-meta">
                                                                    <span>
                                                                        Price:{" "}
                                                                        {formatCurrency(
                                                                            selectedProduct.price
                                                                        )}
                                                                    </span>

                                                                    <span>
                                                                        Stock:{" "}
                                                                        {stock
                                                                            ? stock.currentStock
                                                                            : 0}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="management-form-group quantity-group">
                                                            <label>
                                                                Quantity
                                                                <span>
                                                                    *
                                                                </span>
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
                                                                    updateOrderItem(
                                                                        index,
                                                                        "quantity",
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                disabled={
                                                                    actionLoading
                                                                }
                                                            />
                                                        </div>

                                                        <div className="order-item-subtotal">
                                                            <span>
                                                                Subtotal
                                                            </span>

                                                            <strong>
                                                                {formatCurrency(
                                                                    subtotal
                                                                )}
                                                            </strong>
                                                        </div>

                                                        {orderItems.length >
                                                            1 && (
                                                                <button
                                                                    type="button"
                                                                    className="remove-item-button"
                                                                    onClick={() =>
                                                                        removeOrderItem(
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading
                                                                    }
                                                                    title="Remove item"
                                                                >
                                                                    <X
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>

                                    <div className="order-form-total">
                                        <span>
                                            Estimated Order Total
                                        </span>

                                        <strong>
                                            {formatCurrency(
                                                calculateOrderTotal()
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="management-modal-footer">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={closeCreateModal}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={actionLoading}
                                >
                                    {actionLoading
                                        ? "Creating..."
                                        : "Create Order"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showViewModal && selectedOrder && (
                <div
                    className="management-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeViewModal();
                        }
                    }}
                >
                    <div className="management-modal order-view-modal">
                        <div className="management-modal-header">
                            <div>
                                <div className="management-kicker">
                                    Order Details
                                </div>

                                <h2>
                                    Order #{selectedOrder.id}
                                </h2>

                                <p>
                                    Created{" "}
                                    {formatDate(
                                        selectedOrder.createdAt
                                    )}
                                </p>
                            </div>

                            <button
                                className="modal-close-button"
                                onClick={closeViewModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="order-detail-grid">
                            <div className="order-detail-card">
                                <span>Customer</span>

                                <strong>
                                    {
                                        selectedOrder.customerName
                                    }
                                </strong>

                                <small>
                                    Customer #
                                    {
                                        selectedOrder.customerId
                                    }
                                </small>
                            </div>

                            <div className="order-detail-card">
                                <span>Status</span>

                                <strong>
                                    <span
                                        className={getStatusClass(
                                            selectedOrder.status
                                        )}
                                    >
                                        {
                                            selectedOrder.status
                                        }
                                    </span>
                                </strong>
                            </div>

                            <div className="order-detail-card">
                                <span>Total</span>

                                <strong>
                                    {formatCurrency(
                                        selectedOrder.totalAmount
                                    )}
                                </strong>
                            </div>
                        </div>

                        <div className="order-view-items">
                            <div className="order-view-section-title">
                                <h3>Items</h3>
                                <span>
                                    {
                                        (
                                            selectedOrder.items ||
                                            []
                                        ).length
                                    }{" "}
                                    line
                                    {(
                                        selectedOrder.items ||
                                        []
                                    ).length === 1
                                        ? ""
                                        : "s"}
                                </span>
                            </div>

                            <div className="order-view-items-list">
                                {(
                                    selectedOrder.items ||
                                    []
                                ).map((item) => (
                                    <div
                                        className="order-view-item"
                                        key={item.id}
                                    >
                                        <div>
                                            <strong>
                                                {
                                                    item.productName
                                                }
                                            </strong>

                                            <span>
                                                SKU:{" "}
                                                {item.sku}
                                            </span>
                                        </div>

                                        <div className="order-view-item-numbers">
                                            <span>
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </span>

                                            <span>
                                                {formatCurrency(
                                                    item.unitPrice
                                                )}{" "}
                                                each
                                            </span>

                                            <strong>
                                                {formatCurrency(
                                                    item.subtotal
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isAdmin &&
                            getNextActions(
                                selectedOrder.status
                            ).length > 0 && (
                                <div className="order-view-status-actions">
                                    <div>
                                        <h3>
                                            Update Status
                                        </h3>

                                        <p>
                                            Status changes are
                                            restricted to admins.
                                        </p>
                                    </div>

                                    <div>
                                        {getNextActions(
                                            selectedOrder.status
                                        ).map((action) => (
                                            <button
                                                key={
                                                    action.status
                                                }
                                                className={`order-status-action large ${action.className}`}
                                                onClick={() =>
                                                    handleStatusChange(
                                                        selectedOrder,
                                                        action.status
                                                    )
                                                }
                                                disabled={
                                                    actionLoading
                                                }
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                        <div className="management-modal-footer">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={closeViewModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Orders;