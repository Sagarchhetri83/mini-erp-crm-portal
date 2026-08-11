import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ customers: any[], products: any[], challans: any[] }>({
    customers: [], products: [], challans: []
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolePrefix = user ? `/${user.role.toLowerCase()}` : '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ customers: [], products: [], challans: [] });
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = results.customers.length > 0 || results.products.length > 0 || results.challans.length > 0;

  return (
    <div className="global-search-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      <div 
        className={`search-input-container ${isOpen ? 'active' : ''}`} 
        style={{ 
          display: 'flex', alignItems: 'center', background: 'var(--bg-app)', 
          borderRadius: '20px', padding: '6px 12px', border: '1px solid var(--border-color)',
          width: isOpen ? '300px' : '40px', transition: 'width 0.2s', overflow: 'hidden'
        }}
        onClick={() => setIsOpen(true)}
      >
        <Search size={16} style={{ color: 'var(--text-muted)', minWidth: '16px', cursor: 'pointer' }} />
        <input 
          type="text"
          placeholder="Search customers, products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ 
            border: 'none', background: 'transparent', outline: 'none', 
            marginLeft: '8px', fontSize: '13px', width: '100%',
            opacity: isOpen ? 1 : 0
          }}
        />
        {isLoading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--primary)' }} />}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="search-dropdown" style={{
          position: 'absolute', top: '40px', right: 0, width: '350px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100, maxHeight: '400px', overflowY: 'auto'
        }}>
          {!isLoading && !hasResults && (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No results found for "{query}"
            </div>
          )}

          {results.customers.length > 0 && (
            <div className="search-group">
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--bg-app)' }}>Customers</div>
              {results.customers.map(c => (
                <div key={c.id} className="search-item" style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => handleNavigate(`${rolePrefix}/customers/${c.id}`)}>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.email || c.mobile}</div>
                </div>
              ))}
            </div>
          )}

          {results.products.length > 0 && (
            <div className="search-group">
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--bg-app)' }}>Products</div>
              {results.products.map(p => (
                <div key={p.id} className="search-item" style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => handleNavigate(`${rolePrefix}/products/${p.id}`)}>
                  <div style={{ fontWeight: 500, fontSize: '13px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                </div>
              ))}
            </div>
          )}

          {results.challans.length > 0 && (
            <div className="search-group">
              <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', background: 'var(--bg-app)' }}>Challans</div>
              {results.challans.map(ch => (
                <div key={ch.id} className="search-item" style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }} onClick={() => handleNavigate(`${rolePrefix}/challans/${ch.id}`)}>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--primary)' }}>{ch.challanNo}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ch.customer.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
