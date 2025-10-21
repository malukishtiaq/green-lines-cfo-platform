'use client';

import React from 'react';
import { Card, Button, Space, Typography } from 'antd';
import { useTheme } from '@/design-system/ThemeProvider';
import { useTranslations } from 'next-intl';

const { Title, Text } = Typography;

const DesignSystemDemo: React.FC = () => {
  const { themeConfig } = useTheme();
  const t = useTranslations('designSystem');

  return (
    <div className="p-lg">
      <Title level={2} className="text-primary-color">
        Design System Demo
      </Title>
      
      <Text className="text-secondary">
        This component demonstrates how to use the centralized design system.
      </Text>

      <div className="flex flex-col gap-lg m-lg">
        {/* Using CSS Variables */}
        <Card className="design-card">
          <Title level={3} className="design-heading">
            CSS Variables Example
          </Title>
          <Text className="design-text">
            This card uses CSS variables from the design system.
          </Text>
          <Button className="design-button">
            Design System Button
          </Button>
        </Card>

        {/* Using Theme Configuration */}
        <Card 
          style={{
            backgroundColor: themeConfig.colors.surface,
            borderRadius: themeConfig.borderRadius.lg,
            padding: themeConfig.spacing.xl,
            boxShadow: themeConfig.shadows.md,
          }}
        >
          <Title 
            level={3}
            style={{
              color: themeConfig.colors.text.primary,
              fontSize: themeConfig.typography.fontSize['2xl'],
              fontFamily: themeConfig.typography.fontFamily.primary,
            }}
          >
            Theme Config Example
          </Title>
          <Text 
            style={{
              color: themeConfig.colors.text.secondary,
              fontSize: themeConfig.typography.fontSize.base,
              marginBottom: themeConfig.spacing.md,
            }}
          >
            This card uses theme configuration directly.
          </Text>
          <Button 
            type="primary"
            style={{
              backgroundColor: themeConfig.colors.primary,
              borderColor: themeConfig.colors.primary,
              borderRadius: themeConfig.borderRadius.md,
              height: themeConfig.components.button.height.large,
            }}
          >
            Primary Button
          </Button>
        </Card>

        {/* Using Utility Classes */}
        <Card className="p-lg border-radius-lg shadow-lg bg-surface">
          <Title level={3} className="text-2xl font-bold text-primary-color">
            Utility Classes Example
          </Title>
          <Text className="text-base text-secondary m-md">
            This card uses utility classes for styling.
          </Text>
          <Space className="gap-md">
            <Button className="bg-primary text-white border-radius-md">
              Success
            </Button>
            <Button className="bg-warning text-white border-radius-md">
              Warning
            </Button>
            <Button className="bg-error text-white border-radius-md">
              Error
            </Button>
          </Space>
        </Card>

        {/* Color Palette Demo */}
        <Card title="Color Palette" className="p-lg">
          <div className="flex flex-wrap gap-md">
            <div 
              className="p-md border-radius-md text-white text-center"
              style={{ backgroundColor: themeConfig.colors.primary }}
            >
              Primary
            </div>
            <div 
              className="p-md border-radius-md text-white text-center"
              style={{ backgroundColor: themeConfig.colors.secondary }}
            >
              Secondary
            </div>
            <div 
              className="p-md border-radius-md text-white text-center"
              style={{ backgroundColor: themeConfig.colors.success }}
            >
              Success
            </div>
            <div 
              className="p-md border-radius-md text-white text-center"
              style={{ backgroundColor: themeConfig.colors.warning }}
            >
              Warning
            </div>
            <div 
              className="p-md border-radius-md text-white text-center"
              style={{ backgroundColor: themeConfig.colors.error }}
            >
              Error
            </div>
          </div>
        </Card>

        {/* Typography Demo */}
        <Card title="Typography Scale" className="p-lg">
          <div className="flex flex-col gap-sm">
            <Text className="text-xs">Extra Small Text (12px)</Text>
            <Text className="text-sm">Small Text (14px)</Text>
            <Text className="text-base">Base Text (16px)</Text>
            <Text className="text-lg">Large Text (18px)</Text>
            <Text className="text-xl">Extra Large Text (20px)</Text>
            <Text className="text-2xl">2X Large Text (24px)</Text>
            <Text className="text-3xl">3X Large Text (30px)</Text>
            <Text className="text-4xl">4X Large Text (36px)</Text>
          </div>
        </Card>

        {/* Spacing Demo */}
        <Card title="Spacing Scale" className="p-lg">
          <div className="flex flex-col gap-xs">
            <div className="bg-primary p-xs text-white text-center">XS (4px)</div>
            <div className="bg-secondary p-sm text-white text-center">SM (8px)</div>
            <div className="bg-success p-md text-white text-center">MD (16px)</div>
            <div className="bg-warning p-lg text-white text-center">LG (24px)</div>
            <div className="bg-error p-xl text-white text-center">XL (32px)</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo;
