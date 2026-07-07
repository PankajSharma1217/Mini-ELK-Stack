import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, onFilterChange, activeFilter }) {
  const [inputValue, setInputValue] = useState('');

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleFilterClick = (level) => {
    if (activeFilter === level) {
      onFilterChange(null); // toggle off
    } else {
      onFilterChange(level);
    }
  };

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" />
        <input 
          type="text" 
          className="search-input" 
          placeholder="Search logs (e.g., 'Auth failed', 'Database')..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      <div className="filter-buttons">
        <button 
          className={`filter-btn info ${activeFilter === 'INFO' ? 'active' : ''}`}
          onClick={() => handleFilterClick('INFO')}
        >
          INFO
        </button>
        <button 
          className={`filter-btn warn ${activeFilter === 'WARN' ? 'active' : ''}`}
          onClick={() => handleFilterClick('WARN')}
        >
          WARN
        </button>
        <button 
          className={`filter-btn error ${activeFilter === 'ERROR' ? 'active' : ''}`}
          onClick={() => handleFilterClick('ERROR')}
        >
          ERROR
        </button>
      </div>
    </div>
  );
}
