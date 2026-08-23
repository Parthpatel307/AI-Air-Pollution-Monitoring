import { useState } from "react";

function EvidenceUpload() {
  const [file, setFile] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      alert("Please select evidence first.");
      return;
    }

    console.log("Evidence selected:", file);
  }

  return (
    <section className="card evidence-upload-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">FIELD EVIDENCE</span>
          <h2>Upload Evidence</h2>
        </div>

        <span className="secure-pill">
          SECURE
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="upload-zone">
          <input
            type="file"
            accept="image/*,video/*,.pdf"
            onChange={(event) =>
              setFile(event.target.files?.[0] || null)
            }
          />

          <div className="upload-content">
            <strong>
              {file ? file.name : "Select evidence"}
            </strong>

            <span>
              Upload image, video or PDF evidence
            </span>
          </div>
        </label>

        {file && (
          <div className="file-preview">
            <span>Selected File</span>
            <strong>{file.name}</strong>
            <small>
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </small>
          </div>
        )}

        <button type="submit">
          Upload Evidence →
        </button>
      </form>

      <small className="privacy-note">
        Evidence should only contain information relevant to the reported
        pollution incident.
      </small>
    </section>
  );
}

export default EvidenceUpload;