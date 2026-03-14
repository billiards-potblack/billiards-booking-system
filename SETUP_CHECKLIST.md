# Quick Setup Checklist

Complete these steps to get your Billiards Booking System running in 15 minutes.

## ✅ Pre-Installation Checklist

- [ ] Computer/laptop available (Windows, Mac, or Linux)
- [ ] Internet connection for downloading Node.js
- [ ] Administrator access to install software
- [ ] Application files downloaded/extracted

## 📦 Step 1: Install Node.js (5 minutes)

### Windows/Mac Users:

1. - [ ] Go to https://nodejs.org/
2. - [ ] Download the LTS version (green button)
3. - [ ] Run the installer
4. - [ ] Keep clicking "Next" (default settings are fine)
5. - [ ] Click "Finish"

### Verify Installation:

6. - [ ] Open Command Prompt (Windows) or Terminal (Mac)
7. - [ ] Type: `node --version` and press Enter
8. - [ ] You should see: `v18.x.x` or similar
9. - [ ] Type: `npm --version` and press Enter
10. - [ ] You should see: `9.x.x` or similar

✅ If both commands show version numbers, Node.js is installed correctly!

## 🚀 Step 2: Install Application (2 minutes)

### Windows Users:

1. - [ ] Extract the `billiards-app` folder to `C:\billiards-app`
2. - [ ] Double-click `start.bat`
3. - [ ] Wait for dependencies to install (first time only)
4. - [ ] Browser opens automatically
5. - [ ] You should see the Billiards Booking System!

### Mac/Linux Users:

1. - [ ] Extract the `billiards-app` folder to your home directory
2. - [ ] Open Terminal
3. - [ ] Type: `cd billiards-app`
4. - [ ] Type: `chmod +x start.sh` (first time only)
5. - [ ] Type: `./start.sh`
6. - [ ] Wait for dependencies to install
7. - [ ] Browser opens automatically
8. - [ ] You should see the Billiards Booking System!

## ⚙️ Step 3: Configure Your Tables (3 minutes)

1. - [ ] Click **⚙️ Settings** tab
2. - [ ] Review the default configuration:
   - Super Standard (SS): 1 table, ₹220/hour
   - Standard (S): 2 tables, ₹200/hour
   - Medium (M): 3 tables, ₹160/hour

**If your setup is different:**

3. - [ ] Click **Edit** on table type to modify
4. - [ ] Change quantity, rate, or name
5. - [ ] Click **Save**
6. - [ ] Repeat for each table type

**If you have completely different tables:**

7. - [ ] Click **+ Add New Table Type**
8. - [ ] Fill in: Code, Name, Quantity, Rate
9. - [ ] Click **Add Table Type**
10. - [ ] Optional: Delete/set to 0 quantity the tables you don't have

## 🎮 Step 4: Test the System (5 minutes)

### Test Starting a Session:

1. - [ ] Go to **Dashboard** tab
2. - [ ] Click any **AVAILABLE** table (green)
3. - [ ] Enter test customer name: "Test Customer"
4. - [ ] Click **Start Session**
5. - [ ] Verify timer is running on the table

### Test Ending a Session:

6. - [ ] Click **End Session** on the active test table
7. - [ ] Enter amount paid: `100`
8. - [ ] Select payment method: `Cash`
9. - [ ] Click **End Session**
10. - [ ] Verify session ended successfully

### Test Reports:

11. - [ ] Click **Reports** tab
12. - [ ] Select **Daily** report
13. - [ ] Verify you see 1 booking for today
14. - [ ] Check that revenue shows ₹100

### Test Settings:

15. - [ ] Click **⚙️ Settings** tab
16. - [ ] Click **Edit** on any table type
17. - [ ] Change rate by ₹10
18. - [ ] Click **Save**
19. - [ ] Verify change appears in table

✅ **Congratulations!** Your system is working!

## 📝 Step 5: Clean Up Test Data (1 minute)

You now have a test booking in your system. You can:

**Option A: Keep it** (Recommended)
- Shows your staff how bookings appear
- Good for training purposes

**Option B: Delete it**
- Not recommended for beginners
- Requires database knowledge

**Option C: Start fresh**
- Close the server (Ctrl+C in command window)
- Delete `billiards.db` file
- Restart server (it recreates empty database)

## 🎓 Step 6: Train Your Staff

1. - [ ] Show them the **Dashboard** for daily operations
2. - [ ] Walk through starting a session
3. - [ ] Walk through ending a session
4. - [ ] Show the **Pending Payments** tab
5. - [ ] Print out **DAILY_OPERATIONS.md** for reference
6. - [ ] Restrict **Settings** tab to managers only

## 🔒 Step 7: Setup Security

### Backup Plan:

1. - [ ] Decide on backup location (USB drive, cloud, etc.)
2. - [ ] Create folder: `Billiards_Backups`
3. - [ ] Test copying `billiards.db` file to backup location
4. - [ ] Schedule weekly reminder to backup

### Access Control:

5. - [ ] If on network, note down server IP address
6. - [ ] Share IP only with authorized staff
7. - [ ] Consider password-protecting computer

## 📊 Next Steps

After running for a week:

- [ ] Review **Weekly Report** to see patterns
- [ ] Check **Pending Payments** regularly
- [ ] Adjust rates in **Settings** if needed
- [ ] Get feedback from staff on ease of use

## 🆘 Troubleshooting Common Issues

### Issue: Server won't start

**Solution:**
- Close any other programs using port 3001
- Restart computer
- Try running as administrator

### Issue: Browser doesn't open

**Solution:**
- Manually open browser
- Go to: `http://localhost:3001`
- Bookmark this page

### Issue: Tables not showing

**Solution:**
- Refresh browser (F5)
- Check if server window shows errors
- Restart server

### Issue: Changes not saving

**Solution:**
- Check internet connection (not needed, but helps)
- Look for error messages
- Try different browser

## 📞 Getting Help

**Before calling IT:**
1. Note the exact error message
2. Take a screenshot if possible
3. Note what you were doing when error occurred

**Document to check:**
- UI_OVERVIEW.md - Understand the interface
- DAILY_OPERATIONS.md - Common tasks
- TABLE_CONFIGURATION.md - Settings help
- README.md - Full documentation

## ✨ Success Indicators

Your system is working correctly if:

✅ Can start and end sessions  
✅ Timer runs on active tables  
✅ Reports show correct data  
✅ Can add payments to pending bookings  
✅ Can modify settings  
✅ All 6 tables visible on dashboard  

## 🎉 You're Done!

Your Billiards Booking System is now:
- ✅ Installed
- ✅ Configured  
- ✅ Tested
- ✅ Ready for daily use

**Pro Tips:**
1. Keep the server window open during business hours
2. Close it only when shutting down for the day
3. Bookmark `http://localhost:3001` in browser
4. Print DAILY_OPERATIONS.md for reception desk

**Remember:**
- Start server = Double-click `start.bat` (Windows) or `./start.sh` (Mac/Linux)
- Stop server = Press Ctrl+C in server window
- Backup = Copy `billiards.db` file weekly

---

**Setup Time:** ~15 minutes  
**Training Time:** ~30 minutes  
**Total Time to Live:** Under 1 hour!

Welcome to easier billiards management! 🎱
