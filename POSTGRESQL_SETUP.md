# PostgreSQL Setup Guide

## Quick Answer

✅ **Only 3 small changes needed to use PostgreSQL instead of SQLite:**

1. Replace `package.json` with `package-postgresql.json`
2. Replace `server.js` with `server-postgresql.js`  
3. Update database credentials (5 lines)

**Total time: 5-10 minutes**

---

## What Changed?

### Key Differences:

| SQLite Version | PostgreSQL Version |
|----------------|-------------------|
| `sqlite3` library | `pg` library |
| File-based (`billiards.db`) | Server-based |
| `?` placeholders | `$1, $2` placeholders |
| `AUTOINCREMENT` | `SERIAL` |
| No setup needed | Need DB credentials |

### Files:

**For PostgreSQL:**
- `server-postgresql.js` (instead of `server.js`)
- `package-postgresql.json` (instead of `package.json`)
- `schema-postgresql.sql` (instead of `schema.sql`)

**Everything else stays the same:**
- ✅ `index.html` - No changes
- ✅ All documentation - No changes
- ✅ All features work identically

---

## Setup Instructions (PostgreSQL)

### Prerequisites

You need:
- ✅ PostgreSQL installed and running
- ✅ Database created (we'll call it `billiards`)
- ✅ Username and password

### Step 1: Create Database (2 minutes)

Open PostgreSQL command line or pgAdmin:

```sql
CREATE DATABASE billiards;
```

### Step 2: Configure Application (3 minutes)

#### Option A: Edit the server file (Easiest)

Open `server-postgresql.js` and find this section (around line 14):

```javascript
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'billiards',
    password: process.env.DB_PASSWORD || 'your_password_here',  // ← CHANGE THIS
    port: process.env.DB_PORT || 5432,
});
```

**Update these values:**
```javascript
const pool = new Pool({
    user: 'postgres',              // Your PostgreSQL username
    host: 'localhost',             // Your PostgreSQL host
    database: 'billiards',         // Database name you created
    password: 'MyActualPassword',  // ← Your PostgreSQL password
    port: 5432,                    // Default PostgreSQL port
});
```

#### Option B: Use Environment Variables (More secure)

Create a `.env` file in the app folder:

```bash
DB_USER=postgres
DB_HOST=localhost
DB_NAME=billiards
DB_PASSWORD=your_actual_password
DB_PORT=5432
```

No code changes needed! The server reads these automatically.

### Step 3: Install Dependencies (2 minutes)

**Windows:**
```bash
cd C:\billiards-app
copy package-postgresql.json package.json
npm install
```

**Mac/Linux:**
```bash
cd /path/to/billiards-app
cp package-postgresql.json package.json
npm install
```

### Step 4: Rename Server File (1 minute)

**Windows:**
```bash
rename server.js server-sqlite.js
rename server-postgresql.js server.js
```

**Mac/Linux:**
```bash
mv server.js server-sqlite.js
mv server-postgresql.js server.js
```

### Step 5: Update Schema Path (1 minute)

The PostgreSQL server looks for `schema-postgresql.sql`. It's already in the `database/` folder, so nothing to do!

### Step 6: Start Server (1 minute)

**Same as before:**
```bash
npm start
```

Or double-click `start.bat` (Windows) / run `./start.sh` (Mac/Linux)

You should see:
```
✓ Connected to PostgreSQL database
✓ Database initialized successfully

========================================
🎱 Billiards API Server (PostgreSQL)
========================================
Server running on http://localhost:3001
Database: PostgreSQL
========================================
```

---

## Verification

### Check Database Connection

Open PostgreSQL and run:

```sql
\c billiards
\dt
```

You should see:
```
           List of relations
 Schema |      Name       | Type  |  Owner   
--------+-----------------+-------+----------
 public | audit_log       | table | postgres
 public | bookings        | table | postgres
 public | payment_history | table | postgres
 public | table_types     | table | postgres
```

### Check Default Data

```sql
SELECT * FROM table_types;
```

You should see:
```
 id | type_code |      type_name       | quantity | price_per_hour 
----+-----------+----------------------+----------+----------------
  1 | SS        | Super Standard Table |        1 |         220.00
  2 | S         | Standard Table       |        2 |         200.00
  3 | M         | Medium Table         |        3 |         160.00
```

---

## Troubleshooting

### Error: "password authentication failed"

**Solution:** Check your password in `server-postgresql.js` or `.env` file

### Error: "database 'billiards' does not exist"

**Solution:** Create the database:
```sql
CREATE DATABASE billiards;
```

### Error: "Cannot find module 'pg'"

**Solution:** Install dependencies:
```bash
npm install
```

### Error: "ECONNREFUSED"

**Solution:** PostgreSQL isn't running. Start it:
- **Windows:** Services → PostgreSQL → Start
- **Mac:** `brew services start postgresql`
- **Linux:** `sudo systemctl start postgresql`

---

## Benefits of PostgreSQL vs SQLite

### Why Use PostgreSQL:

✅ **Multiple Users:** Better for concurrent access  
✅ **Performance:** Faster for large datasets  
✅ **Scalability:** Handles 1000s of bookings easily  
✅ **Network Access:** Can connect from multiple computers  
✅ **Production Ready:** Industry standard  
✅ **Advanced Features:** Better reporting, triggers, etc.  

### Why SQLite is Still Good:

✅ **Simple:** No database server needed  
✅ **Portable:** Single file database  
✅ **Zero Config:** Works immediately  
✅ **Small Scale:** Perfect for 1-2 concurrent users  

---

## Migration from SQLite to PostgreSQL (If Needed)

If you started with SQLite and want to switch:

### Option 1: Start Fresh
```bash
# Just start using PostgreSQL version
# Your old SQLite data stays in billiards.db
```

### Option 2: Export/Import Data
```bash
# Export from SQLite
sqlite3 billiards.db .dump > data.sql

# Import to PostgreSQL (requires some SQL editing)
psql billiards < data.sql
```

*Note: May need to adjust SQL syntax differences*

---

## Network Access (Bonus)

PostgreSQL makes it easy to access from multiple computers:

### Server Computer:

1. Edit `postgresql.conf`:
```
listen_addresses = '*'
```

2. Edit `pg_hba.conf`:
```
host    billiards    postgres    192.168.1.0/24    md5
```

3. Restart PostgreSQL

### Client Computers:

Update `server-postgresql.js`:
```javascript
host: '192.168.1.100',  // Server's IP address
```

---

## Backup with PostgreSQL

### Manual Backup:
```bash
pg_dump billiards > backup_$(date +%Y%m%d).sql
```

### Restore:
```bash
psql billiards < backup_20240115.sql
```

### Automated Backup (Linux):
Add to crontab:
```bash
0 2 * * * pg_dump billiards > /backup/billiards_$(date +\%Y\%m\%d).sql
```

---

## Environment-Specific Configuration

### Development:
```javascript
database: 'billiards_dev',
password: 'dev_password',
```

### Production:
```javascript
database: 'billiards_prod',
password: process.env.DB_PASSWORD,  // From environment
```

---

## Performance Tips

### Add Indexes (Already included):
```sql
-- Already in schema-postgresql.sql
CREATE INDEX idx_bookings_date ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Connection Pooling:
```javascript
// Already configured in server-postgresql.js
const pool = new Pool({
    max: 20,  // Max connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
```

---

## Security Best Practices

### 1. Never Commit Passwords
Add to `.gitignore`:
```
.env
```

### 2. Use Strong Passwords
```bash
# Generate strong password
openssl rand -base64 32
```

### 3. Restrict Access
```sql
-- Create limited user
CREATE USER billiards_app WITH PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE billiards TO billiards_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO billiards_app;
```

Update server:
```javascript
user: 'billiards_app',
password: 'strong_password',
```

---

## Summary

### To Use PostgreSQL:

1. ✅ Create database: `CREATE DATABASE billiards;`
2. ✅ Copy: `package-postgresql.json` → `package.json`
3. ✅ Rename: `server-postgresql.js` → `server.js`
4. ✅ Update password in `server.js` (line 18)
5. ✅ Run: `npm install`
6. ✅ Start: `npm start`

**That's it! Only 6 steps.**

### To Stick with SQLite:

Use the original files as-is. No changes needed!

---

## Still Deciding?

### Choose PostgreSQL if:
- Multiple staff will use simultaneously
- You need network access
- You plan to scale up
- You already have PostgreSQL

### Choose SQLite if:
- Single user/computer
- Want simplest possible setup
- Small operation (< 50 bookings/day)
- Don't want to manage database server

**Both work perfectly with the application!**

---

## Need Help?

Common issues:
1. Password error → Check credentials
2. Connection refused → Start PostgreSQL
3. Database not found → Create database
4. Module error → Run `npm install`

Everything else in the application works identically!
