import {
    Edit3,
    FolderTree,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api/api";
import { getUser } from "../utils/auth";

function Categories() {
    const currentUser = getUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [form, setForm] = useState({
        name: "",
        description: ""
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadCategories();
    }, []);

    async function loadCategories() {
        try {
            setLoading(true);
            setError("");

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
            setLoading(false);
        }
    }

    function resetMessages() {
        setError("");
        setSuccess("");
    }

    function openCreateModal() {
        resetMessages();

        setEditingCategory(null);

        setForm({
            name: "",
            description: ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function openEditModal(category) {
        resetMessages();

        setEditingCategory(category);

        setForm({
            name: category.name || "",
            description: category.description || ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingCategory(null);
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

    function validateForm() {
        const errors = {};

        const name = form.name.trim();
        const description = form.description.trim();

        if (!name) {
            errors.name = "Category name is required.";
        } else if (name.length > 100) {
            errors.name =
                "Category name cannot exceed 100 characters.";
        }

        if (description.length > 500) {
            errors.description =
                "Description cannot exceed 500 characters.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        resetMessages();

        if (!validateForm()) {
            return;
        }

        const payload = {
            name: form.name.trim(),
            description:
                form.description.trim() || null
        };

        try {
            setSaving(true);

            if (editingCategory) {
                await put(
                    `/categories/${editingCategory.id}`,
                    payload
                );

                setSuccess(
                    "Category updated successfully."
                );
            } else {
                await post(
                    "/categories",
                    payload
                );

                setSuccess(
                    "Category added successfully."
                );
            }

            setModalOpen(false);
            setEditingCategory(null);
            setFormErrors({});

            await loadCategories();
        } catch (err) {
            setError(
                err?.message || "Unable to save category."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(category) {
        const confirmed = window.confirm(
            `Delete category "${category.name}"?\n\nCategories used by products may not be deletable.`
        );

        if (!confirmed) {
            return;
        }

        try {
            resetMessages();
            setDeletingId(category.id);

            await del(
                `/categories/${category.id}`
            );

            setSuccess(
                "Category deleted successfully."
            );

            await loadCategories();
        } catch (err) {
            setError(
                err?.message ||
                "Unable to delete category. It may be in use by products."
            );
        } finally {
            setDeletingId(null);
        }
    }

    const filteredCategories = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) {
            return categories;
        }

        return categories.filter((category) => {
            const text = [
                category.name,
                category.description
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        });
    }, [categories, search]);

    const categoryStats = useMemo(() => {
        const total = categories.length;

        const withDescription =
            categories.filter(
                (category) =>
                    category.description &&
                    category.description.trim()
            ).length;

        return {
            total,
            withDescription,
            needsDescription:
                total - withDescription
        };
    }, [categories]);

    return (
        <div className="management-page categories-page">

            {/* =====================================================
                HEADER
                ===================================================== */}

            <div className="management-header">

                <div className="management-header-content">

                    <span className="management-kicker">
                        Catalog organization
                    </span>

                    <h1>Categories</h1>

                    <p>
                        Organize products into clear,
                        manageable categories.
                    </p>

                </div>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={openCreateModal}
                    >
                        <Plus size={17} />
                        Add Category
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
                <div className="category-success-message">
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

            {/* =====================================================
                STATS
                ===================================================== */}

            <div className="management-stat-grid">

                <div className="management-stat-card">
                    <div className="management-stat-icon category-stat-blue">
                        <FolderTree size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Total Categories</span>

                        <strong>
                            {loading
                                ? "—"
                                : categoryStats.total}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon category-stat-green">
                        <FolderTree size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>With Description</span>

                        <strong>
                            {loading
                                ? "—"
                                : categoryStats.withDescription}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon category-stat-yellow">
                        <FolderTree size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Needs Description</span>

                        <strong>
                            {loading
                                ? "—"
                                : categoryStats.needsDescription}
                        </strong>
                    </div>
                </div>

            </div>

            {/* =====================================================
                SEARCH
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
                        placeholder="Search categories..."
                        aria-label="Search categories"
                    />

                    {search && (
                        <button
                            type="button"
                            className="management-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear category search"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                <div className="toolbar-summary">
                    {loading
                        ? "Loading..."
                        : `${filteredCategories.length} ${
                            filteredCategories.length === 1
                                ? "category"
                                : "categories"
                        }`}
                </div>

            </div>

            {/* =====================================================
                CATEGORY GRID
                ===================================================== */}

            <div className="category-crud-grid">

                {loading ? (
                    <div className="management-card category-full-state">

                        <div className="management-loading">
                            <div className="loading-spinner" />

                            <strong>
                                Loading categories...
                            </strong>

                            <span>
                                Fetching category information.
                            </span>
                        </div>

                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="management-card category-full-state">

                        <div className="management-empty">

                            <div className="empty-icon">
                                <FolderTree size={22} />
                            </div>

                            <h3>
                                {search
                                    ? "No categories found"
                                    : "No categories yet"}
                            </h3>

                            <p>
                                {search
                                    ? "Try changing your search criteria."
                                    : "Create your first category to organize products."}
                            </p>

                            {!search && isAdmin && (
                                <button
                                    className="btn btn-primary"
                                    type="button"
                                    onClick={openCreateModal}
                                >
                                    <Plus size={16} />
                                    Add Category
                                </button>
                            )}

                        </div>

                    </div>
                ) : (
                    filteredCategories.map(
                        (category) => (
                            <div
                                className="category-crud-card"
                                key={category.id}
                            >

                                <div className="category-crud-card-top">

                                    <div className="category-crud-icon">
                                        <FolderTree
                                            size={19}
                                        />
                                    </div>

                                    {isAdmin && (
                                        <div className="category-crud-actions">

                                            <button
                                                type="button"
                                                className="table-action-button"
                                                onClick={() =>
                                                    openEditModal(
                                                        category
                                                    )
                                                }
                                                title={`Edit ${category.name}`}
                                                aria-label={`Edit ${category.name}`}
                                            >
                                                <Edit3
                                                    size={16}
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                className="table-action-button category-delete-button"
                                                disabled={
                                                    deletingId ===
                                                    category.id
                                                }
                                                onClick={() =>
                                                    handleDelete(
                                                        category
                                                    )
                                                }
                                                title={`Delete ${category.name}`}
                                                aria-label={`Delete ${category.name}`}
                                            >
                                                {deletingId ===
                                                category.id ? (
                                                    <span className="mini-spinner" />
                                                ) : (
                                                    <Trash2
                                                        size={16}
                                                    />
                                                )}
                                            </button>

                                        </div>
                                    )}

                                </div>

                                <div className="category-crud-content">

                                    <h3>
                                        {category.name}
                                    </h3>

                                    <p>
                                        {category.description ||
                                            "No description provided."}
                                    </p>

                                </div>

                                <div className="category-crud-footer">
                                    <span>
                                        Category ID
                                    </span>

                                    <strong>
                                        #{category.id}
                                    </strong>
                                </div>

                            </div>
                        )
                    )
                )}

            </div>

            {/* =====================================================
                CATEGORY MODAL
                ===================================================== */}

            {modalOpen && (
                <div
                    className="category-modal-backdrop"
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
                        className="category-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="category-modal-title"
                    >

                        <div className="category-modal-header">

                            <div>
                                <span className="category-modal-kicker">
                                    Catalog organization
                                </span>

                                <h2 id="category-modal-title">
                                    {editingCategory
                                        ? "Edit Category"
                                        : "Add Category"}
                                </h2>

                                <p>
                                    {editingCategory
                                        ? "Update the category information."
                                        : "Create a new product category."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="category-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close category form"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            className="category-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="category-form-field">

                                <label htmlFor="category-name">
                                    Category Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="category-name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="e.g. Electronics"
                                    maxLength={100}
                                    autoFocus
                                />

                                {formErrors.name && (
                                    <small className="category-field-error">
                                        {formErrors.name}
                                    </small>
                                )}

                            </div>

                            <div className="category-form-field">

                                <label htmlFor="category-description">
                                    Description
                                </label>

                                <textarea
                                    id="category-description"
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    placeholder="Describe what products belong in this category..."
                                    maxLength={500}
                                    rows={5}
                                />

                                <div className="category-character-count">
                                    {
                                        form.description
                                            .length
                                    }
                                    /500
                                </div>

                                {formErrors.description && (
                                    <small className="category-field-error">
                                        {
                                            formErrors.description
                                        }
                                    </small>
                                )}

                            </div>

                            <div className="category-form-actions">

                                <button
                                    type="button"
                                    className="btn category-cancel-button"
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="mini-spinner light" />
                                            {editingCategory
                                                ? "Updating..."
                                                : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {editingCategory ? (
                                                <Edit3
                                                    size={16}
                                                />
                                            ) : (
                                                <Plus
                                                    size={16}
                                                />
                                            )}

                                            {editingCategory
                                                ? "Update Category"
                                                : "Create Category"}
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

export default Categories;