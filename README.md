# Billiards Booking & Billing System

A simple, efficient web application for managing billiards table bookings, billing, and revenue tracking.

## Features

- **Real-time Table Management**: Track 6 tables (1 Super Standard, 2 Standard, 3 Medium)
- **Live Session Tracking**: See active sessions with running timers
- **Automatic Billing**: Calculate costs based on duration and table rates
- **Payment Management**: Track full, partial, and pending payments
- **Comprehensive Reports**: Daily, weekly, monthly, and yearly revenue reports
- **Audit Trail**: All data saved in database for record-keeping
- **Simple Interface**: Easy to use for admin staff
- **⚙️ Configurable Settings**: Modify table types, quantities, and rates through web interface - no coding needed!

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (default) or PostgreSQL (optional)
  - SQLite: Zero setup, works immediately
  - PostgreSQL: Better for multi-user, network access
  - See `DATABASE_COMPARISON.md` for guidance
- **Frontend**: React (single HTML file, no build process needed)
- **Deployment**: Can run on any computer or server

## Table Configuration

| Table Type | Code | Quantity | Rate/Hour |
|------------|------|----------|-----------|
| Super Standard | SS | 1 | ₹220 |
| Standard | S | 2 | ₹200 |
| Medium | M | 3 | ₹160 |

**✨ Good News:** These are just the default values! You can modify table types, quantities, and rates anytime through the **⚙️ Settings** tab in the application. No need to edit code or database files.

**See TABLE_CONFIGURATION.md for detailed instructions on:**
- Editing existing table types
- Adding new table types
- Changing quantities and prices
- Deleting table types

## Installation

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Step 1: Install Node.js

**Windows/Mac:**
1. Download from https://nodejs.org/
2. Run the installer
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install Application

**📌 Database Choice:**
- **SQLite (Default)**: No additional setup, works immediately
- **PostgreSQL**: If you prefer PostgreSQL, see `POSTGRESQL_SETUP.md` for 5-minute setup

**For SQLite (Recommended):**

1. Extract the application files to a folder (e.g., `C:\billiards-app` or `/home/user/billiards-app`)

2. Open terminal/command prompt in that folder

3. Install dependencies:
```bash
npm install
```

**For PostgreSQL:**

See `POSTGRESQL_SETUP.md` for complete instructions.

### Step 3: Start the Application

1. Start the backend server:
```bash
npm start
```

You should see:
```
Connected to SQLite database
Database initialized successfully
Billiards API server running on http://localhost:3001
```

2. Open the frontend:
   - Double-click `index.html` file, OR
   - Open your browser and go to the file location

## Usage Guide

### Starting a Session

1. Click on any **AVAILABLE** table card
2. Enter customer name
3. Click "Start Session"
4. Timer starts automatically

### Ending a Session

1. Click "End Session" on an active table
2. Enter amount paid (or leave blank for full payment later)
3. Select payment method
4. Add notes if needed
5. Click "End Session"

### Recording Payments

1. Go to "Pending Payments" tab
2. Find the booking
3. Click "Add Payment"
4. Enter payment amount and method
5. Submit

### Viewing Reports

1. Click "Reports" tab
2. Select report type (Daily/Weekly/Monthly/Yearly)
3. Choose date
4. View revenue breakdown by table type

## Database Backup

The database file is located at: `billiards-app/billiards.db`

**To backup:**
1. Stop the server (Ctrl+C)
2. Copy `billiards.db` to a safe location
3. Restart the server

**Schedule automatic backups:**
- Windows: Use Task Scheduler to copy file daily
- Linux/Mac: Use cron job

## Deployment Options

### Option 1: Single Computer (Simplest)

Run on reception computer, access locally only.

**Pros:** No network setup needed
**Cons:** Only one computer can access

### Option 2: Local Network

Run on one computer, access from multiple computers on same network.

1. Find server computer's IP address:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` or `ip addr`

2. On server computer, start application

3. On other computers, open browser and go to:
   ```
   http://[SERVER-IP]:3001
   ```
   Example: `http://192.168.1.100:3001`

4. Update `index.html` line:
   ```javascript
   const API_BASE = 'http://[YOUR-SERVER-IP]:3001/api';
   ```

### Option 3: Cloud Deployment

For accessing from anywhere with internet.

**Recommended platforms:**
- Heroku (free tier available)
- DigitalOcean
- AWS EC2
- Google Cloud

## Customization

### Changing Table Configuration

Edit `database/schema.sql` and modify the INSERT statement:

```sql
INSERT INTO table_types (type_code, type_name, quantity, price_per_hour) VALUES
('SS', 'Super Standard Table', 1, 220.00),
('S', 'Standard Table', 2, 200.00),
('M', 'Medium Table', 3, 160.00);
```

Then restart the server.

### Adding More Admin Users

Currently, all actions are recorded as 'Admin'. To add user authentication:
1. Add a login page
2. Store username in session
3. Pass username in API calls

## Troubleshooting

### Server won't start

**Error: Port 3001 already in use**
- Solution: Close other applications using that port, or change port in `server.js`

**Error: Cannot find module**
- Solution: Run `npm install` again

### Frontend can't connect to backend

**Error: Network error or CORS**
- Solution: Make sure server is running
- Check API_BASE URL in index.html matches server address

### Database errors

**Error: Database locked**
- Solution: Only run one server instance at a time

**Corrupted database**
- Solution: Restore from backup

## Data Management

### Exporting Data

Data can be exported using SQLite tools or by adding export features:

```bash
# Install SQLite command line tool
sqlite3 billiards.db

# Export to CSV
.mode csv
.output bookings.csv
SELECT * FROM bookings;
.quit
```

### Migrating from Excel

If you have existing Excel data:
1. Export Excel to CSV
2. Use SQLite import commands to load data
3. Or manually enter historical data through the application

## Security Recommendations

1. **Backup regularly**: Daily backups of `billiards.db`
2. **Access control**: If on network, use firewall rules
3. **Data privacy**: Store database securely
4. **User authentication**: Add login system if needed

## Support & Maintenance

### Regular Maintenance

- Weekly: Check disk space
- Monthly: Review database size, archive old records if needed
- Quarterly: Update Node.js and dependencies

### Performance

Current setup can handle:
- 10,000+ bookings
- 100+ concurrent users (with proper server)
- Years of historical data

## Future Enhancements

Possible additions:
- SMS notifications to customers
- Online booking portal for customers
- Mobile app
- Multi-location support
- Employee time tracking
- Inventory management for refreshments
- Integration with accounting software

## License

Free to use and modify for your business.

## Contact

For questions or support, contact your IT administrator.
