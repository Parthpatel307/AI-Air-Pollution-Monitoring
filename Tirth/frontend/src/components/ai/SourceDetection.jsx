function SourceDetection({
  sources = [],
  explanation = "",
}) {
  return (
    <section>
      <h2>Probable Pollution Sources</h2>

      {sources.length === 0 ? (
        <p>No source analysis available.</p>
      ) : (
        <ul>
          {sources.map((item) => (
            <li key={item.source}>
              <strong>{item.source}</strong>
              {" — "}
              {(item.confidence * 100).toFixed(0)}%
            </li>
          ))}
        </ul>
      )}

      {explanation && <p>{explanation}</p>}

      <small>
        AI source detection is probabilistic and does not prove responsibility.
      </small>
    </section>
  );
}

export default SourceDetection;