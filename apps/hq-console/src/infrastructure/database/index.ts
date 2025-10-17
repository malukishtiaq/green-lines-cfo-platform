// Infrastructure Database Configuration
import { PrismaClient } from '@prisma/client';
import { 
  PrismaUserRepository,
  PrismaCustomerRepository,
  PrismaTaskRepository,
  PrismaServicePlanRepository
} from '../repositories';

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database connection utilities
export class DatabaseService {
  static async connect(): Promise<void> {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Database disconnection failed:', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

// Repository Factory - Dependency Injection Container
export class RepositoryFactory {
  private static userRepository: PrismaUserRepository;
  private static customerRepository: PrismaCustomerRepository;
  private static taskRepository: PrismaTaskRepository;
  private static servicePlanRepository: PrismaServicePlanRepository;

  static getUserRepository(): PrismaUserRepository {
    if (!this.userRepository) {
      this.userRepository = new PrismaUserRepository();
    }
    return this.userRepository;
  }

  static getCustomerRepository(): PrismaCustomerRepository {
    if (!this.customerRepository) {
      this.customerRepository = new PrismaCustomerRepository();
    }
    return this.customerRepository;
  }

  static getTaskRepository(): PrismaTaskRepository {
    if (!this.taskRepository) {
      this.taskRepository = new PrismaTaskRepository();
    }
    return this.taskRepository;
  }

  static getServicePlanRepository(): PrismaServicePlanRepository {
    if (!this.servicePlanRepository) {
      this.servicePlanRepository = new PrismaServicePlanRepository();
    }
    return this.servicePlanRepository;
  }
}
