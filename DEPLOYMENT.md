# 🚀 Deployment Guide for Make It Meme

## 🌐 Frontend Deployment (Vercel)

### 1. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel
```

### 2. **Set Environment Variables in Vercel Dashboard**
Go to your Vercel project dashboard → Settings → Environment Variables:

```env
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_UPLOAD_URL=https://your-backend-domain.com/upload
```

### 3. **Update vercel.json**
Replace `your-backend-domain.com` with your actual backend URL.

## 🖥️ Backend Deployment Options

### **Option A: Railway (Recommended for beginners)**
1. **Push to GitHub**
2. **Connect Railway to GitHub**
3. **Deploy from `server/` directory**
4. **Set environment variables:**
   ```env
   PORT=3001
   NODE_ENV=production
   ```

### **Option B: Heroku**
1. **Create Heroku app**
2. **Set buildpack to Node.js**
3. **Deploy from `server/` directory**
4. **Set environment variables in Heroku dashboard**

### **Option C: DigitalOcean App Platform**
1. **Connect GitHub repository**
2. **Select `server/` as source directory**
3. **Set environment variables**

### **Option D: Self-hosted VPS**
1. **Upload server files to VPS**
2. **Install Node.js and PM2**
3. **Run with PM2:**
   ```bash
   pm2 start server.js --name "make-it-meme"
   ```

## 🔧 Backend Configuration

### **Update CORS in server.js**
```javascript
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173",           // Local development
      "https://your-frontend-domain.vercel.app",  // Vercel frontend
      "https://your-custom-domain.com"   // Custom domain
    ],
    methods: ["GET", "POST"]
  }
});
```

### **Update Image Upload URLs**
```javascript
const imageUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/${req.file.filename}`;
```

## 📱 Environment Variables Summary

### **Frontend (.env.local for development)**
```env
VITE_SOCKET_URL=http://localhost:3001
VITE_UPLOAD_URL=http://localhost:3001/upload
```

### **Frontend (Vercel)**
```env
VITE_SOCKET_URL=https://your-backend-domain.com
VITE_UPLOAD_URL=https://your-backend-domain.com/upload
```

### **Backend**
```env
PORT=3001
NODE_ENV=production
BASE_URL=https://your-backend-domain.com
```

## 🎯 Complete Deployment Steps

1. **Deploy backend first** (Railway/Heroku/etc.)
2. **Get backend URL** (e.g., `https://your-app.railway.app`)
3. **Update frontend config** with backend URL
4. **Deploy frontend to Vercel**
5. **Set environment variables in Vercel**
6. **Test the connection**

## 🐛 Common Issues

### **CORS Errors**
- Ensure backend CORS includes your Vercel domain
- Check that environment variables are set correctly

### **Socket.IO Connection Refused**
- Verify backend is running and accessible
- Check `VITE_SOCKET_URL` environment variable
- Ensure backend CORS allows your frontend domain

### **Image Upload Fails**
- Check `VITE_UPLOAD_URL` environment variable
- Verify backend upload endpoint is working
- Check file size limits (5MB)

## 🔍 Testing Deployment

1. **Check backend health:** `https://your-backend.com/health`
2. **Test Socket.IO connection** in browser console
3. **Try creating a lobby** and uploading images
4. **Test multiplayer functionality** with multiple browser tabs

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Test backend endpoints directly
4. Check CORS configuration
5. Ensure both frontend and backend are deployed and running
