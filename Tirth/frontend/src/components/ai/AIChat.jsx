import { useState } from "react";
import { sendAIChat } from "../../services/aiService";

function getMessageText(response) {
  const data = response?.data || response;

  if (!data) {
    return "AI returned an empty response.";
  }

  if (typeof data === "string") {
    return data;
  }

  return (
    data.answer ||
    data.response ||
    data.message ||
    data.analysis ||
    data.explanation ||
    data.summary ||
    data.text ||
    JSON.stringify(data, null, 2)
  );
}

function getErrorMessage(error) {
  const value = error?.message ?? error;

  if (typeof value === "string") {
    return value;
  }

  if (value?.detail?.error?.message) {
    return value.detail.error.message;
  }

  if (value?.error?.message) {
    return value.error.message;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "AI chat request failed.";
  }
}

function AIChat({ zoneId = "zone_001" }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Environmental intelligence console ready. Ask me about AQI, forecasts or pollution risks.",
    },
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    const value = message.trim();

    if (!value || loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: value,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await sendAIChat({
        message: value,
        zoneId,
      });

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: getMessageText(response),
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (error) {
      console.error("AI chat failed:", error);

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: `Error: ${getErrorMessage(error)}`,
      };

      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card ai-chat-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            ENVIRONMENT COPILOT
          </span>

          <h2>AI Assistant</h2>
        </div>

        <span className="ai-status">
          <span />
          {loading ? "THINKING" : "ONLINE"}
        </span>
      </div>

      <div className="chat-window">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`chat-message ${
              item.role === "user"
                ? "chat-user"
                : "chat-assistant"
            }`}
          >
            <div className="chat-avatar">
              {item.role === "user"
                ? "YOU"
                : "AI"}
            </div>

            <div className="chat-bubble">
              {item.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message chat-assistant">
            <div className="chat-avatar">
              AI
            </div>

            <div className="chat-bubble">
              Analyzing current environmental data...
            </div>
          </div>
        )}
      </div>

      <form
        className="chat-form"
        onSubmit={handleSubmit}
      >
        <input
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Ask about pollution conditions..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="chat-suggestions">
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setMessage(
              "Why is AQI increasing today?"
            )
          }
        >
          Why AQI increased?
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setMessage(
              "What is the safest time to go outside?"
            )
          }
        >
          Safest time outside
        </button>
      </div>
    </section>
  );
}

export default AIChat;