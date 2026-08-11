import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Fetch notifications error', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-wrapper" ref={wrapperRef} style={{ position: 'relative' }}>
      <div 
        className="bell-icon-container" 
        style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} style={{ color: 'var(--text-muted)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: 'var(--danger-color, #EF4444)', color: 'white',
            fontSize: '10px', fontWeight: 'bold', padding: '2px 5px',
            borderRadius: '10px', minWidth: '16px', textAlign: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown" style={{
          position: 'absolute', top: '36px', right: '-10px', width: '320px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100, display: 'flex', flexDirection: 'column', maxHeight: '450px'
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No notifications
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-color)',
                  background: n.isRead ? 'transparent' : 'rgba(91, 92, 226, 0.05)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontWeight: n.isRead ? 500 : 600, fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n.id)} title="Mark as read" style={{
                      background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer',
                      padding: '4px', borderRadius: '4px'
                    }}>
                      <Check size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
