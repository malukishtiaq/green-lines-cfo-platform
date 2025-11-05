'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Input,
  Badge,
  Dropdown,
  Avatar,
  Select,
  DatePicker,
  Button,
  List,
  Empty,
  Spin,
  Tooltip,
  Space,
  Drawer,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  GlobalOutlined,
  DollarOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { MenuProps } from 'antd';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  description: string;
  link: string;
}

interface UserPreference {
  language: string;
  currency: string;
  defaultRegion: string | null;
  defaultDateRange: string;
}

export default function GlobalTopBar() {
  const t = useTranslations('globalControls');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === 'ar';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreference>({
    language: locale,
    currency: 'AED',
    defaultRegion: null,
    defaultDateRange: 'THIS_MONTH',
  });

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Hardcoded userId for now (later get from session)
  const userId = 'cm38rg80u0000vv2r6lgxrsvu'; // Use actual admin user ID from seed

  // Fetch user preferences on mount
  useEffect(() => {
    fetchUserPreferences();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch(`/api/user/preferences?userId=${userId}`);
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
      const data = await response.json();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&limit=10`);
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/read-all?userId=${userId}`, {
        method: 'PATCH',
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Search functionality
  const handleSearch = (value: string) => {
    setSearchQuery(value);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}&userId=${userId}&category=ALL`
        );
        const data = await response.json();
        setSearchResults(data.results);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const handleSearchSelect = (result: SearchResult) => {
    router.push(result.link);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Update preferences
  const updatePreference = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          [key]: value,
        }),
      });
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  // User menu items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile'),
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('settings'),
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: () => {
        // Handle logout
        router.push('/auth/login');
      },
    },
  ];

  // Notification priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'NORMAL':
        return 'blue';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Global Search */}
      <div style={{ flex: 1, maxWidth: '500px' }}>
        <Input
          size="large"
          prefix={<SearchOutlined />}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: '100%' }}
          allowClear
        />
        {searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              [isRTL ? 'right' : 'left']: 0,
              width: '500px',
              maxHeight: '400px',
              overflowY: 'auto',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              borderRadius: '8px',
              marginTop: '8px',
              zIndex: 1000,
            }}
          >
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleSearchSelect(item)}
                  style={{ cursor: 'pointer', padding: '12px 16px' }}
                >
                  <List.Item.Meta
                    title={<Text strong>{item.title}</Text>}
                    description={
                      <>
                        <Text type="secondary">{item.subtitle}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.description}
                        </Text>
                      </>
                    }
                  />
                  <Badge
                    count={item.type}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <Tooltip title={t('dateRange')}>
        <Button
          icon={<CalendarOutlined />}
          size="large"
          onClick={() => {
            // Handle date range picker
          }}
        >
          {preferences.defaultDateRange.replace('_', ' ')}
        </Button>
      </Tooltip>

      {/* Region Filter */}
      <Select
        size="large"
        style={{ width: '120px' }}
        placeholder={t('region')}
        value={preferences.defaultRegion || undefined}
        onChange={(value) => updatePreference('defaultRegion', value)}
        options={[
          { label: 'GCC', value: 'GCC' },
          { label: 'MENA', value: 'MENA' },
          { label: 'APAC', value: 'APAC' },
          { label: 'EU', value: 'EU' },
        ]}
        allowClear
      />

      {/* Currency Selector */}
      <Select
        size="large"
        style={{ width: '100px' }}
        value={preferences.currency}
        onChange={(value) => updatePreference('currency', value)}
        suffixIcon={<DollarOutlined />}
        options={[
          { label: 'AED', value: 'AED' },
          { label: 'SAR', value: 'SAR' },
          { label: 'USD', value: 'USD' },
          { label: 'EUR', value: 'EUR' },
          { label: 'GBP', value: 'GBP' },
        ]}
      />

      {/* Notifications */}
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: '20px' }} />}
          size="large"
          onClick={() => {
            setNotificationsVisible(true);
            fetchNotifications();
          }}
        />
      </Badge>

      {/* Notifications Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('notifications')}</span>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={markAllAsRead}>
                {t('markAllRead')}
              </Button>
            )}
          </div>
        }
        placement={isRTL ? 'left' : 'right'}
        onClose={() => setNotificationsVisible(false)}
        open={notificationsVisible}
        width={400}
      >
        {notificationsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty description={t('noNotifications')} />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (!item.isRead) {
                    markAsRead(item.id);
                  }
                  if (item.link) {
                    router.push(item.link);
                    setNotificationsVisible(false);
                  }
                }}
                actions={[
                  !item.isRead && (
                    <Tooltip title={t('markAsRead')}>
                      <CheckOutlined
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(item.id);
                        }}
                      />
                    </Tooltip>
                  ),
                  <Tooltip title={t('delete')}>
                    <DeleteOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                    />
                  </Tooltip>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong={!item.isRead}>{item.title}</Text>
                      <Badge color={getPriorityColor(item.priority)} />
                    </Space>
                  }
                  description={
                    <>
                      <Text type="secondary">{item.message}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(item.createdAt).toLocaleString(locale)}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>

      {/* User Menu */}
      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
        />
      </Dropdown>
    </div>
  );
}

