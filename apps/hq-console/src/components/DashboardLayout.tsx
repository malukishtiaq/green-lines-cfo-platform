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
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useAccessControl } from '@/presentation/hooks/useAccessControl';
import { UserRole, Permission } from '@/domain/entities/AccessControl';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations('navigation');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  // Access control - in real app, this would come from user session
  const { canAccessPage, currentRole } = useAccessControl(UserRole.ADMIN);

  const menuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: t('dashboard'),
    },
    // Only show customers if user has permission
    ...(canAccessPage('customers') ? [{
      key: 'customers',
      icon: <TeamOutlined />,
      label: t('customers'),
    }] : []),
    // Only show service plans if user has permission
    ...(canAccessPage('service-plans') ? [{
      key: 'service-plans',
      icon: <FileTextOutlined />,
      label: t('servicePlans'),
    }] : []),
    // Only show tasks if user has permission
    ...(canAccessPage('tasks') ? [{
      key: 'tasks',
      icon: <BarChartOutlined />,
      label: t('tasks'),
    }] : []),
    // Only show settings if user has permission
    ...(canAccessPage('settings') ? [{
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('settings'),
    }] : []),
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#fff',
          boxShadow: isRTL ? '-2px 0 8px 0 rgba(29,35,41,.05)' : '2px 0 8px 0 rgba(29,35,41,.05)',
        }}
      >
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Title
            level={4}
            style={{
              margin: 0,
              color: '#1890ff',
              fontSize: collapsed ? '16px' : '20px',
            }}
          >
            {collapsed ? 'GL' : 'Green Lines CFO'}
          </Title>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{
            borderRight: 0,
            marginTop: '16px',
          }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
          }}
        >
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
                 <Space>
                   <LanguageSwitcher />
                   <ThemeSwitcher />
                   <Button
                     type="text"
                     icon={<BellOutlined />}
                     style={{ fontSize: '16px' }}
                   />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>Admin User</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
