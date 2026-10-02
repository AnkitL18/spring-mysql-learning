import {
    ArrowDown,
    ArrowUp,
    Boxes,
    Edit3,
    Minus,
    Package,
    Plus,
    Search,
    Settings2,
    X
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { get, post, put } from "../api/api";
import { getUser } from "../utils/auth";

function Inventory() {
    const currentUser = getUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [adjustModalOpen, setAdjustModalOpen] =
        useState(false);

    const [settingsModalOpen, setSettingsModalOpen] =
        useState(false);

    const [selectedItem, setSelectedItem] =
        useState(null);

    const [adjustForm, setAdjustForm] = useState({
        increase: true,
        quantity: ""
    });

    const [settingsForm, setSettingsForm] =
        useState({
            reorderLevel: "",
            maximumStock: ""
        });

    const [formErrors, setFormErrors] =
        useState({});

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        try {
            setLoading(true);
            setError("");

            const response =
                await get("/inventory?page=0&size=100");

            const items =
                Array.isArray(response)
                    ? response
                    : response?.content || [];

            setInventory(items);
        } catch (err) {
            setError(
                err?.message ||
                "Unable to load inventory."
            );
        } finally {
            setLoading(false);
        }
    }

    function resetMessages() {
        setError("");
        setSuccess("");
    }

    // =========================================================
    // HELPERS
    // =========================================================

    function getStock(item) {
        return Number(
            item.currentStock ??
            item.stock ??
            item.quantity ??
            0
        );
    }

    function getReorderLevel(item) {
        return Number(
            item.reorderLevel ??
            item.reorderPoint ??
            5
        );
    }

    function getMaximumStock(item) {
        return Number(
            item.maximumStock ??
            100
        );
    }

    function getStatus(item) {
        const stock = getStock(item);
        const reorderLevel =
            getReorderLevel(item);

        if (stock <= 0) {
            return {
                label: "Out of stock",
                className: "badge-danger"
            };
        }

        if (stock <= reorderLevel) {
            return {
                label: "Low stock",
                className: "badge-warning"
            };
        }

        return {
            label: "In stock",
            className: "badge-success"
        };
    }

    function resetAdjustForm() {
        setAdjustForm({
            increase: true,
            quantity: ""
        });

        setFormErrors({});
    }

    function resetSettingsForm() {
        setSettingsForm({
            reorderLevel: "",
            maximumStock: ""
        });

        setFormErrors({});
    }

    function openAdjustModal(item) {
        resetMessages();

        setSelectedItem(item);

        setAdjustForm({
            increase: true,
            quantity: ""
        });

        setFormErrors({});
        setAdjustModalOpen(true);
    }

    function closeAdjustModal() {
        if (saving) {
            return;
        }

        setAdjustModalOpen(false);
        setSelectedItem(null);
        setFormErrors({});
    }

    function openSettingsModal(item) {
        resetMessages();

        setSelectedItem(item);

        setSettingsForm({
            reorderLevel: String(
                getReorderLevel(item)
            ),
            maximumStock: String(
                getMaximumStock(item)
            )
        });

        setFormErrors({});
        setSettingsModalOpen(true);
    }

    function closeSettingsModal() {
        if (saving) {
            return;
        }

        setSettingsModalOpen(false);
        setSelectedItem(null);
        setFormErrors({});
    }

    // =========================================================
    // ADJUST STOCK
    // =========================================================

    function validateAdjustForm() {
        const errors = {};

        const quantity =
            Number(adjustForm.quantity);

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {
            errors.quantity =
                "Quantity must be a whole number greater than 0.";
        }

        if (
            selectedItem &&
            !adjustForm.increase &&
            quantity > getStock(selectedItem)
        ) {
            errors.quantity =
                `Cannot decrease more than the available stock of ${getStock(
                    selectedItem
                )}.`;
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleAdjustStock(event) {
        event.preventDefault();

        resetMessages();

        if (!validateAdjustForm()) {
            return;
        }

        try {
            setSaving(true);

            await post(
                `/inventory/product/${selectedItem.productId}/adjust`,
                {
                    quantity:
                        Number(
                            adjustForm.quantity
                        ),
                    increase:
                    adjustForm.increase
                }
            );

            setSuccess(
                adjustForm.increase
                    ? `${selectedItem.productName} stock increased successfully.`
                    : `${selectedItem.productName} stock decreased successfully.`
            );

            setAdjustModalOpen(false);
            setSelectedItem(null);
            setFormErrors({});

            await loadInventory();
        } catch (err) {
            setError(
                err?.message ||
                "Unable to adjust stock."
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================================================
    // INVENTORY SETTINGS
    // =========================================================

    function validateSettingsForm() {
        const errors = {};

        const reorderLevel =
            Number(
                settingsForm.reorderLevel
            );

        const maximumStock =
            Number(
                settingsForm.maximumStock
            );

        if (
            !Number.isInteger(
                reorderLevel
            ) ||
            reorderLevel < 0
        ) {
            errors.reorderLevel =
                "Reorder level must be a whole number 0 or greater.";
        }

        if (
            !Number.isInteger(
                maximumStock
            ) ||
            maximumStock < 0
        ) {
            errors.maximumStock =
                "Maximum stock must be a whole number 0 or greater.";
        }

        if (
            Number.isInteger(
                reorderLevel
            ) &&
            Number.isInteger(
                maximumStock
            ) &&
            maximumStock < reorderLevel
        ) {
            errors.maximumStock =
                "Maximum stock must be greater than or equal to reorder level.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSettingsSubmit(
        event
    ) {
        event.preventDefault();

        resetMessages();

        if (!validateSettingsForm()) {
            return;
        }

        try {
            setSaving(true);

            await put(
                `/inventory/product/${selectedItem.productId}/settings`,
                {
                    reorderLevel:
                        Number(
                            settingsForm.reorderLevel
                        ),
                    maximumStock:
                        Number(
                            settingsForm.maximumStock
                        )
                }
            );

            setSuccess(
                `${selectedItem.productName} inventory settings updated successfully.`
            );

            setSettingsModalOpen(false);
            setSelectedItem(null);
            setFormErrors({});

            await loadInventory();
        } catch (err) {
            setError(
                err?.message ||
                "Unable to update inventory settings."
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredInventory = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) {
            return inventory;
        }

        return inventory.filter(
            (item) => {
                const text = [
                    item.productName,
                    item.sku,
                    item.productId,
                    item.id,
                    item.stockStatus
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return text.includes(query);
            }
        );
    }, [inventory, search]);

    // =========================================================
    // STATS
    // =========================================================

    const inventoryStats = useMemo(() => {
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        inventory.forEach((item) => {
            const stock =
                getStock(item);

            const reorderLevel =
                getReorderLevel(item);

            if (stock <= 0) {
                outOfStock += 1;
            } else if (
                stock <= reorderLevel
            ) {
                lowStock += 1;
            } else {
                inStock += 1;
            }
        });

        return {
            total: inventory.length,
            inStock,
            lowStock,
            outOfStock
        };
    }, [inventory]);

    function stockPercentage(item) {
        const stock = getStock(item);
        const maximum =
            getMaximumStock(item);

        if (maximum <= 0) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(
                0,
                (stock / maximum) * 100
            )
        );
    }

    return (
        <div className="management-page inventory-page">

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="management-header">

                <div className="management-header-content">

                    <span className="management-kicker">
                        Stock control
                    </span>

                    <h1>Inventory</h1>

                    <p>
                        Monitor stock levels, adjust
                        quantities, and manage inventory
                        thresholds.
                    </p>

                </div>

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
                <div className="inventory-success-message">
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

                    <div className="management-stat-icon inventory-stat-blue">
                        <Boxes size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Total Items</span>

                        <strong>
                            {loading
                                ? "—"
                                : inventoryStats.total}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon inventory-stat-green">
                        <ArrowUp size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>In Stock</span>

                        <strong>
                            {loading
                                ? "—"
                                : inventoryStats.inStock}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon inventory-stat-yellow">
                        <Minus size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Low Stock</span>

                        <strong>
                            {loading
                                ? "—"
                                : inventoryStats.lowStock}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon inventory-stat-red">
                        <ArrowDown size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Out of Stock</span>

                        <strong>
                            {loading
                                ? "—"
                                : inventoryStats.outOfStock}
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
                        placeholder="Search inventory..."
                        aria-label="Search inventory"
                    />

                    {search && (
                        <button
                            type="button"
                            className="management-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear inventory search"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                <div className="toolbar-summary">
                    {loading
                        ? "Loading..."
                        : `${filteredInventory.length} ${
                            filteredInventory.length ===
                            1
                                ? "item"
                                : "items"
                        }`}
                </div>

            </div>

            {/* =================================================
                INVENTORY TABLE
                ================================================= */}

            <div className="management-card">

                {loading ? (
                    <div className="management-loading">

                        <div className="loading-spinner" />

                        <strong>
                            Loading inventory...
                        </strong>

                        <span>
                            Fetching current stock levels.
                        </span>

                    </div>
                ) : filteredInventory.length ===
                0 ? (
                    <div className="management-empty">

                        <div className="empty-icon">
                            <Boxes size={22} />
                        </div>

                        <h3>
                            {search
                                ? "No inventory found"
                                : "No inventory yet"}
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search criteria."
                                : "Inventory records are created automatically when products are added."}
                        </p>

                    </div>
                ) : (
                    <div className="management-table-wrapper">

                        <table className="management-table">

                            <thead>

                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Current Stock</th>
                                <th>Stock Level</th>
                                <th>Condition</th>
                                <th>Actions</th>
                            </tr>

                            </thead>

                            <tbody>

                            {filteredInventory.map(
                                (item) => {
                                    const stock =
                                        getStock(
                                            item
                                        );

                                    const maximum =
                                        getMaximumStock(
                                            item
                                        );

                                    const reorder =
                                        getReorderLevel(
                                            item
                                        );

                                    const status =
                                        getStatus(
                                            item
                                        );

                                    return (
                                        <tr
                                            key={
                                                item.id
                                            }
                                        >

                                            <td>

                                                <div className="inventory-product-cell">

                                                    <div className="inventory-product-icon">
                                                        <Package
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </div>

                                                    <div className="inventory-product-info">

                                                        <strong>
                                                            {
                                                                item.productName
                                                            }
                                                        </strong>

                                                        <span>
                                                                Product #
                                                            {
                                                                item.productId
                                                            }
                                                            </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                    <span className="table-id">
                                                        {
                                                            item.sku ||
                                                            "-"
                                                        }
                                                    </span>
                                            </td>

                                            <td>

                                                <div className="inventory-stock-number">
                                                    <strong>
                                                        {
                                                            stock
                                                        }
                                                    </strong>

                                                    <span>
                                                            /{" "}
                                                        {
                                                            maximum
                                                        }
                                                        </span>
                                                </div>

                                            </td>

                                            <td>

                                                <div className="inventory-stock-bar-wrapper">

                                                    <div className="inventory-stock-bar">

                                                        <div
                                                            className="inventory-stock-bar-fill"
                                                            style={{
                                                                width: `${stockPercentage(
                                                                    item
                                                                )}%`
                                                            }}
                                                        />

                                                    </div>

                                                    <span>
                                                            Reorder at{" "}
                                                        {
                                                            reorder
                                                        }
                                                        </span>

                                                </div>

                                            </td>

                                            <td>

                                                    <span
                                                        className={`badge ${status.className}`}
                                                    >
                                                        {
                                                            status.label
                                                        }
                                                    </span>

                                            </td>

                                            <td>

                                                {isAdmin && (
                                                    <div className="inventory-action-group">

                                                        <button
                                                            type="button"
                                                            className="table-action-button inventory-adjust-button"
                                                            onClick={() =>
                                                                openAdjustModal(
                                                                    item
                                                                )
                                                            }
                                                            title={`Adjust ${item.productName} stock`}
                                                            aria-label={`Adjust ${item.productName} stock`}
                                                        >
                                                            <Edit3
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="table-action-button"
                                                            onClick={() =>
                                                                openSettingsModal(
                                                                    item
                                                                )
                                                            }
                                                            title={`Edit ${item.productName} inventory settings`}
                                                            aria-label={`Edit ${item.productName} inventory settings`}
                                                        >
                                                            <Settings2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                    </div>
                                                )}

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* =================================================
                ADJUST STOCK MODAL
                ================================================= */}

            {adjustModalOpen &&
                selectedItem && (
                    <div
                        className="inventory-modal-backdrop"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeAdjustModal();
                            }
                        }}
                    >

                        <div
                            className="inventory-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="inventory-adjust-title"
                        >

                            <div className="inventory-modal-header">

                                <div>

                                    <span className="inventory-modal-kicker">
                                        Stock control
                                    </span>

                                    <h2 id="inventory-adjust-title">
                                        Adjust Stock
                                    </h2>

                                    <p>
                                        {
                                            selectedItem.productName
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="inventory-modal-close"
                                    onClick={
                                        closeAdjustModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    aria-label="Close stock adjustment"
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <form
                                className="inventory-modal-form"
                                onSubmit={
                                    handleAdjustStock
                                }
                            >

                                <div className="inventory-current-stock-card">

                                    <span>
                                        Current stock
                                    </span>

                                    <strong>
                                        {
                                            getStock(
                                                selectedItem
                                            )
                                        }
                                    </strong>

                                </div>

                                <div className="inventory-adjust-toggle">

                                    <button
                                        type="button"
                                        className={
                                            adjustForm.increase
                                                ? "active increase"
                                                : ""
                                        }
                                        onClick={() =>
                                            setAdjustForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    increase: true
                                                })
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <ArrowUp
                                            size={
                                                16
                                            }
                                        />
                                        Increase
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            !adjustForm.increase
                                                ? "active decrease"
                                                : ""
                                        }
                                        onClick={() =>
                                            setAdjustForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    increase: false
                                                })
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        <ArrowDown
                                            size={
                                                16
                                            }
                                        />
                                        Decrease
                                    </button>

                                </div>

                                <div className="inventory-form-field">

                                    <label htmlFor="inventory-adjust-quantity">
                                        Quantity
                                    </label>

                                    <input
                                        id="inventory-adjust-quantity"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={
                                            adjustForm.quantity
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            setAdjustForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    quantity:
                                                    event
                                                        .target
                                                        .value
                                                })
                                            );

                                            setFormErrors(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    quantity:
                                                        ""
                                                })
                                            );
                                        }}
                                        placeholder="Enter quantity"
                                        disabled={
                                            saving
                                        }
                                        autoFocus
                                    />

                                    {formErrors.quantity && (
                                        <small className="inventory-field-error">
                                            {
                                                formErrors.quantity
                                            }
                                        </small>
                                    )}

                                </div>

                                <div className="inventory-modal-actions">

                                    <button
                                        type="button"
                                        className="btn inventory-cancel-button"
                                        onClick={
                                            closeAdjustModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving ? (
                                            <>
                                                <span className="mini-spinner light" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Edit3
                                                    size={
                                                        16
                                                    }
                                                />
                                                Adjust Stock
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

            {/* =================================================
                INVENTORY SETTINGS MODAL
                ================================================= */}

            {settingsModalOpen &&
                selectedItem && (
                    <div
                        className="inventory-modal-backdrop"
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeSettingsModal();
                            }
                        }}
                    >

                        <div
                            className="inventory-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="inventory-settings-title"
                        >

                            <div className="inventory-modal-header">

                                <div>

                                    <span className="inventory-modal-kicker">
                                        Inventory settings
                                    </span>

                                    <h2 id="inventory-settings-title">
                                        Stock Thresholds
                                    </h2>

                                    <p>
                                        {
                                            selectedItem.productName
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="inventory-modal-close"
                                    onClick={
                                        closeSettingsModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    aria-label="Close inventory settings"
                                >
                                    <X size={19} />
                                </button>

                            </div>

                            <form
                                className="inventory-modal-form"
                                onSubmit={
                                    handleSettingsSubmit
                                }
                            >

                                <div className="inventory-settings-grid">

                                    <div className="inventory-form-field">

                                        <label htmlFor="inventory-reorder">
                                            Reorder Level
                                        </label>

                                        <input
                                            id="inventory-reorder"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={
                                                settingsForm.reorderLevel
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setSettingsForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        reorderLevel:
                                                        event
                                                            .target
                                                            .value
                                                    })
                                                );

                                                setFormErrors(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        reorderLevel:
                                                            ""
                                                    })
                                                );
                                            }}
                                            disabled={
                                                saving
                                            }
                                        />

                                        {formErrors.reorderLevel && (
                                            <small className="inventory-field-error">
                                                {
                                                    formErrors.reorderLevel
                                                }
                                            </small>
                                        )}

                                    </div>

                                    <div className="inventory-form-field">

                                        <label htmlFor="inventory-maximum">
                                            Maximum Stock
                                        </label>

                                        <input
                                            id="inventory-maximum"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={
                                                settingsForm.maximumStock
                                            }
                                            onChange={(
                                                event
                                            ) => {
                                                setSettingsForm(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        maximumStock:
                                                        event
                                                            .target
                                                            .value
                                                    })
                                                );

                                                setFormErrors(
                                                    (
                                                        current
                                                    ) => ({
                                                        ...current,
                                                        maximumStock:
                                                            ""
                                                    })
                                                );
                                            }}
                                            disabled={
                                                saving
                                            }
                                        />

                                        {formErrors.maximumStock && (
                                            <small className="inventory-field-error">
                                                {
                                                    formErrors.maximumStock
                                                }
                                            </small>
                                        )}

                                    </div>

                                </div>

                                <div className="inventory-settings-help">
                                    The reorder level determines
                                    when the item is shown as low
                                    stock. Maximum stock is used
                                    for inventory planning and
                                    visualization.
                                </div>

                                <div className="inventory-modal-actions">

                                    <button
                                        type="button"
                                        className="btn inventory-cancel-button"
                                        onClick={
                                            closeSettingsModal
                                        }
                                        disabled={
                                            saving
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            saving
                                        }
                                    >
                                        {saving ? (
                                            <>
                                                <span className="mini-spinner light" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Settings2
                                                    size={
                                                        16
                                                    }
                                                />
                                                Save Settings
                                            </>
                                        )}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>
                )}

        </div>
    );
}

export default Inventory;