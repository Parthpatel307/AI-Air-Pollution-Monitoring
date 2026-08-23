function Loading({ message = "Loading environmental data..." }) {
  return (
    <div className="state-panel loading-panel" role="status">
      <div className="loading-spinner" />

      <strong>{message}</strong>

      <span>
        Synchronizing monitoring data...
      </span>
    </div>
  );
}

export default Loading;