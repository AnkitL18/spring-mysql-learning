import {
    ArrowRight,
    Bot,
    MessageCircle,
    RefreshCw,
    Send,
    Sparkles,
    User,
    WandSparkles
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState
} from "react";

import { post } from "../api/api";


function AiAssistant() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const messagesEndRef =
        useRef(null);


    /* =========================================================
       AUTO SCROLL
       ========================================================= */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, loading]);


    /* =========================================================
       SEND MESSAGE
       ========================================================= */

    async function askAssistant(text = message) {

        const cleanText =
            String(text || "").trim();

        if (
            !cleanText ||
            loading
        ) {
            return;
        }


        const userMessage = {
            type: "user",
            text: cleanText
        };


        setMessages((current) => [
            ...current,
            userMessage
        ]);

        setMessage("");
        setError("");
        setLoading(true);


        try {

            /*
             * IMPORTANT:
             *
             * /ai/ask expects:
             *
             * {
             *     "prompt": "..."
             * }
             *
             * because AiRequestDTO contains
             * a field named "prompt".
             */

            const result =
                await post(
                    "/ai/ask",
                    {
                        prompt: cleanText
                    }
                );


            const assistantText =
                result?.response ||
                result?.answer ||
                result?.message ||
                result?.content ||
                "I couldn't generate a response.";


            setMessages((current) => [
                ...current,
                {
                    type: "assistant",
                    text: assistantText
                }
            ]);


        } catch (err) {

            setError(
                err?.message ||
                "The AI assistant could not respond right now."
            );

        } finally {

            setLoading(false);

        }
    }


    /* =========================================================
       RETRY
       ========================================================= */

    async function retryLastQuestion() {

        const lastUserMessage =
            [...messages]
                .reverse()
                .find(
                    (item) =>
                        item.type === "user"
                );


        if (!lastUserMessage) {
            return;
        }


        await askAssistant(
            lastUserMessage.text
        );
    }


    /* =========================================================
       SUGGESTIONS
       ========================================================= */

    const suggestions = [

        "Show me low stock products",

        "How many orders do we have?",

        "What are our top products?",

        "Give me a business summary"

    ];


    /* =========================================================
       QUICK START CARDS
       ========================================================= */

    const quickStarts = [

        {
            title: "Inventory",
            description: "Find products that need attention.",
            prompt: "Show me low stock products",
            icon: "📦"
        },

        {
            title: "Orders",
            description: "Understand your current order activity.",
            prompt: "How many orders do we have?",
            icon: "🛍"
        },

        {
            title: "Products",
            description: "See which products are performing.",
            prompt: "What are our top products?",
            icon: "📊"
        },

        {
            title: "Business summary",
            description: "Get a quick operational overview.",
            prompt: "Give me a business summary",
            icon: "✨"
        }

    ];


    /* =========================================================
       HANDLE KEYBOARD
       ========================================================= */

    function handleKeyDown(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            askAssistant();

        }

    }


    return (

        <div className="ai-page">


            {/* =====================================================
                HEADER
               ===================================================== */}

            <div className="ai-page-header">

                <div>

                    <div className="ai-title-row">

                        <div className="ai-page-icon">

                            <Sparkles size={21} />

                        </div>

                        <span className="management-kicker">

                            Intelligent business assistant

                        </span>

                    </div>


                    <h1>
                        AI Assistant
                    </h1>


                    <p>
                        Ask questions about your business in natural language.
                    </p>

                </div>

            </div>


            {/* =====================================================
                AI WORKSPACE
               ===================================================== */}

            <div className="ai-workspace">


                {/* =================================================
                    LEFT SIDEBAR
                   ================================================= */}

                <aside className="ai-sidebar">


                    <div className="ai-sidebar-heading">

                        <MessageCircle size={16} />

                        Suggested questions

                    </div>


                    <div className="ai-suggestion-list-full">

                        {suggestions.map(
                            (suggestion) => (

                                <button
                                    key={suggestion}
                                    type="button"
                                    disabled={loading}
                                    onClick={() =>
                                        askAssistant(
                                            suggestion
                                        )
                                    }
                                >

                                    <span>
                                        {suggestion}
                                    </span>

                                    <ArrowRight size={15} />

                                </button>

                            )
                        )}

                    </div>


                    <div className="ai-note">

                        <Sparkles size={17} />

                        <div>

                            <strong>
                                Business-aware AI
                            </strong>

                            <span>
                                Ask about your operational data.
                            </span>

                        </div>

                    </div>

                </aside>


                {/* =================================================
                    CHAT
                   ================================================= */}

                <section className="ai-chat">


                    {/* CHAT HEADER */}

                    <div className="ai-chat-header">

                        <div className="ai-assistant-avatar">

                            <Bot size={19} />

                        </div>


                        <div>

                            <strong>
                                BusinessOps Assistant
                            </strong>

                            <span>
                                {loading
                                    ? "Thinking..."
                                    : "Ready to help"
                                }
                            </span>

                        </div>


                        <div className="ai-header-status">

                            <span className="ai-status-dot" />

                            {loading
                                ? "Working"
                                : "Online"
                            }

                        </div>

                    </div>


                    {/* =================================================
                        MESSAGES
                       ================================================= */}

                    <div className="ai-messages">


                        {/* =================================================
                            EMPTY / WELCOME STATE
                           ================================================= */}

                        {messages.length === 0 && !loading ? (

                            <div className="ai-empty">

                                <div className="ai-empty-icon">

                                    <WandSparkles size={28} />

                                </div>


                                <span className="ai-empty-eyebrow">
                                    BUSINESSOPS AI
                                </span>


                                <h2>
                                    How can I help?
                                </h2>


                                <p>
                                    Ask about customers, products,
                                    orders, inventory or sales.
                                </p>


                                <div className="ai-quick-start-grid">

                                    {quickStarts.map(
                                        (item) => (

                                            <button
                                                key={item.title}
                                                type="button"
                                                disabled={loading}
                                                onClick={() =>
                                                    askAssistant(
                                                        item.prompt
                                                    )
                                                }
                                            >

                                                <span className="ai-quick-start-icon">
                                                    {item.icon}
                                                </span>

                                                <span className="ai-quick-start-content">

                                                    <strong>
                                                        {item.title}
                                                    </strong>

                                                    <small>
                                                        {item.description}
                                                    </small>

                                                </span>

                                                <ArrowRight
                                                    size={15}
                                                />

                                            </button>

                                        )
                                    )}

                                </div>

                            </div>

                        ) : null}


                        {/* =================================================
                            MESSAGE LIST
                           ================================================= */}

                        {messages.map(
                            (item, index) => (

                                <div
                                    key={`${item.type}-${index}`}
                                    className={`ai-message-row ${item.type}`}
                                >


                                    <div
                                        className={
                                            item.type === "assistant"
                                                ? "ai-message-avatar"
                                                : "user-message-avatar"
                                        }
                                    >

                                        {item.type === "assistant"
                                            ? <Bot size={15} />
                                            : <User size={15} />
                                        }

                                    </div>


                                    <div
                                        className={
                                            `ai-message-bubble ${
                                                item.type === "assistant"
                                                    ? "assistant-bubble"
                                                    : "user-bubble"
                                            }`
                                        }
                                    >

                                        {item.text}

                                    </div>


                                </div>

                            )
                        )}


                        {/* =================================================
                            LOADING / TYPING STATE
                           ================================================= */}

                        {loading && (

                            <div className="ai-message-row assistant">

                                <div className="ai-message-avatar">

                                    <Bot size={15} />

                                </div>


                                <div className="ai-message-bubble assistant-bubble ai-typing">

                                    <span />
                                    <span />
                                    <span />

                                </div>

                            </div>

                        )}


                        <div
                            ref={messagesEndRef}
                        />

                    </div>


                    {/* =================================================
                        ERROR STATE
                       ================================================= */}

                    {error && (

                        <div className="ai-error">

                            <div className="ai-error-icon">
                                <TriangleAlertIcon />
                            </div>

                            <div className="ai-error-content">

                                <strong>
                                    AI request failed
                                </strong>

                                <span>
                                    {error}
                                </span>

                            </div>


                            <button
                                type="button"
                                onClick={retryLastQuestion}
                                disabled={loading}
                            >

                                <RefreshCw size={14} />

                                Retry

                            </button>

                        </div>

                    )}


                    {/* =================================================
                        INPUT
                       ================================================= */}

                    <div className="ai-input-wrapper">

                        <div
                            className={
                                `ai-input-area ${
                                    loading
                                        ? "is-loading"
                                        : ""
                                }`
                            }
                        >

                            <textarea

                                value={message}

                                onChange={(event) =>
                                    setMessage(
                                        event.target.value
                                    )
                                }

                                onKeyDown={
                                    handleKeyDown
                                }

                                placeholder={
                                    loading
                                        ? "AI is thinking..."
                                        : "Ask something about your business..."
                                }

                                rows="2"

                                disabled={loading}

                                aria-label="Ask the AI assistant"

                            />


                            <button

                                type="button"

                                onClick={() =>
                                    askAssistant()
                                }

                                disabled={
                                    loading ||
                                    !message.trim()
                                }

                                aria-label="Send message"

                            >

                                <Send size={17} />

                            </button>

                        </div>


                        <div className="ai-input-footer">

                            <span className="ai-input-hint">
                                Enter to send · Shift + Enter for a new line
                            </span>

                            <span className="ai-input-powered">
                                <Sparkles size={11} />
                                BusinessOps AI
                            </span>

                        </div>

                    </div>


                </section>

            </div>

        </div>
    );
}


/* =============================================================
   ERROR ICON
   ============================================================= */

function TriangleAlertIcon() {

    return (

        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >

            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />

            <path d="M12 9v4" />

            <path d="M12 17h.01" />

        </svg>

    );
}


export default AiAssistant;