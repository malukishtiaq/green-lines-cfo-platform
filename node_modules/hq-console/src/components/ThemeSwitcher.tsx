'use client';

import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '@/design-system/ThemeProvider';
import type { MenuProps } from 'antd';

const ThemeSwitcher: React.FC = () => {
  const { currentTheme, toggleTheme } = useTheme();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'toggle') {
      toggleTheme();
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <Space>
          <BulbOutlined />
          Light Theme
        </Space>
      ),
      key: 'light',
      disabled: currentTheme === 'light',
    },
    {
      label: (
        <Space>
          <BulbFilled />
          Dark Theme
        </Space>
      ),
      key: 'dark',
      disabled: currentTheme === 'dark',
    },
    {
      type: 'divider',
    },
    {
      label: 'Toggle Theme',
      key: 'toggle',
    },
  ];

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" arrow>
      <Button 
        type="text" 
        icon={currentTheme === 'light' ? <BulbOutlined /> : <BulbFilled />}
        style={{ fontSize: '16px' }}
      >
        {currentTheme === 'light' ? 'Light' : 'Dark'}
      </Button>
    </Dropdown>
  );
};

export default ThemeSwitcher;
