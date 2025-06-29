# 🚀 Complete Render Deployment Guide for Dot Burster

## 📋 Prerequisites
- GitHub repository with your code
- Render account (free tier available)
- MongoDB Atlas account (for database)

## 🎯 Quick Deploy (Recommended)

### Option 1: Using Blueprint (Automatic)
1. **Connect Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will detect `render.yaml` and create both services

2. **Set Environment Variables:**
   ```bash
   # Backend Environment Variables (Set in Render Dashboard)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dotburster
   JWT_SECRET=your-super-secret-jwt-key-here
   ADMIN_EMAIL=admin@dotburster.com
   ADMIN_PASSWORD=your-secure-admin-password
   ADMIN_NAME=Super Admin
   ADMIN_UPI_ID=admin@paytm
   ADMIN_UPI_QR=https://your-qr-code-url.com/qr.png
   ```

3. **Deploy:**
   - Click "Apply" in Render
   - Wait for both services to deploy
   - ✅ Done!

---

## 🔧 Manual Deploy (Alternative)

### Step 1: Deploy Backend
1. **Create Web Service:**
   - New → Web Service
   - Connect GitHub repo
   - Name: `dot-burster-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ADMIN_EMAIL=admin@dotburster.com
   ADMIN_PASSWORD=your_password
   ```

### Step 2: Deploy Frontend
1. **Create Static Site:**
   - New → Static Site
   - Connect same GitHub repo
   - Name: `dot-burster-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Set Environment Variables:**
   ```bash
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

---

## 🌐 Expected URLs
- **Frontend:** `https://dot-burster-1.onrender.com`
- **Backend:** `https://dot-burster.onrender.com`
- **Admin Panel:** `https://dot-burster-1.onrender.com/admin`

---

## 🔍 Troubleshooting

### ❌ "NOT FOUND" on Page Refresh
**Problem:** SPA routing not configured
**Solution:** ✅ Fixed with `render.yaml` routes configuration

### ❌ CORS Errors
**Problem:** Frontend can't connect to backend
**Solution:** 
1. Check `VITE_API_URL` environment variable
2. Verify backend CORS settings include frontend URL

### ❌ Database Connection Failed
**Problem:** MongoDB connection issues
**Solution:**
1. Check `MONGODB_URI` format
2. Whitelist Render IPs in MongoDB Atlas
3. Use connection string with `retryWrites=true&w=majority`

### ❌ Build Failures
**Problem:** Dependencies or build errors
**Solution:**
1. Check Node.js version (18+ required)
2. Clear cache and redeploy
3. Check build logs for specific errors

---

## 📊 Health Checks
- **Backend Health:** `https://your-backend-url.onrender.com/health`
- **Frontend:** Should load without errors

---

## 🔐 Security Notes
1. **Never commit sensitive data** to GitHub
2. **Use strong passwords** for admin accounts
3. **Rotate JWT secrets** regularly
4. **Monitor logs** for suspicious activity

---

## 🚀 Post-Deployment
1. **Test all features:**
   - User registration/login
   - Demo game
   - Real multiplayer games
   - Payment system
   - Admin panel

2. **Monitor performance:**
   - Check Render metrics
   - Monitor database usage
   - Watch for errors in logs

---

## 📞 Support
If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints manually
4. Check MongoDB Atlas connection

**Your Dot Burster game is now live and ready for players!** 🎯✨
