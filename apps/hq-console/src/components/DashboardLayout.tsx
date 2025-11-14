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
  MonitorOutlined,
  ApiOutlined,
  DollarOutlined,
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
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // Set selected key based on current path
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/' || path === '/dashboard') {
        setSelectedKey('dashboard');
        setOpenKeys([]);
      } else if (path.startsWith('/plans') || path.includes('/monitor')) {
        // Handle all plan-related pages including monitor
        setOpenKeys(['plans']); // Expand Plans menu
        if (path === '/plans/new') {
          setSelectedKey('plans/new');
        } else if (path.includes('/monitor')) {
          setSelectedKey('plans/monitor');
        } else {
          // This handles /plans, /plans/[id], /plans/edit/[id], etc.
          setSelectedKey('plans/list');
        }
      } else if (path.startsWith('/tasks')) {
        // Handle all task-related pages
        setOpenKeys(['tasks']); // Expand Tasks menu
        if (path === '/tasks/new') {
          setSelectedKey('tasks/new');
        } else {
          setSelectedKey('tasks');
        }
      } else if (path.startsWith('/partners')) {
        setSelectedKey('partners');
        setOpenKeys([]);
      } else if (path.startsWith('/erp')) {
        setOpenKeys(['erp']);
        if (path === '/erp/test') {
          setSelectedKey('erp/test');
        } else {
          setSelectedKey('erp/connections');
        }
      } else if (path.startsWith('/kpi')) {
        setOpenKeys(['kpi']);
        if (path === '/kpi/revenue-growth') {
          setSelectedKey('kpi/revenue-growth');
        } else if (path === '/kpi/operating-margin') {
          setSelectedKey('kpi/operating-margin');
        } else if (path === '/kpi/ebitda-margin') {
          setSelectedKey('kpi/ebitda-margin');
        } else if (path === '/kpi/cash-flow-ops') {
          setSelectedKey('kpi/cash-flow-ops');
        } else if (path === '/kpi/debt-equity') {
          setSelectedKey('kpi/debt-equity');
        } else if (path === '/kpi/employee-growth') {
          setSelectedKey('kpi/employee-growth');
        } else if (path === '/kpi/employee-turnover') {
          setSelectedKey('kpi/employee-turnover');
        } else if (path === '/kpi/average-tenure') {
          setSelectedKey('kpi/average-tenure');
        } else if (path === '/kpi/cost-per-hire') {
          setSelectedKey('kpi/cost-per-hire');
        } else if (path === '/kpi/open-positions') {
          setSelectedKey('kpi/open-positions');
        } else if (path === '/kpi/num-customers') {
          setSelectedKey('kpi/num-customers');
        } else if (path === '/kpi/avg-order-value') {
          setSelectedKey('kpi/avg-order-value');
        }
      } else if (path.startsWith('/customers')) {
        setSelectedKey('customers');
        setOpenKeys([]);
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
        {
          key: 'plans/monitor',
          icon: <MonitorOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Monitor Plans
            </span>
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
    {
      key: 'erp',
      icon: <ApiOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          ERP Integration
        </span>
      ),
      children: [
        {
          key: 'erp/connections',
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Connections
            </span>
          ),
        },
        {
          key: 'erp/test',
          label: (
            <span style={{ fontWeight: 400, fontSize: 14, color: '#52c41a' }}>
              🧪 Test Data Sync
            </span>
          ),
        },
      ],
    },
    {
      key: 'kpi',
      icon: <DollarOutlined style={{ fontSize: 18 }} />,
      label: (
        <span style={{ fontWeight: 500, fontSize: 15 }}>
          KPIs
        </span>
      ),
      children: [
        {
          key: 'kpi/revenue-growth',
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Revenue Growth %
            </span>
          ),
        },
        {
          key: 'kpi/operating-margin',
          icon: <BarChartOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Operating Margin %
            </span>
          ),
        },
        {
          key: 'kpi/ebitda-margin',
          icon: <BarChartOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              EBITDA Margin %
            </span>
          ),
        },
        {
          key: 'kpi/cash-flow-ops',
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Cash Flow Operations
            </span>
          ),
        },
        {
          key: 'kpi/debt-equity',
          icon: <BarChartOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Debt-to-Equity Ratio
            </span>
          ),
        },
        {
          key: 'kpi/employee-growth',
          icon: <TeamOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Employee Growth %
            </span>
          ),
        },
        {
          key: 'kpi/employee-turnover',
          icon: <TeamOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Employee Turnover %
            </span>
          ),
        },
        {
          key: 'kpi/average-tenure',
          icon: <TeamOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Average Tenure
            </span>
          ),
        },
        {
          key: 'kpi/cost-per-hire',
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Cost per Hire
            </span>
          ),
        },
        {
          key: 'kpi/open-positions',
          icon: <TeamOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Open Positions
            </span>
          ),
        },
        {
          key: 'kpi/num-customers',
          icon: <UserOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Number of Customers
            </span>
          ),
        },
        {
          key: 'kpi/avg-order-value',
          icon: <DollarOutlined style={{ fontSize: 16 }} />,
          label: (
            <span style={{ fontWeight: 400, fontSize: 14 }}>
              Avg Order Value
            </span>
          ),
        },
      ],
    },
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
    } else if (key === 'plans/monitor') {
      window.location.href = '/plans/monitor';  // Go to monitor overview page
    } else if (key === 'partners') {
      window.location.href = '/partners';
    } else if (key === 'erp' || key === 'erp/connections') {
      window.location.href = '/erp';
    } else if (key === 'erp/test') {
      window.location.href = '/erp/test';
    } else if (key === 'kpi/revenue-growth') {
      window.location.href = '/kpi/revenue-growth';
    } else if (key === 'kpi/operating-margin') {
      window.location.href = '/kpi/operating-margin';
    } else if (key === 'kpi/ebitda-margin') {
      window.location.href = '/kpi/ebitda-margin';
    } else if (key === 'kpi/cash-flow-ops') {
      window.location.href = '/kpi/cash-flow-ops';
    } else if (key === 'kpi/debt-equity') {
      window.location.href = '/kpi/debt-equity';
    } else if (key === 'kpi/employee-growth') {
      window.location.href = '/kpi/employee-growth';
    } else if (key === 'kpi/employee-turnover') {
      window.location.href = '/kpi/employee-turnover';
    } else if (key === 'kpi/average-tenure') {
      window.location.href = '/kpi/average-tenure';
    } else if (key === 'kpi/cost-per-hire') {
      window.location.href = '/kpi/cost-per-hire';
    } else if (key === 'kpi/open-positions') {
      window.location.href = '/kpi/open-positions';
    } else if (key === 'kpi/num-customers') {
      window.location.href = '/kpi/num-customers';
    } else if (key === 'kpi/avg-order-value') {
      window.location.href = '/kpi/avg-order-value';
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
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
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
        <GlobalTopBar />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
            direction: isRTL ? 'rtl' : 'ltr'
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