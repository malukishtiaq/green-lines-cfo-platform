// Presentation Layer - Custom Hooks for state management
import { useState, useEffect } from 'react';
import { User, Customer, Task, TaskStatus, UserRole, Partner } from '../../domain/entities';
import { 
  GetDashboardStatsUseCase, 
  GetCustomersUseCase, 
  GetTasksUseCase,
  CreateCustomerUseCase,
  CreateTaskUseCase,
  UpdateTaskStatusUseCase,
  GetPartnersUseCase,
  CreatePartnerUseCase,
  UpdatePartnerUseCase,
  DeletePartnerUseCase 
} from '../../application/use-cases';
import { RepositoryFactory } from '../../infrastructure/database';

// Dashboard Hook
export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeServicePlans: 0,
    completedTasks: 0,
    pendingTasks: 0,
    taskCompletionRate: 0,
    customerSatisfaction: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const useCase = new GetDashboardStatsUseCase(
          RepositoryFactory.getCustomerRepository(),
          RepositoryFactory.getTaskRepository(),
          RepositoryFactory.getServicePlanRepository()
        );
        const data = await useCase.execute();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error, refetch: () => window.location.reload() };
};

// Customers Hook
export const useCustomers = (status?: string) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const useCase = new GetCustomersUseCase(RepositoryFactory.getCustomerRepository());
        const data = await useCase.execute(status);
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [status]);

  const createCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const useCase = new CreateCustomerUseCase(RepositoryFactory.getCustomerRepository());
      const newCustomer = await useCase.execute(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      throw err;
    }
  };

  return { customers, loading, error, createCustomer };
};

// Tasks Hook
export const useTasks = (filters?: { customerId?: string; status?: string; assigneeId?: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const useCase = new GetTasksUseCase(RepositoryFactory.getTaskRepository());
        const data = await useCase.execute(filters);
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filters?.customerId, filters?.status, filters?.assigneeId]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const useCase = new CreateTaskUseCase(
        RepositoryFactory.getTaskRepository(),
        RepositoryFactory.getCustomerRepository()
      );
      const newTask = await useCase.execute(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus, updatedById: string) => {
    try {
      const useCase = new UpdateTaskStatusUseCase(RepositoryFactory.getTaskRepository());
      const updatedTask = await useCase.execute(taskId, status, updatedById);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
      throw err;
    }
  };

  return { tasks, loading, error, createTask, updateTaskStatus };
};

// Partners Hook
export const usePartners = (filters?: { country?: string; domain?: string; role?: string }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const useCase = new GetPartnersUseCase(RepositoryFactory.getPartnerRepository());
        const data = await useCase.execute(filters);
        setPartners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch partners');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [filters?.country, filters?.domain, filters?.role]);

  const createPartner = async (partnerData: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const useCase = new CreatePartnerUseCase(RepositoryFactory.getPartnerRepository());
      const newPartner = await useCase.execute(partnerData);
      setPartners(prev => [...prev, newPartner]);
      return newPartner;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create partner');
      throw err;
    }
  };

  const updatePartner = async (id: string, data: Partial<Partner>) => {
    try {
      const useCase = new UpdatePartnerUseCase(RepositoryFactory.getPartnerRepository());
      const updated = await useCase.execute(id, data);
      setPartners(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update partner');
      throw err;
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const useCase = new DeletePartnerUseCase(RepositoryFactory.getPartnerRepository());
      await useCase.execute(id);
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete partner');
      throw err;
    }
  };

  return { partners, loading, error, createPartner, updatePartner, deletePartner };
};

// Authentication Hook
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would integrate with NextAuth session
    // For now, we'll use mock data
    setUser({
      id: '1',
      email: 'admin@greenlines.com',
      name: 'Admin User',
      role: 'ADMIN' as UserRole,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setLoading(false);
  }, []);

  const signOut = () => {
    setUser(null);
    // This would call NextAuth signOut
  };

  return { user, loading, signOut };
};
