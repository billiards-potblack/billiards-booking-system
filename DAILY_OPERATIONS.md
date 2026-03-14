# Daily Operations Guide

## Starting the System Each Day

### Windows
1. Double-click `start.bat`
2. Browser will open automatically
3. Leave the black command window open (this is the server)

### Mac/Linux
1. Open Terminal
2. Navigate to app folder: `cd /path/to/billiards-app`
3. Run: `./start.sh` (first time: `chmod +x start.sh`)
4. Browser will open automatically

## Common Tasks

### 1. Customer Walks In - Start Session

```
Dashboard → Click AVAILABLE table → Enter name → Start Session
```

**Example:**
- Customer: "Rajesh Kumar"
- Wants: Standard Table
- Click any green "AVAILABLE" Standard (S) table
- Type: "Rajesh Kumar"
- Click "Start Session"
- Timer starts automatically ✓

### 2. Customer Finishes - End Session & Collect Payment

```
Dashboard → Click "End Session" on active table → Enter payment → Submit
```

**Example:**
- Customer played 1.5 hours on Medium table (₹160/hr)
- System calculates: ₹240
- Enter: ₹240 in "Amount to Pay"
- Select: Cash
- Click "End Session"
- Receipt ready ✓

### 3. Partial Payment

```
Same as above but enter partial amount
Example: Total ₹240, paid ₹100
- Enter: ₹100
- Click "End Session"
- Shows: ₹140 pending ✓
```

### 4. Customer Pays Pending Amount Later

```
Pending Payments tab → Find customer → Add Payment
```

**Example:**
- Customer "Amit Shah" owes ₹140
- Go to "Pending Payments"
- Find "Amit Shah" in list
- Click "Add Payment"
- Enter: ₹140
- Submit ✓

## End of Day Tasks

### 1. View Daily Report

```
Reports tab → Daily → Select today's date → Review
```

Shows:
- Total bookings today
- Total revenue today
- Amount collected
- Amount pending
- Breakdown by table type

### 2. Print/Note Daily Summary

Record these numbers in your register:
- Total Revenue: ₹_____
- Cash Collected: ₹_____
- Pending: ₹_____
- Total Bookings: _____

### 3. Follow Up on Pending Payments

```
Pending Payments tab → Review list → Call/message customers
```

## Weekly Tasks

### Every Sunday Evening

1. **Generate Weekly Report**
   ```
   Reports → Weekly → Last 7 days
   ```

2. **Review Performance**
   - Which tables most used?
   - Peak hours?
   - Outstanding payments?

## Monthly Tasks

### End of Month

1. **Generate Monthly Report**
   ```
   Reports → Monthly → Select month
   ```

2. **Backup Database**
   - Copy `billiards.db` file
   - Save to USB drive / Cloud
   - Label: "Backup_Jan2024.db"

## Admin/Manager Tasks

### Changing Prices or Table Configuration

**Who can do this:** Only managers/owners  
**When to do:** Price changes, new tables, table removal

```
Settings (⚙️) tab → Edit table type → Change values → Save
```

**Common scenarios:**

1. **Increase Prices** (e.g., peak season)
   - Settings → Edit table type → Change rate → Save
   - Example: Medium ₹160 → ₹180

2. **Add New Tables** (bought more tables)
   - Settings → Edit table type → Increase quantity → Save
   - Example: Standard quantity 2 → 3

3. **Add Completely New Table Type**
   - Settings → Add New Table Type → Fill form → Submit
   - Example: Add "VIP Premium" at ₹300/hr

**Important:** 
- Price changes only affect NEW bookings
- Active sessions keep their original rate
- See TABLE_CONFIGURATION.md for full guide

## Quick Troubleshooting

### Problem: Table shows "IN USE" but no customer present

**Solution:**
1. Check if previous session wasn't ended
2. Find booking in "All Bookings" tab
3. Note booking ID
4. Manually end it

### Problem: Server window closed accidentally

**Solution:**
1. Double-click `start.bat` again
2. Refresh browser

### Problem: Wrong amount entered

**Solution:**
1. Note booking details
2. Can't undo in app (by design for audit)
3. Add note in next transaction
4. Or manually adjust in database (ask IT)

## Tips for Busy Times

### During Rush Hours

1. **Quick Entry:** Just enter first name if in hurry
2. **End in Batches:** End multiple sessions together
3. **Pending Payments:** Accept partial, collect later

### Multiple Customers Waiting

1. Prioritize ending active sessions (free tables)
2. Start new sessions
3. Collect payments later from "Pending Payments"

## Safety Reminders

✓ Never close server window while system in use
✓ Always end session before customer leaves
✓ Record at least partial payment immediately
✓ Backup database weekly
✓ Keep customer names accurate (for pending payments)

## Contact Numbers

- **IT Support:** _____________
- **Manager:** _____________
- **Owner:** _____________

## System Status Check

### Everything Working If:
- ✓ Green AVAILABLE tables are clickable
- ✓ Timer running on active tables
- ✓ Reports showing data
- ✓ Can start and end sessions

### Call IT Support If:
- ✗ Can't click tables
- ✗ Server window shows errors
- ✗ Numbers not calculating
- ✗ Browser shows connection error

---

**Last Updated:** [Date]
**Version:** 1.0
