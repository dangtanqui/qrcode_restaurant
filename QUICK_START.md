# Quick Start Guide

## ⚠️ If Ruby is not installed:

### Windows:
1. Download **Ruby+Devkit 3.2.x** from: https://rubyinstaller.org/downloads/
2. Install (✅ remember to check "Add Ruby executables to your PATH")
3. **Open a NEW PowerShell** and run:
   ```powershell
   ruby -v
   gem install rails
   rails -v
   ```

See detailed guide: `install-ruby-windows.md`

---

## ⚠️ If Node.js is not installed:

### Windows:
1. Download **Node.js LTS** from: https://nodejs.org/
2. Install (✅ remember to check "Add to PATH")
3. **Open a NEW PowerShell** and run:
   ```powershell
   node -v
   npm -v
   ```

See detailed guide: `install-nodejs-windows.md`

---

## ⚠️ If PostgreSQL is not installed:

### Windows:
1. Download **PostgreSQL 15** or **16** from: https://www.postgresql.org/download/windows/
2. Install (✅ remember to select "Command Line Tools" and set password for postgres user)
3. **Open a NEW PowerShell** and run:
   ```powershell
   psql --version
   ```
4. Check service is running:
   ```powershell
   Get-Service -Name postgresql*
   ```

See detailed guide: `install-postgresql-windows.md`

---

## ✅ If you already have Ruby, Node.js and PostgreSQL:

### 1. Check versions:
```powershell
ruby -v    # Need 3.2+
rails -v   # Need 7.1+
node -v    # Need 18+
npm -v
```

### 2. Setup Backend:
```powershell
cd backend
bundle install
rails db:create
rails db:migrate
rails server
```

### 3. Setup Frontend (New terminal):
```powershell
cd frontend
npm install
npm run dev
```

### 4. Open browser:
http://localhost:5173

---

> **For detailed setup instructions, see `setup-guide.md`**
