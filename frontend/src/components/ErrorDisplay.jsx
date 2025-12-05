const ErrorDisplay = ({ message, onRetry }) => {
  return (
    <div className="error-container">
      <div className="error-message">
        <h3>Error</h3>
        <p>{message || 'An unexpected error occurred'}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn btn-primary">
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;