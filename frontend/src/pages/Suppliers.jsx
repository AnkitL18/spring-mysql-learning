import {
    Building2,
    Edit3,
    Mail,
    Phone,
    Plus,
    Search,
    Trash2,
    UserRound,
    X
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { del, get, post, put } from "../api/api";
import { getUser } from "../utils/auth";

function Suppliers() {
    const currentUser = getUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: ""
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadSuppliers();
    }, []);

    async function loadSuppliers() {
        try {
            setLoading(true);
            setError("");

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

        setEditingSupplier(null);

        setForm({
            name: "",
            email: "",
            phone: "",
            company: "",
            address: ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function openEditModal(supplier) {
        resetMessages();

        setEditingSupplier(supplier);

        setForm({
            name: supplier.name || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            company: supplier.company || "",
            address: supplier.address || ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) {
            return;
        }

        setModalOpen(false);
        setEditingSupplier(null);
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
        const email = form.email.trim();
        const phone = form.phone.trim();
        const company = form.company.trim();
        const address = form.address.trim();

        if (!name) {
            errors.name = "Supplier name is required.";
        } else if (name.length > 150) {
            errors.name =
                "Supplier name cannot exceed 150 characters.";
        }

        if (!email) {
            errors.email = "Email is required.";
        } else if (email.length > 150) {
            errors.email =
                "Email cannot exceed 150 characters.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email
            )
        ) {
            errors.email =
                "Enter a valid email address.";
        }

        if (!phone) {
            errors.phone = "Phone is required.";
        } else if (phone.length > 20) {
            errors.phone =
                "Phone cannot exceed 20 characters.";
        }

        if (company.length > 150) {
            errors.company =
                "Company cannot exceed 150 characters.";
        }

        if (address.length > 500) {
            errors.address =
                "Address cannot exceed 500 characters.";
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
            email: form.email.trim(),
            phone: form.phone.trim(),
            company:
                form.company.trim() || null,
            address:
                form.address.trim() || null
        };

        try {
            setSaving(true);

            if (editingSupplier) {
                await put(
                    `/suppliers/${editingSupplier.id}`,
                    payload
                );

                setSuccess(
                    "Supplier updated successfully."
                );
            } else {
                await post(
                    "/suppliers",
                    payload
                );

                setSuccess(
                    "Supplier added successfully."
                );
            }

            setModalOpen(false);
            setEditingSupplier(null);
            setFormErrors({});

            await loadSuppliers();
        } catch (err) {
            setError(
                err?.message || "Unable to save supplier."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(supplier) {
        const confirmed = window.confirm(
            `Delete supplier "${supplier.name}"?\n\nSuppliers used by existing purchases may not be deletable.`
        );

        if (!confirmed) {
            return;
        }

        try {
            resetMessages();
            setDeletingId(supplier.id);

            await del(
                `/suppliers/${supplier.id}`
            );

            setSuccess(
                "Supplier deleted successfully."
            );

            await loadSuppliers();
        } catch (err) {
            setError(
                err?.message ||
                "Unable to delete supplier. It may be in use by purchases."
            );
        } finally {
            setDeletingId(null);
        }
    }

    const filteredSuppliers = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) {
            return suppliers;
        }

        return suppliers.filter((supplier) => {
            const text = [
                supplier.name,
                supplier.email,
                supplier.phone,
                supplier.company,
                supplier.address
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        });
    }, [suppliers, search]);

    const supplierStats = useMemo(() => {
        const total = suppliers.length;

        const withEmail =
            suppliers.filter(
                (supplier) =>
                    supplier.email
            ).length;

        const withPhone =
            suppliers.filter(
                (supplier) =>
                    supplier.phone
            ).length;

        return {
            total,
            withEmail,
            withPhone
        };
    }, [suppliers]);

    function supplierInitials(supplier) {
        const name =
            supplier.name ||
            "Supplier";

        const parts =
            name.split(" ")
                .filter(Boolean);

        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`
                .toUpperCase();
        }

        return name
            .charAt(0)
            .toUpperCase();
    }

    return (
        <div className="management-page suppliers-page">

            {/* =====================================================
                HEADER
                ===================================================== */}

            <div className="management-header">

                <div className="management-header-content">

                    <span className="management-kicker">
                        Procurement network
                    </span>

                    <h1>Suppliers</h1>

                    <p>
                        Manage supplier contacts and
                        procurement relationships.
                    </p>

                </div>

                {isAdmin && (
                    <button
                        className="btn btn-primary"
                        type="button"
                        onClick={openCreateModal}
                    >
                        <Plus size={17} />
                        Add Supplier
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
                <div className="supplier-success-message">

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

                    <div className="management-stat-icon supplier-stat-blue">
                        <Building2 size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Total Suppliers</span>

                        <strong>
                            {loading
                                ? "—"
                                : supplierStats.total}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon supplier-stat-purple">
                        <Mail size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>With Email</span>

                        <strong>
                            {loading
                                ? "—"
                                : supplierStats.withEmail}
                        </strong>
                    </div>

                </div>

                <div className="management-stat-card">

                    <div className="management-stat-icon supplier-stat-green">
                        <Phone size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>With Phone</span>

                        <strong>
                            {loading
                                ? "—"
                                : supplierStats.withPhone}
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
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search suppliers..."
                        aria-label="Search suppliers"
                    />

                    {search && (
                        <button
                            type="button"
                            className="management-search-clear"
                            onClick={() =>
                                setSearch("")
                            }
                            aria-label="Clear supplier search"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

                <div className="toolbar-summary">
                    {loading
                        ? "Loading..."
                        : `${filteredSuppliers.length} ${
                            filteredSuppliers.length === 1
                                ? "supplier"
                                : "suppliers"
                        }`}
                </div>

            </div>

            {/* =====================================================
                SUPPLIER TABLE
                ===================================================== */}

            <div className="management-card">

                {loading ? (
                    <div className="management-loading">

                        <div className="loading-spinner" />

                        <strong>
                            Loading suppliers...
                        </strong>

                        <span>
                            Fetching supplier information.
                        </span>

                    </div>
                ) : filteredSuppliers.length === 0 ? (
                    <div className="management-empty">

                        <div className="empty-icon">
                            <Building2 size={22} />
                        </div>

                        <h3>
                            {search
                                ? "No suppliers found"
                                : "No suppliers yet"}
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search criteria."
                                : "Add your first supplier to manage procurement relationships."}
                        </p>

                        {!search && isAdmin && (
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={openCreateModal}
                            >
                                <Plus size={16} />
                                Add Supplier
                            </button>
                        )}

                    </div>
                ) : (
                    <div className="management-table-wrapper">

                        <table className="management-table">

                            <thead>

                            <tr>
                                <th>Supplier</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Company</th>
                                <th>ID</th>
                                <th>Actions</th>
                            </tr>

                            </thead>

                            <tbody>

                            {filteredSuppliers.map(
                                (supplier) => (
                                    <tr
                                        key={
                                            supplier.id
                                        }
                                    >

                                        <td>

                                            <div className="person-cell">

                                                <div className="person-avatar supplier-avatar">
                                                    {supplierInitials(
                                                        supplier
                                                    )}
                                                </div>

                                                <div className="person-cell-info">

                                                    <strong>
                                                        {
                                                            supplier.name
                                                        }
                                                    </strong>

                                                    <span>
                                                            {
                                                                supplier.company ||
                                                                "Supplier"
                                                            }
                                                        </span>

                                                </div>

                                            </div>

                                        </td>

                                        <td>

                                            <div className="icon-text">

                                                <Mail
                                                    size={
                                                        14
                                                    }
                                                />

                                                <span>
                                                        {
                                                            supplier.email
                                                        }
                                                    </span>

                                            </div>

                                        </td>

                                        <td>

                                            <div className="icon-text">

                                                <Phone
                                                    size={
                                                        14
                                                    }
                                                />

                                                <span>
                                                        {
                                                            supplier.phone
                                                        }
                                                    </span>

                                            </div>

                                        </td>

                                        <td>

                                                <span className="supplier-company-cell">
                                                    {
                                                        supplier.company ||
                                                        "-"
                                                    }
                                                </span>

                                        </td>

                                        <td>

                                                <span className="table-id">
                                                    #
                                                    {
                                                        supplier.id
                                                    }
                                                </span>

                                        </td>

                                        <td>

                                            {isAdmin && (
                                                <div className="supplier-action-group">

                                                    <button
                                                        type="button"
                                                        className="table-action-button supplier-edit-button"
                                                        onClick={() =>
                                                            openEditModal(
                                                                supplier
                                                            )
                                                        }
                                                        title={`Edit ${supplier.name}`}
                                                        aria-label={`Edit ${supplier.name}`}
                                                    >
                                                        <Edit3
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="table-action-button supplier-delete-button"
                                                        disabled={
                                                            deletingId ===
                                                            supplier.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                supplier
                                                            )
                                                        }
                                                        title={`Delete ${supplier.name}`}
                                                        aria-label={`Delete ${supplier.name}`}
                                                    >
                                                        {deletingId ===
                                                        supplier.id ? (
                                                            <span className="mini-spinner" />
                                                        ) : (
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        )}
                                                    </button>

                                                </div>
                                            )}

                                        </td>

                                    </tr>
                                )
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* =====================================================
                SUPPLIER MODAL
                ===================================================== */}

            {modalOpen && (
                <div
                    className="supplier-modal-backdrop"
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
                        className="supplier-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="supplier-modal-title"
                    >

                        <div className="supplier-modal-header">

                            <div>

                                <span className="supplier-modal-kicker">
                                    Procurement network
                                </span>

                                <h2 id="supplier-modal-title">
                                    {editingSupplier
                                        ? "Edit Supplier"
                                        : "Add Supplier"}
                                </h2>

                                <p>
                                    {editingSupplier
                                        ? "Update the supplier's information."
                                        : "Create a new supplier record."}
                                </p>

                            </div>

                            <button
                                type="button"
                                className="supplier-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close supplier form"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            className="supplier-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="supplier-form-grid">

                                {/* NAME */}

                                <div className="supplier-form-field">

                                    <label htmlFor="supplier-name">
                                        Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="supplier-name"
                                        name="name"
                                        type="text"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter supplier name"
                                        maxLength={150}
                                        autoFocus
                                    />

                                    {formErrors.name && (
                                        <small className="supplier-field-error">
                                            {
                                                formErrors.name
                                            }
                                        </small>
                                    )}

                                </div>

                                {/* EMAIL */}

                                <div className="supplier-form-field">

                                    <label htmlFor="supplier-email">
                                        Email
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="supplier-email"
                                        name="email"
                                        type="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="supplier@example.com"
                                        maxLength={150}
                                    />

                                    {formErrors.email && (
                                        <small className="supplier-field-error">
                                            {
                                                formErrors.email
                                            }
                                        </small>
                                    )}

                                </div>

                                {/* PHONE */}

                                <div className="supplier-form-field">

                                    <label htmlFor="supplier-phone">
                                        Phone
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="supplier-phone"
                                        name="phone"
                                        type="text"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter phone number"
                                        maxLength={20}
                                    />

                                    {formErrors.phone && (
                                        <small className="supplier-field-error">
                                            {
                                                formErrors.phone
                                            }
                                        </small>
                                    )}

                                </div>

                                {/* COMPANY */}

                                <div className="supplier-form-field">

                                    <label htmlFor="supplier-company">
                                        Company
                                    </label>

                                    <input
                                        id="supplier-company"
                                        name="company"
                                        type="text"
                                        value={
                                            form.company
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Company name"
                                        maxLength={150}
                                    />

                                    {formErrors.company && (
                                        <small className="supplier-field-error">
                                            {
                                                formErrors.company
                                            }
                                        </small>
                                    )}

                                </div>

                                {/* ADDRESS */}

                                <div className="supplier-form-field supplier-form-full">

                                    <label htmlFor="supplier-address">
                                        Address
                                    </label>

                                    <textarea
                                        id="supplier-address"
                                        name="address"
                                        value={
                                            form.address
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        placeholder="Enter supplier address"
                                        maxLength={500}
                                        rows={4}
                                    />

                                    <div className="supplier-character-count">
                                        {
                                            form.address
                                                .length
                                        }
                                        /500
                                    </div>

                                    {formErrors.address && (
                                        <small className="supplier-field-error">
                                            {
                                                formErrors.address
                                            }
                                        </small>
                                    )}

                                </div>

                            </div>

                            <div className="supplier-form-actions">

                                <button
                                    type="button"
                                    className="btn supplier-cancel-button"
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

                                            {editingSupplier
                                                ? "Updating..."
                                                : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {editingSupplier ? (
                                                <Edit3
                                                    size={
                                                        16
                                                    }
                                                />
                                            ) : (
                                                <Plus
                                                    size={
                                                        16
                                                    }
                                                />
                                            )}

                                            {editingSupplier
                                                ? "Update Supplier"
                                                : "Create Supplier"}
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

export default Suppliers;