function SourceAttribution({ sources = [] }) {
  return (
    <section className="card source-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            PROBABLE SOURCE ANALYSIS
          </span>

          <h2>Source Attribution</h2>
        </div>

        <span className="ai-pill">AI</span>
      </div>

      {sources.length === 0 ? (
        <p>No source attribution available.</p>
      ) : (
        <div className="source-list">
          {sources.map((item) => {
            const percentage = Math.round(item.confidence * 100);

            return (
              <div className="source-item" key={item.source}>
                <div className="source-heading">
                  <span>
                    {item.source.replaceAll("_", " ")}
                  </span>

                  <strong>{percentage}%</strong>
                </div>

                <div className="source-track">
                  <div
                    className="source-progress"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="analysis-warning">
        Probabilistic attribution — not definitive evidence.
      </div>
    </section>
  );
}

export default SourceAttribution;