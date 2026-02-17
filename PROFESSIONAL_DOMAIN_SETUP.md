# 🏥 PROFESSIONAL DOMAIN SETUP - GENIE Healthcare System

## 🎯 **OVERVIEW**
Your GENIE Healthcare Management System will be accessible via:
- **Primary Domain:** `http://genie.local:5173`
- **Alternative:** `http://healthcare.local:5173`
- **Admin Panel:** `http://admin.genie.local:5173`

---

## 📋 **STEP-BY-STEP SETUP INSTRUCTIONS**

### **STEP 1: Update Hosts File** ⚙️

#### **🪟 WINDOWS USERS:**
1. **Open Command Prompt as Administrator:**
   - Press `Win + X`
   - Select "Windows PowerShell (Admin)" or "Command Prompt (Admin)"

2. **Open hosts file:**
   ```cmd
   notepad C:\Windows\System32\drivers\etc\hosts
   ```

3. **Add these lines at the end:**
   ```
   # GENIE Healthcare System - Professional Development Environment
   127.0.0.1    genie.local
   127.0.0.1    healthcare.local  
   127.0.0.1    admin.genie.local
   127.0.0.1    api.genie.local
   
   # IPv6 Support
   ::1          genie.local
   ::1          healthcare.local
   ::1          admin.genie.local
   ::1          api.genie.local
   ```

4. **Save and close** the file

#### **🍎 MAC USERS:**
1. **Open Terminal**

2. **Edit hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

3. **Add these lines at the end:**
   ```
   # GENIE Healthcare System - Professional Development Environment
   127.0.0.1    genie.local
   127.0.0.1    healthcare.local  
   127.0.0.1    admin.genie.local
   127.0.0.1    api.genie.local
   
   # IPv6 Support
   ::1          genie.local
   ::1          healthcare.local
   ::1          admin.genie.local
   ::1          api.genie.local
   ```

4. **Save:** Press `Ctrl + X`, then `Y`, then `Enter`

#### **🐧 LINUX USERS:**
1. **Open Terminal**

2. **Edit hosts file:**
   ```bash
   sudo nano /etc/hosts
   ```

3. **Add the same lines as Mac users above**

4. **Save:** Press `Ctrl + X`, then `Y`, then `Enter`

---

### **STEP 2: Verify Configuration** ✅

#### **Test Domain Resolution:**

**Windows:**
```cmd
ping genie.local
nslookup genie.local
```

**Mac/Linux:**
```bash
ping genie.local
dig genie.local
```

**Expected Result:**
```
PING genie.local (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.036 ms
```

---

### **STEP 3: Start Development Server** 🚀

```bash
# Navigate to project directory
cd /workspace

# Start the professional development environment
npm run dev
```

**Expected Output:**
```
VITE v5.4.19  ready in XXX ms

➜  Local:   http://genie.local:5173/
➜  Network: use --host to expose
```

---

## 🌐 **PROFESSIONAL ACCESS URLS**

### **Primary Application:**
- **Main App:** `http://genie.local:5173/`
- **User Management:** `http://genie.local:5173/users`
- **Patients:** `http://genie.local:5173/patients`
- **Facilities:** `http://genie.local:5173/facilities`

### **Administrative:**
- **Security:** `http://genie.local:5173/security`
- **Testing:** `http://genie.local:5173/testing`
- **Verification:** `http://genie.local:5173/active-verification`

### **Alternative Access:**
- **Healthcare Portal:** `http://healthcare.local:5173/`
- **Admin Interface:** `http://admin.genie.local:5173/`

---

## 🔧 **TROUBLESHOOTING**

### **Issue: Domain Not Resolving**
**Solution:**
1. Verify hosts file was saved correctly
2. Restart browser completely
3. Clear browser DNS cache:
   - **Chrome:** `chrome://net-internals/#dns` → Clear host cache
   - **Firefox:** Restart browser
   - **Safari:** Restart browser

### **Issue: Permission Denied (Mac/Linux)**
**Solution:**
```bash
# Check file permissions
ls -la /etc/hosts

# Fix permissions if needed
sudo chmod 644 /etc/hosts
```

### **Issue: Port Already in Use**
**Solution:**
```bash
# Find what's using port 5173
netstat -tulpn | grep 5173

# Kill the process if needed
sudo kill -9 <PID>
```

### **Issue: Browser Shows "Site Can't Be Reached"**
**Solution:**
1. Verify development server is running
2. Check firewall settings
3. Try accessing `http://localhost:5173` first
4. Restart development server

---

## 🏥 **PROFESSIONAL FEATURES ENABLED**

### **✅ Benefits of This Setup:**
- **Professional URLs** → Looks like production environment
- **Consistent Branding** → GENIE domain throughout
- **Easy Sharing** → Team members can use same URLs
- **Production Simulation** → Tests real-world scenarios
- **Certificate Testing** → Can add SSL certificates later

### **✅ Development Workflow:**
1. **Start server:** `npm run dev`
2. **Auto-opens:** `http://genie.local:5173/`
3. **Test authentication** with professional URLs
4. **Share with team** using consistent domain names

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Local Development Only:**
- These domains only work on your local machine
- Not accessible from internet
- Safe for testing sensitive healthcare data
- HIPAA compliant for development environment

### **Production Preparation:**
- Easy to migrate to real domains later
- SSL/TLS certificates can be added
- Same URL structure as production
- Professional appearance for demos

---

## 📊 **QUICK VERIFICATION CHECKLIST**

- [ ] **Hosts file updated** with GENIE domains
- [ ] **Development server** starts without errors
- [ ] **Domain resolves** to 127.0.0.1
- [ ] **Browser opens** `http://genie.local:5173/`
- [ ] **Authentication form** displays correctly
- [ ] **All pages accessible** via professional URLs

---

## 🎯 **NEXT STEPS**

1. **Complete this setup** following the instructions above
2. **Test the authentication flow** at `http://genie.local:5173/`
3. **Verify all pages work** with the new professional URLs
4. **Report back** any issues or success!

**Professional healthcare domain setup complete!** 🏥✨