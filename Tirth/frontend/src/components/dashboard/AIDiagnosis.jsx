function AIDiagnosis({
  title = "AI Diagnosis",
  summary = "No AI diagnosis available yet.",
  factors = [],
}) {
  return (
    <section>
      <h2>{title}</h2>

      <p>{summary}</p>

      {factors.length > 0 && (
        <>
          <h3>Key Factors</h3>

          <ul>
            {factors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default AIDiagnosis;
