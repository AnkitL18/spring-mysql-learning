import {
    Edit3,
    Mail,
    MoreHorizontal,
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

function Customers() {
    const currentUser = getUser();
    const isAdmin = currentUser?.role === "ADMIN";

    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: ""
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        try {
            setLoading(true);
            setError("");

            /*
             * Backend returns a Page<CustomerResponseDTO>.
             * We request a larger page so the UI can display
             * all current customer records in this CRUD screen.
             */
            const response = await get("/customers?page=0&size=100");

            const items = Array.isArray(response)
                ? response
                : response?.content || [];

            setCustomers(items);
        } catch (err) {
            setError(err?.message || "Unable to load customers.");
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

        setEditingCustomer(null);

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

    function openEditModal(customer) {
        resetMessages();

        setEditingCustomer(customer);

        setForm({
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.phone || "",
            company: customer.company || "",
            address: customer.address || ""
        });

        setFormErrors({});
        setModalOpen(true);
    }

    function closeModal() {
        if (saving) return;

        setModalOpen(false);
        setEditingCustomer(null);
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
            errors.name = "Name is required.";
        } else if (name.length > 100) {
            errors.name = "Name cannot exceed 100 characters.";
        }

        if (!email) {
            errors.email = "Email is required.";
        } else if (email.length > 150) {
            errors.email = "Email cannot exceed 150 characters.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Enter a valid email address.";
        }

        if (!phone) {
            errors.phone = "Phone is required.";
        } else if (phone.length > 20) {
            errors.phone = "Phone cannot exceed 20 characters.";
        }

        if (company.length > 150) {
            errors.company = "Company cannot exceed 150 characters.";
        }

        if (address.length > 500) {
            errors.address = "Address cannot exceed 500 characters.";
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
            company: form.company.trim() || null,
            address: form.address.trim() || null
        };

        try {
            setSaving(true);

            if (editingCustomer) {
                await put(`/customers/${editingCustomer.id}`, payload);

                setSuccess("Customer updated successfully.");
            } else {
                await post("/customers", payload);

                setSuccess("Customer added successfully.");
            }

            setModalOpen(false);
            setEditingCustomer(null);
            setFormErrors({});

            await loadCustomers();
        } catch (err) {
            setError(err?.message || "Unable to save customer.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(customer) {
        const confirmed = window.confirm(
            `Delete customer "${customer.name}"?\n\nThis action cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            resetMessages();
            setDeletingId(customer.id);

            await del(`/customers/${customer.id}`);

            setSuccess("Customer deleted successfully.");

            await loadCustomers();
        } catch (err) {
            setError(err?.message || "Unable to delete customer.");
        } finally {
            setDeletingId(null);
        }
    }

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return customers;
        }

        return customers.filter((customer) => {
            const text = [
                customer.name,
                customer.firstName,
                customer.lastName,
                customer.email,
                customer.phone,
                customer.company,
                customer.address
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(query);
        });
    }, [customers, search]);

    const customerStats = useMemo(() => {
        const total = customers.length;

        const withEmail = customers.filter(
            (customer) => customer.email
        ).length;

        const withPhone = customers.filter(
            (customer) => customer.phone
        ).length;

        return {
            total,
            withEmail,
            withPhone
        };
    }, [customers]);

    function customerName(customer) {
        if (customer.name) {
            return customer.name;
        }

        return (
            `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
            "Unnamed Customer"
        );
    }

    function customerInitials(customer) {
        const name = customerName(customer);
        const parts = name.split(" ").filter(Boolean);

        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }

        return name.charAt(0).toUpperCase();
    }

    return (
        <div className="management-page customers-page">

            {/* =====================================================
                PAGE HEADER
                ===================================================== */}

            <div className="management-header">

                <div className="management-header-content">
                    <span className="management-kicker">
                        Relationship management
                    </span>

                    <h1>Customers</h1>

                    <p>
                        Manage your customer information and relationships.
                    </p>
                </div>

                <button
                    className="btn btn-primary customer-add-button"
                    type="button"
                    onClick={openCreateModal}
                >
                    <Plus size={17} />
                    Add Customer
                </button>
            </div>

            {/* =====================================================
                SUCCESS / ERROR
                ===================================================== */}

            {error && (
                <div className="error-message management-page-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="customer-success-message">
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
                    <div className="management-stat-icon customer-stat-blue">
                        <UserRound size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>Total Customers</span>
                        <strong>
                            {loading ? "—" : customerStats.total}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon customer-stat-purple">
                        <Mail size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>With Email</span>
                        <strong>
                            {loading ? "—" : customerStats.withEmail}
                        </strong>
                    </div>
                </div>

                <div className="management-stat-card">
                    <div className="management-stat-icon customer-stat-green">
                        <Phone size={18} />
                    </div>

                    <div className="management-stat-content">
                        <span>With Phone</span>
                        <strong>
                            {loading ? "—" : customerStats.withPhone}
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
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search customers..."
                        aria-label="Search customers"
                    />

                    {search && (
                        <button
                            type="button"
                            className="management-search-clear"
                            onClick={() => setSearch("")}
                            aria-label="Clear customer search"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="toolbar-summary">
                    {loading
                        ? "Loading..."
                        : `${filteredCustomers.length} ${
                            filteredCustomers.length === 1
                                ? "customer"
                                : "customers"
                        }`}
                </div>
            </div>

            {/* =====================================================
                CUSTOMER TABLE
                ===================================================== */}

            <div className="management-card">

                {loading ? (
                    <div className="management-loading customers-loading">
                        <div className="loading-spinner" />

                        <strong>
                            Loading customers...
                        </strong>

                        <span>
                            Fetching customer information.
                        </span>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="management-empty">

                        <div className="empty-icon">
                            <UserRound size={22} />
                        </div>

                        <h3>
                            {search
                                ? "No customers found"
                                : "No customers yet"}
                        </h3>

                        <p>
                            {search
                                ? "Try changing your search criteria."
                                : "Add your first customer to get started."}
                        </p>

                        {!search && (
                            <button
                                className="btn btn-primary"
                                type="button"
                                onClick={openCreateModal}
                            >
                                <Plus size={16} />
                                Add Customer
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="management-table-wrapper">

                        <table className="management-table">

                            <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Company</th>
                                <th>ID</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>

                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id}>

                                    <td>
                                        <div className="person-cell">

                                            <div className="person-avatar customer-avatar">
                                                {customerInitials(customer)}
                                            </div>

                                            <div className="person-cell-info">

                                                <strong>
                                                    {customerName(customer)}
                                                </strong>

                                                <span>
                                                        {customer.address ||
                                                            "Customer"}
                                                    </span>

                                            </div>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="icon-text">
                                            <Mail size={14} />

                                            <span>
                                                    {customer.email || "-"}
                                                </span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="icon-text">
                                            <Phone size={14} />

                                            <span>
                                                    {customer.phone || "-"}
                                                </span>
                                        </div>
                                    </td>

                                    <td>
                                            <span className="customer-company-cell">
                                                {customer.company || "-"}
                                            </span>
                                    </td>

                                    <td>
                                            <span className="table-id">
                                                #{customer.id}
                                            </span>
                                    </td>

                                    <td>
                                        <div className="customer-action-group">

                                            <button
                                                className="table-action-button customer-edit-button"
                                                type="button"
                                                title={`Edit ${customerName(customer)}`}
                                                aria-label={`Edit ${customerName(customer)}`}
                                                onClick={() =>
                                                    openEditModal(customer)
                                                }
                                            >
                                                <Edit3 size={16} />
                                            </button>

                                            {isAdmin ? (
                                                <button
                                                    className="table-action-button customer-delete-button"
                                                    type="button"
                                                    title={`Delete ${customerName(customer)}`}
                                                    aria-label={`Delete ${customerName(customer)}`}
                                                    disabled={
                                                        deletingId ===
                                                        customer.id
                                                    }
                                                    onClick={() =>
                                                        handleDelete(customer)
                                                    }
                                                >
                                                    {deletingId ===
                                                    customer.id ? (
                                                        <span className="mini-spinner" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    className="table-action-button"
                                                    type="button"
                                                    title="More actions"
                                                    aria-label="More actions"
                                                >
                                                    <MoreHorizontal size={17} />
                                                </button>
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}

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
                    className="customer-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="customer-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="customer-modal-title"
                    >

                        <div className="customer-modal-header">

                            <div>
                                <span className="customer-modal-kicker">
                                    Customer management
                                </span>

                                <h2 id="customer-modal-title">
                                    {editingCustomer
                                        ? "Edit Customer"
                                        : "Add Customer"}
                                </h2>

                                <p>
                                    {editingCustomer
                                        ? "Update the customer's information."
                                        : "Create a new customer record."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="customer-modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close customer form"
                            >
                                <X size={19} />
                            </button>

                        </div>

                        <form
                            className="customer-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="customer-form-grid">

                                {/* NAME */}

                                <div className="customer-form-field">

                                    <label htmlFor="customer-name">
                                        Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="customer-name"
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter customer name"
                                        maxLength={100}
                                        autoFocus
                                    />

                                    {formErrors.name && (
                                        <small className="customer-field-error">
                                            {formErrors.name}
                                        </small>
                                    )}

                                </div>

                                {/* EMAIL */}

                                <div className="customer-form-field">

                                    <label htmlFor="customer-email">
                                        Email
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="customer-email"
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleInputChange}
                                        placeholder="customer@example.com"
                                        maxLength={150}
                                    />

                                    {formErrors.email && (
                                        <small className="customer-field-error">
                                            {formErrors.email}
                                        </small>
                                    )}

                                </div>

                                {/* PHONE */}

                                <div className="customer-form-field">

                                    <label htmlFor="customer-phone">
                                        Phone
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="customer-phone"
                                        name="phone"
                                        type="text"
                                        value={form.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                        maxLength={20}
                                    />

                                    {formErrors.phone && (
                                        <small className="customer-field-error">
                                            {formErrors.phone}
                                        </small>
                                    )}

                                </div>

                                {/* COMPANY */}

                                <div className="customer-form-field">

                                    <label htmlFor="customer-company">
                                        Company
                                    </label>

                                    <input
                                        id="customer-company"
                                        name="company"
                                        type="text"
                                        value={form.company}
                                        onChange={handleInputChange}
                                        placeholder="Company name"
                                        maxLength={150}
                                    />

                                    {formErrors.company && (
                                        <small className="customer-field-error">
                                            {formErrors.company}
                                        </small>
                                    )}

                                </div>

                                {/* ADDRESS */}

                                <div className="customer-form-field customer-form-full">

                                    <label htmlFor="customer-address">
                                        Address
                                    </label>

                                    <textarea
                                        id="customer-address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleInputChange}
                                        placeholder="Enter customer address"
                                        maxLength={500}
                                        rows={4}
                                    />

                                    <div className="customer-character-count">
                                        {form.address.length}/500
                                    </div>

                                    {formErrors.address && (
                                        <small className="customer-field-error">
                                            {formErrors.address}
                                        </small>
                                    )}

                                </div>

                            </div>

                            {/* FORM ACTIONS */}

                            <div className="customer-form-actions">

                                <button
                                    type="button"
                                    className="btn customer-cancel-button"
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

                                            {editingCustomer
                                                ? "Updating..."
                                                : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            {editingCustomer ? (
                                                <Edit3 size={16} />
                                            ) : (
                                                <Plus size={16} />
                                            )}

                                            {editingCustomer
                                                ? "Update Customer"
                                                : "Create Customer"}
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

export default Customers;