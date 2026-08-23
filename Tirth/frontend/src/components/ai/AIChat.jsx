import { useState } from "react";

function AIChat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Environmental intelligence console ready. Ask me about AQI, forecasts or pollution risks.",
    },
  ]);

  function handleSubmit(event) {
    event.preventDefault();

    const value = message.trim();

    if (!value) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: value,
    };

    const aiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      text: "Backend AI integration is pending. This interface is ready for POST /api/v1/ai/chat.",
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
      aiMessage,
    ]);

    setMessage("");
  }

  return (
    <section className="card ai-chat-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">ENVIRONMENT COPILOT</span>
          <h2>AI Assistant</h2>
        </div>

        <span className="ai-status">
          <span />
          ONLINE
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
              {item.role === "user" ? "YOU" : "AI"}
            </div>

            <div className="chat-bubble">
              {item.text}
            </div>
          </div>
        ))}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about pollution conditions..."
        />

        <button type="submit">
          Send
        </button>
      </form>

      <div className="chat-suggestions">
        <button
          type="button"
          onClick={() =>
            setMessage("Why is AQI increasing today?")
          }
        >
          Why AQI increased?
        </button>

        <button
          type="button"
          onClick={() =>
            setMessage("What is the safest time to go outside?")
          }
        >
          Safest time outside
        </button>
      </div>
    </section>
  );
}

export default AIChat;