import {
    Edit3,
    Package,
    Plus,
    Search,
    Tag,
    Trash2,
    X
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api/api";
import { getUser } from "../utils/auth";

function Products() {
    const currentUser = getUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [inventories, setInventories] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [inventoryLoading, setInventoryLoading] = useState(true);

    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [form, setForm] = useState({
        name: "",
        sku: "",
        description: "",
        price: "",
        categoryId: ""
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadProducts();
        loadCategories();
        loadInventories();
    }, []);

    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    async function loadProducts() {
        try {
            setLoading(true);
            setError("");

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
        } finally {
            setLoading(false);
        }
    }

    // =========================================================
    // LOAD CATEGORIES
    // =========================================================

    async function loadCategories() {
        try {
            setCategoriesLoading(true);

            const response =
                await get("/categories?page=0&size=100");

            const items =
                Array.isArray(response)
                    ? response
                    : response?.content || [];

            setCategories(items);
        } catch (err) {
            setError(
                err?.message || "Unable to load categories."
            );
        } finally {
            setCategoriesLoading(false);
        }
    }

    // =========================================================
    // LOAD INVENTORY
    // =========================================================

    async function loadInventories() {
        try {
            setInventoryLoading(true);

            const response =
                await get("/inventory?page=0&size=100");

            const items =
                Array.isArray(response)
                    ? response
                    : response?.content || [];

            setInventories(items);
        } catch (err) {
            /*
             * Product CRUD should still work even if the
             * inventory display cannot be loaded.
             */
            console.error("Unable to load inventory:", err);
        } finally {
            setInventoryLoading(false);
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================

    function resetMessages() {
        setError("");
        setSuccess("");
    }

    function openCreateModal() {
        resetMessages();

        setEditingProduct(null);

        setForm({
            name: "",
            sku: "",
            description: "",
            price: "",
            categoryId: ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function openEditModal(product) {
        resetMessages();

        setEditingProduct(product);

        setForm({
            name: product.name || "",
            sku: product.sku || "",
            description: product.description || "",
            price:
                product.price !== null &&
                product.price !== undefined
                    ? String(product.price)
                    : "",
            categoryId:
                product.categoryId !== null &&
                product.categoryId !== undefined
                    ? String(product.categoryId)
                    : ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingProduct(null);
        setFormErrors({});
    }

    function handleInputChange(event) {
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

    // =========================================================
    // VALIDATION
    // =========================================================

    function validateForm() {
        const errors = {};

        const name = form.name.trim();
        const sku = form.sku.trim();
        const description = form.description.trim();
        const price = form.price.trim();
        const categoryId = form.categoryId;

        if (!name) {
            errors.name = "Product name is required.";
        } else if (name.length > 150) {
            errors.name =
                "Product name cannot exceed 150 characters.";
        }

        if (!sku) {
            errors.sku = "SKU is required.";
        } else if (sku.length > 50) {
            errors.sku = "SKU cannot exceed 50 characters.";
        }

        if (description.length > 1000) {
            errors.description =
                "Description cannot exceed 1000 characters.";
        }

        if (!price) {
            errors.price = "Price is required.";
        } else if (Number.isNaN(Number(price))) {
            errors.price = "Enter a valid price.";
        } else if (Number(price) <= 0) {
            errors.price = "Price must be greater than 0.";
        } else if (
            !/^\d+(\.\d{1,2})?$/.test(price)
        ) {
            errors.price =
                "Price can have maximum 2 decimal places.";
        }

        if (!categoryId) {
            errors.categoryId = "Category is required.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    async function handleSubmit(event) {
        event.preventDefault();

        resetMessages();

        if (!validateForm()) {
            return;
        }

        const payload = {
            name: form.name.trim(),
            sku: form.sku.trim(),
            description:
                form.description.trim() || null,
            price: Number(form.price),
            categoryId: Number(form.categoryId)
        };

        try {
            setSaving(true);

            if (editingProduct) {
                await put(
                    `/products/${editingProduct.id}`,
                    payload
                );

                setSuccess(
                    "Product updated successfully."
                );
            } else {
                await post("/products", payload);

                setSuccess(
                    "Product added successfully."
                );
            }

            setModalOpen(false);
            setEditingProduct(null);
            setFormErrors({});

            await Promise.all([
                loadProducts(),
                loadInventories()
            ]);
        } catch (err) {
            setError(
                err?.message || "Unable to save product."
            );
        } finally {
            setSaving(false);
        }
    }

    // =========================================================
    // DELETE
    // =========================================================

    async function handleDelete(product) {
        const confirmed = window.confirm(
            `Delete product "${product.name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            resetMessages();

            setDeletingId(product.id);

            await del(`/products/${product.id}`);

            setSuccess(
                "Product deleted successfully."
            );

            await Promise.all([
                loadProducts(),
                loadInventories()
            ]);
        } catch (err) {
            setError(
                err?.message || "Unable to delete product."
            );
        } finally {
            setDeletingId(null);
        }
    }

    // =========================================================
    // INVENTORY MAP
    // =========================================================

    const inventoryMap = useMemo(() => {
        const map = new Map();

        inventories.forEach((inventory) => {
            const productId =
                inventory?.product?.id ??
                inventory?.productId ??
                inventory?.productID;

            if (productId !== undefined && productId !== null) {
                map.set(String(productId), inventory);
            }
        });

        return map;
    }, [inventories]);

    function getInventory(productId) {
        return inventoryMap.get(String(productId));
    }

    function getStock(productId) {
        const inventory = getInventory(productId);

        if (!inventory) {
            return null;
        }

        const stock =
            inventory.currentStock ??
            inventory.stock ??
            inventory.quantity ??
            0;

        return Number(stock);
    }

    function getReorderLevel(productId) {
        const inventory = getInventory(productId);

        if (!inventory) {
            return 5;
        }

        return Number(
            inventory.reorderLevel ??
            inventory.reorderPoint ??
            5
        );
    }

    function getStockStatus(productId) {
        const stock = getStock(productId);

        if (stock === null) {
            return {
                label: "Unknown",
                className: "badge-neutral"
            };
        }

        const reorderLevel =
            getReorderLevel(productId);

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

    // =========================================================
    // CATEGORY HELPER
    // =========================================================

    function getCategoryName(product) {
        if (product.categoryName) {
            return product.categoryName;
        }

        const category = categories.find(
            (item) =>
                String(item.id) ===
                String(product.categoryId)
        );

        return category?.name || "Uncategorized";
    }

    // =========================================================
    // SEARCH
    // =========================================================

    const filteredProducts = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) {
            return products;
        }

        return products.filter((product) => {
            const text = [
                product.name,
                product.sku,
                product.description,
                product.categoryName,
                getCategoryName(product)
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        });
    }, [products, search, categories]);

    // =========================================================
    // STATS
    // =========================================================

    const productStats = useMemo(() => {
        const total = products.length;

        if (inventoryLoading) {
            return {
                total,
                inStock: null,
                lowStock: null,
                outOfStock: null
            };
        }

        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        products.forEach((product) => {
            const stock =
                getStock(product.id);

            if (stock === null) {
                return;
            }

            const reorderLevel =
                getReorderLevel(product.id);

            if (stock <= 0) {
                outOfStock += 1;
            } else if (stock <= reorderLevel) {
                lowStock += 1;
            } else {
                inStock += 1;
            }
        });

        return {
            total,
            inStock,
            lowStock,
            outOfStock
        };
    }, [products, inventories, inventoryLoading]);

    function formatPrice(price) {
        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 2
            }
        ).format(Number(price || 0));
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="management-page products-page">

            {/* =====================================================
                HEADER
                ===================================================== */}

            <div className="management-header">

                <div className="management-header-content">
                    <span className="management-kicker">
                        Product catalog
                    </span>

                    <h1>Products</h1>

                    <p>
                        Manage products, pricing, categories,
                        and stock visibility.
                    </p>
                </div>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={openCreateModal}
                    >
                        <Plus size={17} />
                        Add Product
                    </button>
                )}
            </div>

            {/* =====================================================
                MESSAGES
                ===================================================== */}

            {error && (
                <div className="error-message management-page-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="product-success-message">
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                        aria-label="Dismiss success message"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* =====================================================
                STATS
                ===================================================== */}

            <div className="management-stat-grid">

                <div className="management-stat-card">
                    <div className="management-stat-icon product-stat-blue">
                        <Package size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Total Products</span>

                        <strong>
                            {loading
                                ? "—"
                                : productStats.total}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon product-stat-green">
                        <Package size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>In Stock</span>

                        <strong>
                            {inventoryLoading
                                ? "—"
                                : productStats.inStock}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon product-stat-yellow">
                        <Tag size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Low Stock</span>

                        <strong>
                            {inventoryLoading
                                ? "—"
                                : productStats.lowStock}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon product-stat-red">
                        <Package size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Out of Stock</span>

                        <strong>
                            {inventoryLoading
                                ? "—"
                                : productStats.outOfStock}
                        </strong>
                    </div>
                </div>

            </div>

            {/* =====================================================
                TOOLBAR
                ===================================================== */}

            <div className="management-toolbar">

                <div className="management-search">
                    <Search size={17} />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search products..."
                        aria-label="Search products"
                    />

                    {search && (
                        <button
                            type="button"
                            className="management-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear product search"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="toolbar-summary">
                    {loading
                        ? "Loading..."
                        : `${filteredProducts.length} ${
                            filteredProducts.length === 1
                                ? "product"
                                : "products"
                        }`}
                </div>
            </div>

            {/* =====================================================
                PRODUCT TABLE
                ===================================================== */}

            <div className="management-card">

                {loading ? (
                    <div className="management-loading">
                        <div className="loading-spinner" />

                        <strong>
                            Loading products...
                        </strong>

                        <span>
                            Fetching product catalog.
                        </span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="management-empty">

                        <div className="empty-icon">
                            <Package size={22} />
                        </div>

                        <h3>
                            {search
                                ? "No products found"
                                : "No products yet"}
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search criteria."
                                : "Add your first product to build your catalog."}
                        </p>

                        {!search && isAdmin && (
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={openCreateModal}
                            >
                                <Plus size={16} />
                                Add Product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="management-table-wrapper">

                        <table className="management-table">

                            <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>

                            {filteredProducts.map(
                                (product) => {
                                    const stock =
                                        getStock(
                                            product.id
                                        );

                                    const stockStatus =
                                        getStockStatus(
                                            product.id
                                        );

                                    return (
                                        <tr
                                            key={product.id}
                                        >

                                            <td>
                                                <div className="product-cell">

                                                    <div className="product-icon">
                                                        <Package size={17} />
                                                    </div>

                                                    <div className="product-cell-info">

                                                        <strong>
                                                            {product.name}
                                                        </strong>

                                                        <span>
                                                                {product.description ||
                                                                    "No description"}
                                                            </span>

                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                    <span className="table-id">
                                                        {product.sku}
                                                    </span>
                                            </td>

                                            <td>
                                                    <span className="soft-tag">
                                                        {getCategoryName(
                                                            product
                                                        )}
                                                    </span>
                                            </td>

                                            <td>
                                                <strong className="product-price">
                                                    {formatPrice(
                                                        product.price
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="product-stock-cell">

                                                    <strong>
                                                        {inventoryLoading
                                                            ? "—"
                                                            : stock ?? "—"}
                                                    </strong>

                                                    {!inventoryLoading && (
                                                        <span
                                                            className={`badge ${stockStatus.className}`}
                                                        >
                                                                {
                                                                    stockStatus.label
                                                                }
                                                            </span>
                                                    )}

                                                </div>
                                            </td>

                                            <td>
                                                <div className="product-action-group">

                                                    <button
                                                        className="table-action-button product-edit-button"
                                                        type="button"
                                                        title={`Edit ${product.name}`}
                                                        aria-label={`Edit ${product.name}`}
                                                        onClick={() =>
                                                            openEditModal(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>

                                                    {isAdmin && (
                                                        <button
                                                            className="table-action-button product-delete-button"
                                                            type="button"
                                                            title={`Delete ${product.name}`}
                                                            aria-label={`Delete ${product.name}`}
                                                            disabled={
                                                                deletingId ===
                                                                product.id
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            {deletingId ===
                                                            product.id ? (
                                                                <span className="mini-spinner" />
                                                            ) : (
                                                                <Trash2 size={16} />
                                                            )}
                                                        </button>
                                                    )}

                                                </div>
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

            {/* =====================================================
                CREATE / EDIT MODAL
                ===================================================== */}

            {modalOpen && (
                <div
                    className="product-modal-backdrop"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="product-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-modal-title"
                    >

                        <div className="product-modal-header">

                            <div>
                                <span className="product-modal-kicker">
                                    Product catalog
                                </span>

                                <h2 id="product-modal-title">
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                                <p>
                                    {editingProduct
                                        ? "Update the product information."
                                        : "Create a new product in your catalog."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="product-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close product form"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            className="product-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="product-form-grid">

                                {/* NAME */}

                                <div className="product-form-field">

                                    <label htmlFor="product-name">
                                        Product Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="product-name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter product name"
                                        maxLength={150}
                                        autoFocus
                                    />

                                    {formErrors.name && (
                                        <small className="product-field-error">
                                            {formErrors.name}
                                        </small>
                                    )}

                                </div>

                                {/* SKU */}

                                <div className="product-form-field">

                                    <label htmlFor="product-sku">
                                        SKU
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="product-sku"
                                        name="sku"
                                        type="text"
                                        value={form.sku}
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="e.g. PROD-001"
                                        maxLength={50}
                                    />

                                    {formErrors.sku && (
                                        <small className="product-field-error">
                                            {formErrors.sku}
                                        </small>
                                    )}

                                </div>

                                {/* PRICE */}

                                <div className="product-form-field">

                                    <label htmlFor="product-price">
                                        Price
                                        <span>*</span>
                                    </label>

                                    <div className="product-price-input">
                                        <span>₹</span>

                                        <input
                                            id="product-price"
                                            name="price"
                                            type="text"
                                            inputMode="decimal"
                                            value={
                                                form.price
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {formErrors.price && (
                                        <small className="product-field-error">
                                            {formErrors.price}
                                        </small>
                                    )}

                                </div>

                                {/* CATEGORY */}

                                <div className="product-form-field">

                                    <label htmlFor="product-category">
                                        Category
                                        <span>*</span>
                                    </label>

                                    <select
                                        id="product-category"
                                        name="categoryId"
                                        value={
                                            form.categoryId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        disabled={
                                            categoriesLoading
                                        }
                                    >
                                        <option value="">
                                            {categoriesLoading
                                                ? "Loading categories..."
                                                : "Select category"}
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                    {formErrors.categoryId && (
                                        <small className="product-field-error">
                                            {
                                                formErrors.categoryId
                                            }
                                        </small>
                                    )}

                                    {!categoriesLoading &&
                                        categories.length ===
                                        0 && (
                                            <small className="product-field-help">
                                                Create a category
                                                before adding a
                                                product.
                                            </small>
                                        )}

                                </div>

                                {/* DESCRIPTION */}

                                <div className="product-form-field product-form-full">

                                    <label htmlFor="product-description">
                                        Description
                                    </label>

                                    <textarea
                                        id="product-description"
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Describe the product..."
                                        maxLength={1000}
                                        rows={4}
                                    />

                                    <div className="product-character-count">
                                        {
                                            form.description
                                                .length
                                        }
                                        /1000
                                    </div>

                                    {formErrors.description && (
                                        <small className="product-field-error">
                                            {
                                                formErrors.description
                                            }
                                        </small>
                                    )}

                                </div>

                            </div>

                            {/* FORM ACTIONS */}

                            <div className="product-form-actions">

                                <button
                                    type="button"
                                    className="btn product-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        saving ||
                                        categoriesLoading ||
                                        categories.length === 0
                                    }
                                >
                                    {saving ? (
                                        <>
                                            <span className="mini-spinner light" />

                                            {editingProduct
                                                ? "Updating..."
                                                : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {editingProduct ? (
                                                <Edit3 size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}

                                            {editingProduct
                                                ? "Update Product"
                                                : "Create Product"}
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

export default Products;