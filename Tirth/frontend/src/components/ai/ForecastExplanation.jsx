function ForecastExplanation({
  explanation = "No explanation available yet.",
  keyFactors = [],
}) {
  return (
    <section>
      <h2>Forecast Explanation</h2>

      <p>{explanation}</p>

      {keyFactors.length > 0 && (
        <>
          <h3>Key Factors</h3>

          <ul>
            {keyFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export default ForecastExplanation;