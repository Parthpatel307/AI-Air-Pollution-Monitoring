import { useState } from "react";

function AIAnalysis() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "AQI conditions are currently influenced by particulate matter concentration, wind dispersion and recent pollution trends."
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!question.trim()) return;

    console.log({
      zone_id: "zone_001",
      question,
    });

    setAnswer(
      "AI analysis will be connected to the backend Gemini endpoint. Current response is frontend preview data."
    );
  }

  return (
    <section className="card ai-analysis-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">GEMINI INTELLIGENCE</span>
          <h2>AI Analysis</h2>
        </div>

        <span className="ai-status">
          <span />
          READY
        </span>
      </div>

      <div className="ai-insight">
        <div className="ai-icon">AI</div>

        <div>
          <span className="ai-label">CURRENT INSIGHT</span>
          <p>{answer}</p>
        </div>
      </div>

      <form className="ai-analysis-form" onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask: Why is AQI increasing today?"
        />

        <button type="submit">
          Analyze Environment →
        </button>
      </form>

      <div className="ai-data-sources">
        <span>Grounded with:</span>

        <div>
          <span>AQI DATA</span>
          <span>WEATHER</span>
          <span>POLLUTANTS</span>
        </div>
      </div>
    </section>
  );
}

export default AIAnalysis;