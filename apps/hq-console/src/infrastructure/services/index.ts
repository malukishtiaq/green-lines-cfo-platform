// Infrastructure Services - External System Integration
import { httpClient } from '../http/HttpClient';

export class EmailService {
  private emailProvider: any;

  constructor() {
    this.emailProvider = this.initializeEmailProvider();
  }

  async sendWelcomeEmail(to: string, data: { customerName: string; servicePlanName: string }) {
    const template = {
      to,
      subject: 'Welcome to Green Lines CFO!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1890ff;">Welcome ${data.customerName}!</h1>
          <p>Your service plan "${data.servicePlanName}" is now active.</p>
          <p>We're excited to work with you and help grow your business!</p>
          <div style="margin-top: 30px; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
            <h3>What's Next?</h3>
            <ul>
              <li>Your dedicated team will contact you within 24 hours</li>
              <li>You'll receive access to your dashboard</li>
              <li>We'll schedule your initial consultation</li>
            </ul>
          </div>
          <p style="margin-top: 30px;">Best regards,<br>The Green Lines CFO Team</p>
        </div>
      `,
    };

    try {
      await this.emailProvider.send(template);
      console.log(`✅ Welcome email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendTaskCompletionEmail(to: string, data: { customerName: string; taskTitle: string; completedBy: string }) {
    const template = {
      to,
      subject: 'Task Completed - Green Lines CFO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #52c41a;">Task Completed!</h1>
          <p>Hello ${data.customerName},</p>
          <p>Your task "<strong>${data.taskTitle}</strong>" has been completed by ${data.completedBy}.</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #f6ffed; border: 1px solid #b7eb8f; border-radius: 8px;">
            <p style="margin: 0; color: #389e0d;">✅ Task Status: Completed</p>
          </div>
          <p>Thank you for your business! If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The Green Lines CFO Team</p>
        </div>
      `,
    };

    try {
      await this.emailProvider.send(template);
      console.log(`✅ Task completion email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send task completion email:', error);
      throw error;
    }
  }

  async sendServiceCompletionEmail(to: string, data: { customerName: string; servicePlanName: string }) {
    const template = {
      to,
      subject: 'Service Plan Completed - Green Lines CFO',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1890ff;">Congratulations!</h1>
          <p>Hello ${data.customerName},</p>
          <p>All tasks for your service plan "<strong>${data.servicePlanName}</strong>" have been completed!</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 8px;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <ul>
              <li>Review the completed work in your dashboard</li>
              <li>Schedule a follow-up meeting if needed</li>
              <li>Consider upgrading to our premium service</li>
            </ul>
          </div>
          <p>We appreciate your business and look forward to continuing to serve you!</p>
          <p>Best regards,<br>The Green Lines CFO Team</p>
        </div>
      `,
    };

    try {
      await this.emailProvider.send(template);
      console.log(`✅ Service completion email sent to ${to}`);
    } catch (error) {
      console.error('❌ Failed to send service completion email:', error);
      throw error;
    }
  }

  private initializeEmailProvider() {
    // Mock email provider - in production, use SendGrid, AWS SES, etc.
    return {
      send: async (template: any) => {
        console.log('📧 Mock Email Sent:', {
          to: template.to,
          subject: template.subject,
        });
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
      },
    };
  }
}

export class PaymentService {
  private paymentProvider: any;

  constructor() {
    this.paymentProvider = this.initializePaymentProvider();
  }

  async processPayment(paymentData: {
    customerId: string;
    amount: number;
    servicePlanId: string;
    currency?: string;
  }) {
    try {
      const payment = await this.paymentProvider.charges.create({
        amount: paymentData.amount * 100, // Convert to cents
        currency: paymentData.currency || 'usd',
        customer: paymentData.customerId,
        metadata: {
          servicePlanId: paymentData.servicePlanId,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`✅ Payment processed: ${payment.id} - $${paymentData.amount}`);
      return payment;
    } catch (error) {
      console.error('❌ Payment failed:', error);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string) {
    try {
      const refund = await this.paymentProvider.refunds.create({
        payment_intent: paymentId,
        amount: amount ? amount * 100 : undefined,
        reason: reason || 'requested_by_customer',
      });

      console.log(`✅ Payment refunded: ${refund.id} - $${amount || 'full'}`);
      return refund;
    } catch (error) {
      console.error('❌ Refund failed:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount: number, customerId: string) {
    try {
      const paymentIntent = await this.paymentProvider.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Failed to create payment intent:', error);
      throw error;
    }
  }

  private initializePaymentProvider() {
    // Mock payment provider - in production, use Stripe, PayPal, etc.
    return {
      charges: {
        create: async (data: any) => {
          console.log('💳 Mock Payment Processed:', data);
          await new Promise(resolve => setTimeout(resolve, 200));
          return { 
            id: `mock_payment_${Date.now()}`, 
            status: 'succeeded',
            amount: data.amount,
            currency: data.currency,
          };
        },
      },
      refunds: {
        create: async (data: any) => {
          console.log('💸 Mock Refund Processed:', data);
          await new Promise(resolve => setTimeout(resolve, 200));
          return { 
            id: `mock_refund_${Date.now()}`, 
            status: 'succeeded',
            amount: data.amount,
          };
        },
      },
      paymentIntents: {
        create: async (data: any) => {
          console.log('🎯 Mock Payment Intent Created:', data);
          await new Promise(resolve => setTimeout(resolve, 100));
          return { 
            id: `mock_intent_${Date.now()}`, 
            status: 'requires_payment_method',
            client_secret: `mock_secret_${Date.now()}`,
          };
        },
      },
    };
  }
}

export class NotificationService {
  async sendSMS(phoneNumber: string, message: string) {
    try {
      // Mock SMS service - in production, use Twilio, AWS SNS, etc.
      console.log(`📱 Mock SMS Sent to ${phoneNumber}: ${message}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      throw error;
    }
  }

  async sendPushNotification(userId: string, title: string, body: string) {
    try {
      // Mock push notification - in production, use Firebase, OneSignal, etc.
      console.log(`🔔 Mock Push Notification to ${userId}: ${title} - ${body}`);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      throw error;
    }
  }

  async notifyAdmin(notification: {
    type: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    try {
      // Mock admin notification - in production, use Slack, Discord, etc.
      console.log(`🔔 Mock Admin Notification [${notification.type}]: ${notification.message}`);
      if (notification.data) {
        console.log('📊 Notification Data:', notification.data);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('❌ Failed to send admin notification:', error);
      throw error;
    }
  }
}

export class FileService {
  async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    try {
      // Mock file upload - in production, use AWS S3, Cloudinary, etc.
      const fileName = `${folder}/${Date.now()}_${file.name}`;
      console.log(`📁 Mock File Uploaded: ${fileName} (${file.size} bytes)`);
      await new Promise(resolve => setTimeout(resolve, 300));
      return fileName;
    } catch (error) {
      console.error('❌ Failed to upload file:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      // Mock file deletion
      console.log(`🗑️ Mock File Deleted: ${filePath}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('❌ Failed to delete file:', error);
      throw error;
    }
  }

  async generateFileUrl(filePath: string): Promise<string> {
    // Mock file URL generation
    return `https://mock-storage.com/${filePath}`;
  }
}

export class AuditService {
  async logEvent(event: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown>;
  }) {
    try {
      const auditLog = {
        ...event,
        timestamp: new Date().toISOString(),
        ip: '127.0.0.1', // In production, get from request
        userAgent: 'Mock User Agent', // In production, get from request
      };

      // Mock audit logging - in production, use database or external service
      console.log(`📝 Mock Audit Log:`, auditLog);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error('❌ Failed to log audit event:', error);
      throw error;
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      // Mock audit log retrieval
      console.log(`📋 Mock Audit Logs Retrieved:`, filters);
      await new Promise(resolve => setTimeout(resolve, 100));
      return []; // Return mock audit logs
    } catch (error) {
      console.error('❌ Failed to retrieve audit logs:', error);
      throw error;
    }
  }
}
