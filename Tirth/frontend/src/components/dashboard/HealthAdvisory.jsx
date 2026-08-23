function HealthAdvisory({ category = "UNKNOWN" }) {
  const advisory =
    category === "GOOD"
      ? "Air quality is currently good."
      : category === "UNHEALTHY"
      ? "Consider reducing prolonged outdoor activity."
      : "Monitor air quality and follow local health guidance.";

  return (
    <section>
      <h2>Health Advisory</h2>
      <p>{advisory}</p>
    </section>
  );
}

export default HealthAdvisory;