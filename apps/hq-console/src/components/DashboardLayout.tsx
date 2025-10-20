'use client';

import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
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

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  
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
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
    },
    // Temporarily commented out until routes are created
    // {
    //   key: 'multi-tenant',
    //   icon: <BarChartOutlined />,
    //   label: 'Multi-Tenant Dashboard',
    // },
    // ...(canAccessPage('customers') ? [{
    //   key: 'customers',
    //   icon: <TeamOutlined />,
    //   label: t('navigation.customers'),
    // }] : []),
    // ...(canAccessPage('partners') ? [{
    //   key: 'partners',
    //   icon: <UserOutlined />,
    //   label: t('navigation.partners'),
    // }] : []),
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
    // Simple navigation
    if (key === 'dashboard') {
      window.location.href = '/';
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
        style={{
          background: '#001529',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'GL' : 'Green Lines'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space size="middle" style={{ marginRight: 24 }}>
            <BellOutlined style={{ fontSize: 18 }} />
            {/* Temporarily disabled ThemeSwitcher and LanguageSwitcher */}
            {/* <ThemeSwitcher /> */}
            {/* <LanguageSwitcher /> */}
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <span>Admin User</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
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
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;