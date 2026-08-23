import { useState } from "react";

function ActionPanel({ incident }) {
  const [action, setAction] = useState("INSPECTION_REQUESTED");
  const [notes, setNotes] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!incident) {
      alert("Select an incident first.");
      return;
    }

    console.log({
      incident_id: incident.incident_id,
      action,
      notes,
    });
  }

  return (
    <section className="card authority-action-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">AUTHORITY RESPONSE</span>
          <h2>Action Panel</h2>
        </div>

        <span className="secure-pill">
          CONTROLLED
        </span>
      </div>

      {!incident ? (
        <div className="empty-state">
          Select an incident before recording an authority action.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Action

            <select
              value={action}
              onChange={(event) => setAction(event.target.value)}
            >
              <option value="INSPECTION_REQUESTED">
                Inspection Requested
              </option>

              <option value="WARNING_ISSUED">
                Warning Issued
              </option>

              <option value="ESCALATED">
                Escalated
              </option>

              <option value="MONITORING">
                Continue Monitoring
              </option>

              <option value="RESOLVED">
                Resolved
              </option>
            </select>
          </label>

          <label>
            Authority Notes

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Describe the action or field instructions..."
            />
          </label>

          <button type="submit">
            Record Authority Action →
          </button>
        </form>
      )}
    </section>
  );
}

export default ActionPanel;