// Domain Repository Interfaces - Define contracts for data access
import { User, Customer, Task, ServicePlan, Partner, Contract, ContractTemplate, CompanyProfile } from '../entities';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  findByStatus(status: string): Promise<Customer[]>;
  create(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer>;
  update(id: string, customer: Partial<Customer>): Promise<Customer>;
  delete(id: string): Promise<void>;
}

export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByCustomerId(customerId: string): Promise<Task[]>;
  findByStatus(status: string): Promise<Task[]>;
  findByAssigneeId(assigneeId: string): Promise<Task[]>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
}

export interface IServicePlanRepository {
  findById(id: string): Promise<ServicePlan | null>;
  findAll(): Promise<ServicePlan[]>;
  findByCustomerId(customerId: string): Promise<ServicePlan[]>;
  findByType(type: string): Promise<ServicePlan[]>;
  create(servicePlan: Omit<ServicePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServicePlan>;
  update(id: string, servicePlan: Partial<ServicePlan>): Promise<ServicePlan>;
  delete(id: string): Promise<void>;
}

export interface IPartnerRepository {
  findById(id: string): Promise<Partner | null>;
  findAll(): Promise<Partner[]>;
  findByCountry(country: string): Promise<Partner[]>;
  findByDomain(domain: string): Promise<Partner[]>;
  findByRole(role: string): Promise<Partner[]>;
  create(partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Partner>;
  update(id: string, partner: Partial<Partner>): Promise<Partner>;
  delete(id: string): Promise<void>;
}

// Contracts
export interface ICompanyProfileRepository {
  findById(id: string): Promise<CompanyProfile | null>;
  findAll(): Promise<CompanyProfile[]>;
  findByBrand(brand: string): Promise<CompanyProfile[]>;
  create(profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompanyProfile>;
  update(id: string, profile: Partial<CompanyProfile>): Promise<CompanyProfile>;
  delete(id: string): Promise<void>;
}

export interface IContractTemplateRepository {
  findById(id: string): Promise<ContractTemplate | null>;
  findAll(): Promise<ContractTemplate[]>;
  findActiveByType(type: string): Promise<ContractTemplate[]>;
  create(template: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate>;
  update(id: string, template: Partial<ContractTemplate>): Promise<ContractTemplate>;
  delete(id: string): Promise<void>;
}

export interface IContractRepository {
  findById(id: string): Promise<Contract | null>;
  findAll(): Promise<Contract[]>;
  findByStatus(status: string): Promise<Contract[]>;
  create(contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract>;
  update(id: string, contract: Partial<Contract>): Promise<Contract>;
  delete(id: string): Promise<void>;
}
