'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Badge,
  Alert,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
  BarChartOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
// Temporarily disabled internationalization
// import { useTranslations, useLocale } from 'next-intl';
// import LanguageSwitcher from './LanguageSwitcher';
// import ThemeSwitcher from './ThemeSwitcher';
import { useAccessControl } from '@/presentation/hooks/useAccessControl';
import { UserRole, Permission } from '@/domain/entities/AccessControl';
import GlobalTopBar from '@/presentation/components/GlobalTopBar';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftInfo, setDraftInfo] = useState<{ lastSaved?: string; stage?: number } | null>(null);
  const [selectedKey, setSelectedKey] = useState('dashboard');

  // Set selected key based on current path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/' || path === '/dashboard') {
        setSelectedKey('dashboard');
      } else if (path === '/customers') {
        setSelectedKey('customers');
      } else if (path === '/partners') {
        setSelectedKey('partners');
      } else if (path === '/plans/new') {
        setSelectedKey('plans/new');
      } else if (path === '/plans') {
        setSelectedKey('plans');
      } else if (path === '/tasks') {
        setSelectedKey('tasks');
      }
    }
  }, []);

  // Check for draft on mount and periodically
  useEffect(() => {
    const checkDraft = () => {
      if (typeof window !== 'undefined') {
        const draft = localStorage.getItem('planBuilderDraft');
        if (draft) {
          try {
            const parsed = JSON.parse(draft);
            // Only show draft notification for NEW plans, not for editing existing plans
            const isNewPlanDraft = !parsed.isEdit && !parsed.planId;
            
            if (isNewPlanDraft) {
              setHasDraft(true);
              setDraftInfo({
                lastSaved: parsed.lastSaved,
                stage: parsed.currentStage
              });
            } else {
              // This is an edit draft, don't show the notification
              setHasDraft(false);
              setDraftInfo(null);
            }
          } catch (e) {
            setHasDraft(false);
            setDraftInfo(null);
          }
        } else {
          setHasDraft(false);
          setDraftInfo(null);
        }
      }
    };

    checkDraft();
    // Check every 5 seconds for draft changes
    const interval = setInterval(checkDraft, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Hardcoded translations for now
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'navigation.dashboard': 'Dashboard',
      'navigation.customers': 'Customers',
      'navigation.partners': 'Partners',
      'navigation.contracts': 'Contracts',
      'navigation.settings': 'Settings',
      'navigation.logout': 'Logout',
      'navigation.profile': 'Profile',
    };
    return translations[key] || key;
  };
  
  // Hardcoded locale for now
  const locale = 'en' as 'en' | 'ar';
  const isRTL = locale === 'ar';
  
  // Access control - in real app, this would come from user session
  const { canAccessPage, currentRole } = useAccessControl(UserRole.ADMIN);

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          {t('navigation.dashboard')}
        </span>
      ),
    },
    {
      key: 'plans',
      icon: <FileTextOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          Plans
        </span>
      ),
      children: [
        {
          key: 'plans/list',
          icon: <FileTextOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              All Plans
            </span>
          ),
        },
        {
          key: 'plans/new',
          icon: <FileTextOutlined style={{ fontSize: 16 }} />,
          label: (
            <Badge dot={hasDraft} offset={[10, 0]} color="#f59e0b">
              <span style={{ 
                fontWeight: 600, 
                fontSize: 14,
                color: '#f59e0b',
                textShadow: '0 0 8px rgba(245, 158, 11, 0.3)'
              }}>
                ✨ New Plan
              </span>
            </Badge>
          ),
        },
      ],
    },
    {
      key: 'tasks',
      icon: <BarChartOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          Tasks
        </span>
      ),
      children: [
        {
          key: 'tasks/new',
          icon: <FileTextOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              New Task
            </span>
          ),
        },
      ],
    },
    ...(canAccessPage('customers') ? [{
      key: 'customers',
      icon: <UserOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          Customers
        </span>
      ),
    }] : []),
    ...(canAccessPage('partners') ? [{
      key: 'partners',
      icon: <TeamOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          {t('navigation.partners')}
        </span>
      ),
    }] : []),
    // ...(canAccessPage('contracts') ? [{
    //   key: 'contracts',
    //   icon: <FileTextOutlined />,
    //   label: t('navigation.contracts'),
    // }] : []),
    // ...(canAccessPage('settings') ? [{
    //   key: 'settings',
    //   icon: <SettingOutlined />,
    //   label: t('navigation.settings'),
    // }] : []),
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKey(key);
    
    // Navigation logic (middleware disabled, no locale prefixes)
    if (key === 'dashboard') {
      window.location.href = '/';
    } else if (key === 'customers') {
      window.location.href = '/customers';
    } else if (key === 'plans/list') {
      window.location.href = '/plans';
    } else if (key === 'plans/new') {
      window.location.href = '/plans/new';
    } else if (key === 'partners') {
      window.location.href = '/partners';
    } else if (key === 'tasks') {
      window.location.href = '/tasks';
    } else if (key === 'tasks/new') {
      window.location.href = '/tasks/new';
    } else {
      window.location.href = `/${key}`;
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('navigation.profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('navigation.logout'),
      onClick: () => {
        // Handle logout
        window.location.href = '/auth/signin';
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={280}
        style={{
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRight: '1px solid #334155',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.15)',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ 
          padding: '24px 20px',
          borderBottom: '1px solid #334155',
          marginBottom: 32
        }}>
          <div style={{
            height: 52,
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: collapsed ? 16 : 18,
            letterSpacing: '0.5px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => window.location.href = '/'}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
          >
            {collapsed ? '🏢' : '🏢 Green Lines'}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            direction: isRTL ? 'rtl' : 'ltr',
            background: 'transparent',
            border: 'none',
            fontSize: 15,
            fontWeight: 500,
            padding: '0 16px'
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            height: 'auto',
            lineHeight: 'normal',
            margin: 0,
            paddingRight: 0,
          }}
        >
          <GlobalTopBar />
        </Header>
        <Content
          style={{
            margin: '16px',
            padding: 0,
            minHeight: 280,
            background: 'transparent',
            direction: isRTL ? 'rtl' : 'ltr',
            overflowY: 'auto',
          }}
        >
          {hasDraft && typeof window !== 'undefined' && !window.location.pathname.includes('/plans/new') && (
            <Alert
              message="You have an unfinished new plan draft"
              description={
                <span>
                  {draftInfo?.lastSaved && (
                    <>Last saved: {new Date(draftInfo.lastSaved).toLocaleString()}. </>
                  )}
                  Click "New Plan" in the sidebar to continue creating your plan.
                </span>
              }
              type="info"
              showIcon
              closable
              onClose={() => {
                try {
                  localStorage.removeItem('planBuilderDraft');
                } catch {}
                setHasDraft(false);
                setDraftInfo(null);
              }}
              style={{ marginBottom: 16 }}
              action={
                <Button size="small" type="primary" onClick={() => window.location.href = '/plans/new'}>
                  Continue Editing
                </Button>
              }
            />
          )}
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;