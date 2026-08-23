function RiskClusters({ clusters = [] }) {
  return (
    <section>
      <h2>Risk Clusters</h2>

      {clusters.length === 0 ? (
        <p>No high-risk clusters detected.</p>
      ) : (
        <ul>
          {clusters.map((cluster) => (
            <li key={cluster.cluster_id}>
              <strong>{cluster.cluster_id}</strong>

              <div>
                Risk: {cluster.risk_level || "UNKNOWN"}
              </div>

              <div>
                AQI: {cluster.aqi ?? "N/A"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default RiskClusters;