'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button, Dropdown, Space, Typography } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Text } = Typography;

const LanguageSwitcher: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const languageItems: MenuProps['items'] = [
    {
      key: 'en',
      label: (
        <Space>
          <span>🇺🇸</span>
          <span>English</span>
        </Space>
      ),
      onClick: () => handleLanguageChange('en'),
    },
    {
      key: 'ar',
      label: (
        <Space>
          <span>🇦🇪</span>
          <span>العربية</span>
        </Space>
      ),
      onClick: () => handleLanguageChange('ar'),
    },
  ];

  const getCurrentLanguageLabel = () => {
    switch (locale) {
      case 'ar':
        return 'العربية';
      case 'en':
      default:
        return 'English';
    }
  };

  const getCurrentLanguageFlag = () => {
    switch (locale) {
      case 'ar':
        return '🇦🇪';
      case 'en':
      default:
        return '🇺🇸';
    }
  };

  return (
    <Dropdown
      menu={{ items: languageItems }}
      placement="bottomRight"
      arrow
    >
      <Button
        type="text"
        icon={<GlobalOutlined />}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: 'auto',
          padding: '8px 12px',
        }}
      >
        <Space size={4}>
          <span>{getCurrentLanguageFlag()}</span>
          <Text style={{ fontSize: '14px' }}>
            {getCurrentLanguageLabel()}
          </Text>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
