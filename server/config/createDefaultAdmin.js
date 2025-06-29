import Admin from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

export const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@dotburster.com' 
    });

    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return;
    }

    // Create default admin from environment variables
    const defaultAdmin = new Admin({
      email: process.env.ADMIN_EMAIL || 'admin@dotburster.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: process.env.ADMIN_NAME || 'Super Admin',
      upiId: process.env.ADMIN_UPI_ID || 'admin@paytm',
      upiQRCode: process.env.ADMIN_UPI_QR || 'https://via.placeholder.com/300x300?text=UPI+QR+CODE'
    });

    await defaultAdmin.save();
    console.log('✅ Default admin created successfully');
    console.log('🔐 Admin credentials configured from environment variables');

  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};