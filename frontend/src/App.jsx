import { useState, useEffect } from 'react'
import { Meilisearch } from 'meilisearch'
import SearchBar from './components/SearchBar'
import LogViewer from './components/LogViewer'
import './index.css'

const client = new Meilisearch({
  host: 'http://localhost:7700',
  apiKey: 'mini-elk-master-key',
})
const index = client.index('logs')

function App() {
  const [logs, setLogs] = useState([])
  const [query, setQuery] = useState('')
  const [filterLevel, setFilterLevel] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch logs whenever query or filter changes
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        let searchParams = {
          limit: 100,
          sort: ['timestamp:desc']
        }
        
        if (filterLevel) {
          searchParams.filter = `level = ${filterLevel}`
        }

        const res = await index.search(query, searchParams)
        setLogs(res.hits)
      } catch (err) {
        console.error("Error fetching logs:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()

    // Real-time polling for new logs if no query is set
    let interval;
    if (!query) {
      interval = setInterval(fetchLogs, 2000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [query, filterLevel])

  return (
    <div className="app-container">
      <header>
        <h1>Mini-ELK Dashboard</h1>
        <div className="subtitle">Real-time log aggregation and sub-millisecond search</div>
      </header>

      <main className="glass-panel">
        <SearchBar 
          onSearch={(q) => setQuery(q)} 
          onFilterChange={(level) => setFilterLevel(level)} 
          activeFilter={filterLevel}
        />
        
        <LogViewer logs={logs} loading={loading} />
      </main>
    </div>
  )
}

export default App
