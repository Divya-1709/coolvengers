import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, Award, DollarSign, RefreshCw, X } from 'lucide-react';
import { Notification } from '../types/index.js';
import { api } from '../services/api.js';

interface Props {
  onNotificationClick?: (notif: Notification) => void;
}

export const NotificationDropdown: React.FC<Props> = ({ onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    if (onNotificationClick) {
      onNotificationClick(notif);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'REWARD_EARNED':
        return <Award className="w-4 h-4 text-emerald-600" />;
      case 'PAYOUT_SENT':
        return <DollarSign className="w-4 h-4 text-sky-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-[10px] font-bold rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" />
              <span className="font-semibold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-sky-100 text-sky-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                    !notif.isRead ? 'bg-sky-50/50 border-l-2 border-sky-600' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0 h-fit">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold ${!notif.isRead ? 'text-sky-950 font-bold' : 'text-slate-800'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="text-xs text-slate-600 hover:text-sky-600 inline-flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
