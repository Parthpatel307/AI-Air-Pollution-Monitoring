import { useState } from "react";
import { analyzeAI } from "../../services/aiService";

function AIAnalysis({ zoneId = "zone_001" }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(
    "Ask a question to analyze current air-quality conditions using AI."
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function getAnswerText(result) {
    if (!result) {
      return "AI returned an empty response.";
    }

    if (typeof result === "string") {
      return result;
    }

    if (result.analysis) {
      return result.analysis;
    }

    if (result.answer) {
      return result.answer;
    }

    if (result.response) {
      return result.response;
    }

    if (result.explanation) {
      return result.explanation;
    }

    if (result.summary) {
      return result.summary;
    }

    if (result.data) {
      if (typeof result.data === "string") {
        return result.data;
      }

      if (result.data.analysis) {
        return result.data.analysis;
      }

      if (result.data.answer) {
        return result.data.answer;
      }

      if (result.data.response) {
        return result.data.response;
      }

      if (result.data.explanation) {
        return result.data.explanation;
      }
    }

    return JSON.stringify(result, null, 2);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanQuestion = question.trim();

    if (!cleanQuestion || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await analyzeAI({
        zoneId,
        question: cleanQuestion,
      });

      setAnswer(getAnswerText(result));
    } catch (err) {
      console.error("AI analysis failed:", err);

      const message =
        err?.message ||
        "AI analysis failed. Please try again.";

      setError(message);
      setAnswer("Unable to generate AI analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card ai-analysis-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            GEMINI INTELLIGENCE
          </span>

          <h2>AI Analysis</h2>
        </div>

        <span className="ai-status">
          <span />
          {loading ? "ANALYZING" : "READY"}
        </span>
      </div>

      <div className="ai-insight">
        <div className="ai-icon">
          AI
        </div>

        <div>
          <span className="ai-label">
            CURRENT INSIGHT
          </span>

          <p style={{ whiteSpace: "pre-wrap" }}>
            {answer}
          </p>

          {error && (
            <small
              style={{
                display: "block",
                marginTop: "8px",
              }}
            >
              {error}
            </small>
          )}
        </div>
      </div>

      <form
        className="ai-analysis-form"
        onSubmit={handleSubmit}
      >
        <textarea
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          placeholder="Ask: Why is AQI increasing today?"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={
            loading || !question.trim()
          }
        >
          {loading
            ? "Analyzing..."
            : "Analyze Environment →"}
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