// Example: Complete Feature Implementation
// This shows how to implement a new feature following all patterns

// 1. Domain Layer - Entity
export interface Report {
  id: string;
  title: string;
  type: ReportType;
  data: ReportData;
  generatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReportType {
  FINANCIAL = 'FINANCIAL',
  CUSTOMER = 'CUSTOMER',
  TASK = 'TASK',
  USER = 'USER',
}

export interface ReportData {
  summary: Record<string, unknown>;
  details: Record<string, unknown>[];
}

// 2. Domain Layer - Repository Interface
export interface IReportRepository {
  findById(id: string): Promise<Report | null>;
  findAll(): Promise<Report[]>;
  findByType(type: ReportType): Promise<Report[]>;
  create(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report>;
  update(id: string, reportData: Partial<Report>): Promise<Report>;
  delete(id: string): Promise<void>;
  export(id: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob>;
}

// 3. Application Layer - Use Case
export class GenerateReportUseCase {
  constructor(
    private reportRepository: IReportRepository,
    private accessControlService: AccessControlService
  ) {}

  async execute(
    reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>,
    userRole: UserRole
  ): Promise<Report> {
    // Check permissions
    if (!this.accessControlService.hasPermission(userRole, Permission.READ_REPORTS)) {
      throw new Error('Insufficient permissions to generate reports');
    }

    // Business logic validation
    if (!reportData.title || reportData.title.trim().length === 0) {
      throw new Error('Report title is required');
    }

    if (!reportData.type) {
      throw new Error('Report type is required');
    }

    // Generate report
    return this.reportRepository.create(reportData);
  }
}

// 4. Infrastructure Layer - API Repository
export class ApiReportRepository implements IReportRepository {
  private baseUrl = '/reports';

  async findById(id: string): Promise<Report | null> {
    try {
      const response = await httpClient.get<ApiResponse<Report>>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report:', error);
      return null;
    }
  }

  async findAll(): Promise<Report[]> {
    try {
      const response = await httpClient.get<ApiResponse<Report[]>>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      return [];
    }
  }

  async findByType(type: ReportType): Promise<Report[]> {
    try {
      const response = await httpClient.get<ApiResponse<Report[]>>(`${this.baseUrl}?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch reports by type:', error);
      return [];
    }
  }

  async create(reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    try {
      const response = await httpClient.post<ApiResponse<Report>>(this.baseUrl, reportData);
      return response.data;
    } catch (error) {
      console.error('Failed to create report:', error);
      throw error;
    }
  }

  async update(id: string, reportData: Partial<Report>): Promise<Report> {
    try {
      const response = await httpClient.put<ApiResponse<Report>>(`${this.baseUrl}/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Failed to update report:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  }

  async export(id: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    try {
      const response = await httpClient.get(`${this.baseUrl}/${id}/export?format=${format}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }
}

// 5. Presentation Layer - Hook
export const useReports = (filters?: { type?: ReportType }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const useCase = new GetReportsUseCase(RepositoryFactory.getReportRepository());
        const fetchedReports = await useCase.execute(filters);
        setReports(fetchedReports);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filters]);

  const generateReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const useCase = new GenerateReportUseCase(
        RepositoryFactory.getReportRepository(),
        new AccessControlService()
      );
      const newReport = await useCase.execute(reportData, UserRole.ADMIN); // In real app, get from session
      setReports(prev => [...prev, newReport]);
      return newReport;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    }
  };

  const exportReport = async (id: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const repository = RepositoryFactory.getReportRepository();
      const blob = await repository.export(id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
      throw err;
    }
  };

  return { reports, loading, error, generateReport, exportReport };
};

// 6. Presentation Layer - Component
'use client';

import React, { useState } from 'react';
import { Card, Table, Button, Space, Typography, Select, Modal, Form, Input } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { useReports } from '../hooks/useReports';
import { useAccessControl, PermissionGate } from '../hooks/useAccessControl';
import { useTranslations } from 'next-intl';
import { ReportType, Permission } from '../../domain/entities';
import { UserRole } from '../../domain/entities/AccessControl';

const { Title } = Typography;
const { Option } = Select;

const ReportsPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ReportType | undefined>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { reports, loading, error, generateReport, exportReport } = useReports({ type: selectedType });
  const { hasPermission, canPerformAction } = useAccessControl(UserRole.ADMIN);
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');

  const columns = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('generatedBy'),
      dataIndex: 'generatedBy',
      key: 'generatedBy',
    },
    {
      title: t('createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: tCommon('actions'),
      key: 'actions',
      render: (record: any) => (
        <Space>
          <PermissionGate permission={Permission.EXPORT_REPORTS}>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => exportReport(record.id, 'pdf')}
            >
              PDF
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => exportReport(record.id, 'excel')}
            >
              Excel
            </Button>
          </PermissionGate>
        </Space>
      ),
    },
  ];

  const handleGenerateReport = async (values: any) => {
    try {
      await generateReport({
        title: values.title,
        type: values.type,
        data: { summary: {}, details: [] },
        generatedBy: 'current-user-id', // In real app, get from session
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  return (
    <div className="p-lg">
      <div className="flex justify-between items-center m-lg">
        <Title level={2} className="text-primary-color">
          {t('title')}
        </Title>
        
        <Space>
          <Select
            placeholder={t('filterByType')}
            allowClear
            onChange={setSelectedType}
            style={{ width: 200 }}
          >
            <Option value={ReportType.FINANCIAL}>{t('financial')}</Option>
            <Option value={ReportType.CUSTOMER}>{t('customer')}</Option>
            <Option value={ReportType.TASK}>{t('task')}</Option>
            <Option value={ReportType.USER}>{t('user')}</Option>
          </Select>

          <PermissionGate permission={Permission.READ_REPORTS}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              {t('generateReport')}
            </Button>
          </PermissionGate>
        </Space>
      </div>

      <Card className="design-card">
        <Table
          columns={columns}
          dataSource={reports}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={t('generateReport')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleGenerateReport} layout="vertical">
          <Form.Item
            name="title"
            label={t('reportTitle')}
            rules={[{ required: true, message: t('titleRequired') }]}
          >
            <Input placeholder={t('enterTitle')} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('reportType')}
            rules={[{ required: true, message: t('typeRequired') }]}
          >
            <Select placeholder={t('selectType')}>
              <Option value={ReportType.FINANCIAL}>{t('financial')}</Option>
              <Option value={ReportType.CUSTOMER}>{t('customer')}</Option>
              <Option value={ReportType.TASK}>{t('task')}</Option>
              <Option value={ReportType.USER}>{t('user')}</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {t('generate')}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                {tCommon('cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportsPage;
