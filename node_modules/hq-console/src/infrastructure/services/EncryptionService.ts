import crypto from 'crypto';

/**
 * Encryption Service
 * 
 * Handles encryption/decryption of sensitive data like ERP credentials.
 * Uses AES-256-CBC encryption.
 * 
 * Environment Variables Required:
 * - ENCRYPTION_KEY: 32-character encryption key
 * - ENCRYPTION_IV: 16-character initialization vector
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-cbc';
  
  /**
   * Get encryption key from environment
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    
    if (!key) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is not set. Please add it to your .env file.'
      );
    }
    
    // Ensure key is exactly 32 bytes for AES-256
    if (key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be exactly 32 characters long for AES-256 encryption'
      );
    }
    
    return Buffer.from(key, 'utf-8');
  }
  
  /**
   * Get initialization vector from environment
   */
  private static getInitializationVector(): Buffer {
    const iv = process.env.ENCRYPTION_IV;
    
    if (!iv) {
      throw new Error(
        'ENCRYPTION_IV environment variable is not set. Please add it to your .env file.'
      );
    }
    
    // Ensure IV is exactly 16 bytes for AES
    if (iv.length !== 16) {
      throw new Error(
        'ENCRYPTION_IV must be exactly 16 characters long'
      );
    }
    
    return Buffer.from(iv, 'utf-8');
  }
  
  /**
   * Encrypt data
   * 
   * @param data - Object to encrypt (will be JSON stringified)
   * @returns Encrypted string
   */
  static encrypt(data: any): string {
    try {
      const key = this.getEncryptionKey();
      const iv = this.getInitializationVector();
      
      // Convert object to JSON string
      const text = JSON.stringify(data);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      // Encrypt
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return encrypted;
    } catch (error: any) {
      console.error('Encryption error:', error);
      throw new Error(`Failed to encrypt data: ${error.message}`);
    }
  }
  
  /**
   * Decrypt data
   * 
   * @param encryptedData - Encrypted string
   * @returns Decrypted object
   */
  static decrypt(encryptedData: string): any {
    try {
      const key = this.getEncryptionKey();
      const iv = this.getInitializationVector();
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      
      // Decrypt
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Parse JSON
      return JSON.parse(decrypted);
    } catch (error: any) {
      console.error('Decryption error:', error);
      throw new Error(`Failed to decrypt data: ${error.message}`);
    }
  }
  
  /**
   * Generate random encryption key (32 characters)
   * Use this to generate a new ENCRYPTION_KEY for your environment
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(16).toString('hex'); // 32 characters
  }
  
  /**
   * Generate random IV (16 characters)
   * Use this to generate a new ENCRYPTION_IV for your environment
   */
  static generateIV(): string {
    return crypto.randomBytes(8).toString('hex'); // 16 characters
  }
}

// Helper function to generate keys (run once to setup)
if (require.main === module) {
  console.log('Generated Encryption Keys:');
  console.log('==========================');
  console.log('ENCRYPTION_KEY=' + EncryptionService.generateEncryptionKey());
  console.log('ENCRYPTION_IV=' + EncryptionService.generateIV());
  console.log('\nAdd these to your .env.local file');
}

