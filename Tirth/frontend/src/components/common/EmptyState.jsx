function EmptyState({
  title = "No data available",
  message = "There is currently no information to display.",
}) {
  return (
    <div className="state-panel empty-panel">
      <div className="state-icon">—</div>

      <strong>{title}</strong>

      <p>{message}</p>
    </div>
  );
}

export default EmptyState;