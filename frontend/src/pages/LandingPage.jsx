import {
    ArrowRight,
    BarChart3,
    Boxes,
    Bot,
    Check,
    ClipboardList,
    Package,
    ShieldCheck,
    Sparkles,
    Users,
    Zap
} from "lucide-react";

import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="landing-page">

            {/* =========================
                NAVBAR
               ========================= */}

            <header className="landing-navbar">

                <Link to="/" className="landing-logo">
                    <div className="landing-logo-mark">
                        <Boxes size={21} strokeWidth={2.5} />
                    </div>

                    <div>
                        <strong>BusinessOps</strong>
                        <span>Smart Business Management</span>
                    </div>
                </Link>

                <nav className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it works</a>
                    <a href="#ai">AI Assistant</a>
                </nav>

                <div className="landing-nav-actions">
                    <Link
                        to="/login"
                        className="landing-login-link"
                    >
                        Login
                    </Link>

                    <Link
                        to="/login"
                        className="btn btn-primary"
                    >
                        Get Started
                        <ArrowRight size={17} />
                    </Link>
                </div>

            </header>


            {/* =========================
                HERO
               ========================= */}

            <section className="landing-hero">

                <div className="landing-hero-glow landing-glow-one" />
                <div className="landing-hero-glow landing-glow-two" />

                <div className="landing-hero-content">

                    <div className="landing-eyebrow">
                        <Sparkles size={15} />
                        Smarter operations. Better decisions.
                    </div>

                    <h1>
                        Run your business
                        <span> with clarity.</span>
                    </h1>

                    <p>
                        Manage customers, products, inventory, purchases
                        and orders from one intelligent business operations
                        platform.
                    </p>

                    <div className="landing-hero-actions">

                        <Link
                            to="/login"
                            className="landing-primary-button"
                        >
                            Start Managing
                            <ArrowRight size={18} />
                        </Link>

                        <a
                            href="#features"
                            className="landing-secondary-button"
                        >
                            Explore platform
                        </a>

                    </div>

                    <div className="landing-trust-row">

                        <div>
                            <Check size={16} />
                            Real-time business data
                        </div>

                        <div>
                            <Check size={16} />
                            Secure JWT authentication
                        </div>

                        <div>
                            <Check size={16} />
                            AI-powered insights
                        </div>

                    </div>

                </div>


                {/* Dashboard preview */}

                <div className="landing-dashboard-preview">

                    <div className="preview-sidebar">

                        <div className="preview-brand">
                            <div className="preview-brand-icon">
                                <Boxes size={17} />
                            </div>

                            <strong>BusinessOps</strong>
                        </div>

                        <div className="preview-nav active">
                            <BarChart3 size={15} />
                            Dashboard
                        </div>

                        <div className="preview-nav">
                            <Users size={15} />
                            Customers
                        </div>

                        <div className="preview-nav">
                            <Package size={15} />
                            Products
                        </div>

                        <div className="preview-nav">
                            <ClipboardList size={15} />
                            Orders
                        </div>

                        <div className="preview-nav">
                            <Boxes size={15} />
                            Inventory
                        </div>

                    </div>


                    <div className="preview-main">

                        <div className="preview-topbar">
                            <div className="preview-search">
                                Search anything...
                            </div>

                            <div className="preview-avatar">
                                JD
                            </div>
                        </div>

                        <div className="preview-heading">
                            <div>
                                <span>Good morning, John</span>
                                <h3>Business Overview</h3>
                            </div>

                            <div className="preview-date">
                                Today
                            </div>
                        </div>

                        <div className="preview-stat-grid">

                            <div className="preview-stat">
                                <span>Customers</span>
                                <strong>1,248</strong>
                                <small>+12.4%</small>
                            </div>

                            <div className="preview-stat">
                                <span>Products</span>
                                <strong>684</strong>
                                <small>+8.2%</small>
                            </div>

                            <div className="preview-stat">
                                <span>Orders</span>
                                <strong>326</strong>
                                <small>+15.8%</small>
                            </div>

                        </div>

                        <div className="preview-chart-card">

                            <div className="preview-card-heading">
                                <div>
                                    <span>Sales Overview</span>
                                    <small>Last 30 days</small>
                                </div>

                                <BarChart3 size={18} />
                            </div>

                            <svg
                                className="preview-chart"
                                viewBox="0 0 600 180"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M0 150 C50 138, 70 146, 105 120 S160 132, 195 105 S250 120, 280 90 S330 102, 365 76 S420 95, 455 62 S510 75, 550 42 S580 45, 600 25"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />

                                <path
                                    d="M0 150 C50 138, 70 146, 105 120 S160 132, 195 105 S250 120, 280 90 S330 102, 365 76 S420 95, 455 62 S510 75, 550 42 S580 45, 600 25 L600 180 L0 180 Z"
                                    fill="currentColor"
                                    opacity="0.08"
                                />
                            </svg>

                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                FEATURES
               ========================= */}

            <section
                id="features"
                className="landing-section"
            >

                <div className="section-heading">

                    <span className="section-kicker">
                        Everything in one place
                    </span>

                    <h2>
                        Built for the way
                        <span> your business works.</span>
                    </h2>

                    <p>
                        Replace scattered spreadsheets and disconnected
                        processes with one organized operations workspace.
                    </p>

                </div>


                <div className="landing-feature-grid">

                    <FeatureCard
                        icon={<Users />}
                        title="Customer Management"
                        text="Keep customer information organized and accessible."
                    />

                    <FeatureCard
                        icon={<Package />}
                        title="Product Management"
                        text="Manage products, categories, pricing and availability."
                    />

                    <FeatureCard
                        icon={<Boxes />}
                        title="Inventory Control"
                        text="Track stock levels and operational inventory changes."
                    />

                    <FeatureCard
                        icon={<ClipboardList />}
                        title="Orders & Purchases"
                        text="Manage the complete order and purchasing workflow."
                    />

                    <FeatureCard
                        icon={<BarChart3 />}
                        title="Business Reports"
                        text="Understand sales, orders and operational performance."
                    />

                    <FeatureCard
                        icon={<ShieldCheck />}
                        title="Secure Access"
                        text="Role-based permissions protect sensitive business actions."
                    />

                </div>

            </section>


            {/* =========================
                HOW IT WORKS
               ========================= */}

            <section
                id="how-it-works"
                className="landing-section landing-workflow"
            >

                <div className="section-heading left">

                    <span className="section-kicker">
                        One connected workflow
                    </span>

                    <h2>
                        From daily tasks to
                        <span> better decisions.</span>
                    </h2>

                </div>

                <div className="workflow-grid">

                    <WorkflowStep
                        number="01"
                        title="Capture"
                        text="Customers, products, purchases and orders stay organized."
                    />

                    <WorkflowStep
                        number="02"
                        title="Understand"
                        text="Your dashboard turns business data into useful operational information."
                    />

                    <WorkflowStep
                        number="03"
                        title="Decide"
                        text="Use the AI Assistant to ask questions and explore your business."
                    />

                </div>

            </section>


            {/* =========================
                AI SECTION
               ========================= */}

            <section
                id="ai"
                className="landing-ai-section"
            >

                <div className="landing-ai-content">

                    <div className="landing-ai-icon">
                        <Bot size={26} />
                    </div>

                    <span className="section-kicker">
                        Intelligent assistance
                    </span>

                    <h2>
                        Ask your business
                        <span> anything.</span>
                    </h2>

                    <p>
                        Ask natural-language questions about your orders,
                        products, sales and inventory without manually
                        searching through your data.
                    </p>

                    <div className="landing-ai-examples">

                        <div>
                            <span>“How many orders do we have?”</span>
                            <ArrowRight size={17} />
                        </div>

                        <div>
                            <span>“Show me low stock products.”</span>
                            <ArrowRight size={17} />
                        </div>

                        <div>
                            <span>“What are our top products?”</span>
                            <ArrowRight size={17} />
                        </div>

                    </div>

                </div>

                <div className="landing-ai-visual">

                    <div className="ai-floating-card">

                        <Sparkles size={19} />

                        <div>
                            <strong>Business Assistant</strong>
                            <span>Ready to help</span>
                        </div>

                    </div>

                    <div className="ai-chat-card">

                        <div className="ai-message user">
                            Show me low stock products.
                        </div>

                        <div className="ai-message assistant">
                            I found 3 products that currently need
                            attention.
                        </div>

                        <div className="ai-result-card">
                            <span>Low Stock</span>
                            <strong>3 products</strong>
                            <small>Needs attention</small>
                        </div>

                    </div>

                </div>

            </section>


            {/* =========================
                CTA
               ========================= */}

            <section className="landing-cta">

                <div>
                    <span className="section-kicker">
                        Ready to get started?
                    </span>

                    <h2>
                        Bring your business
                        <span> into focus.</span>
                    </h2>

                    <p>
                        Manage your operations from one intelligent
                        workspace.
                    </p>
                </div>

                <Link
                    to="/login"
                    className="landing-primary-button"
                >
                    Enter BusinessOps
                    <ArrowRight size={18} />
                </Link>

            </section>


            <footer className="landing-footer">
                <span>© 2026 BusinessOps</span>
                <span>Business Operations Management System</span>
            </footer>

        </div>
    );
}


function FeatureCard({ icon, title, text }) {
    return (
        <div className="landing-feature-card">

            <div className="feature-icon">
                {icon}
            </div>

            <h3>{title}</h3>

            <p>{text}</p>

        </div>
    );
}


function WorkflowStep({ number, title, text }) {
    return (
        <div className="workflow-step">

            <span>{number}</span>

            <h3>{title}</h3>

            <p>{text}</p>

        </div>
    );
}


export default LandingPage;