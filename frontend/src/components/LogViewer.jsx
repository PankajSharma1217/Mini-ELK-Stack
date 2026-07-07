import { Terminal } from 'lucide-react';

export default function LogViewer({ logs, loading }) {
  
  if (loading && logs.length === 0) {
    return (
      <div className="logs-container">
        <div className="loading">Initializing Log Stream...</div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="logs-container">
        <div className="empty-state">
          <Terminal size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <div>No logs found for your search.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="logs-container">
      {logs.map((log) => (
        <div key={log.id} className={`log-entry ${log.level.toLowerCase()}`}>
          <div className="log-time">
            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }) + '.' + new Date(log.timestamp).getMilliseconds().toString().padStart(3, '0')}
          </div>
          <div className="log-level">[{log.level}]</div>
          <div className="log-message">
            {log.message}
            {log.userId && <span className="log-user">user_id: {log.userId}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
