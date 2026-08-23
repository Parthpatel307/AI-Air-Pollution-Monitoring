function ErrorState({
  title = "Unable to load data",
  message = "Something went wrong while connecting to the monitoring service.",
  onRetry,
}) {
  return (
    <div className="state-panel error-panel">
      <div className="state-icon">!</div>

      <strong>{title}</strong>

      <p>{message}</p>

      {onRetry && (
        <button type="button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;