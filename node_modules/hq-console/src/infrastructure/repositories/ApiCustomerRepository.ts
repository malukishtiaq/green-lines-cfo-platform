// Infrastructure Layer - API Repository Implementation
import { httpClient, ApiResponse } from '../http/HttpClient';
import { Customer, CustomerStatus } from '../../domain/entities';
import { ICustomerRepository } from '../../domain/repositories';

export class ApiCustomerRepository implements ICustomerRepository {
  private baseUrl = '/customers';

  async findById(id: string): Promise<Customer | null> {
    try {
      const response = await httpClient.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<Customer | null> {
    try {
      const response = await httpClient.get<ApiResponse<Customer>>(`${this.baseUrl}/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer by email:', error);
      return null;
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      const response = await httpClient.get<ApiResponse<Customer[]>>(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      return [];
    }
  }

  async findByStatus(status: CustomerStatus): Promise<Customer[]> {
    try {
      const response = await httpClient.get<ApiResponse<Customer[]>>(`${this.baseUrl}?status=${status}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customers by status:', error);
      return [];
    }
  }

  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      const response = await httpClient.post<ApiResponse<Customer>>(this.baseUrl, customerData);
      return response.data;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  async update(id: string, customerData: Partial<Customer>): Promise<Customer> {
    try {
      const response = await httpClient.put<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await httpClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  }
}
