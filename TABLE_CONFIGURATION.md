# Table Configuration Guide

## Overview

The **Settings** tab allows you to modify your table types, quantities, and pricing without touching any code or database. All changes are made through the web interface.

## Accessing Settings

Click the **⚙️ Settings** tab in the navigation menu.

## What You Can Modify

✅ **Table Code** - Short identifier (SS, S, M, etc.)  
✅ **Table Name** - Full descriptive name  
✅ **Quantity** - Number of tables of this type  
✅ **Rate per Hour** - Pricing in ₹  

## Editing Existing Table Types

### Step-by-Step

1. Go to **Settings** tab
2. Find the table type you want to modify
3. Click **Edit** button
4. Modify the fields you want to change:
   - **Code**: e.g., change "S" to "STD"
   - **Name**: e.g., change "Standard Table" to "Premium Standard"
   - **Quantity**: e.g., increase from 2 to 3 tables
   - **Rate**: e.g., increase from ₹200 to ₹220
5. Click **Save** to apply changes
6. Click **Cancel** if you change your mind

### Examples

**Example 1: Price Increase**
```
Current: Medium Table - ₹160/hour
Action: Click Edit → Change rate to ₹180 → Save
Result: New bookings will use ₹180/hour
```

**Example 2: Adding More Tables**
```
Current: Standard Table - Quantity: 2
Action: Click Edit → Change quantity to 3 → Save
Result: Dashboard now shows 3 Standard tables
```

**Example 3: Renaming**
```
Current: Super Standard Table (SS)
Action: Click Edit → Change name to "Premium Table" → Save
Result: Dashboard shows "Premium Table (SS)"
```

## Adding New Table Types

### When to Add

- You bought a new larger/smaller table
- You want to create a VIP/Premium category
- Expanding your business

### Step-by-Step

1. Go to **Settings** tab
2. Click **+ Add New Table Type** button
3. Fill in the form:
   - **Table Code**: Short code (2-3 characters recommended)
   - **Table Name**: Descriptive name
   - **Quantity**: How many tables
   - **Rate per Hour**: Pricing
4. Click **Add Table Type**

### Examples

**Example 1: Adding VIP Tables**
```
Code: VIP
Name: VIP Premium Table
Quantity: 1
Rate: ₹300

Result: New VIP table appears in dashboard
```

**Example 2: Adding Mini Tables**
```
Code: MINI
Name: Mini Practice Table
Quantity: 2
Rate: ₹100

Result: 2 Mini tables added to dashboard
```

## Deleting Table Types

### Important Rules

⚠️ **You can ONLY delete table types that have NO bookings**

This protects your historical data and reports.

### When Deletion Works

✅ Brand new table type just added by mistake  
✅ Table type never used for any booking  

### When Deletion Fails

❌ Table type has active bookings  
❌ Table type has historical bookings (even completed ones)  

### How to Delete

1. Go to **Settings** tab
2. Click **Delete** button for the table type
3. Confirm the deletion
4. If successful: Table type removed
5. If failed: Error message explains why

### What to Do If Can't Delete

If you have a table type with existing bookings that you no longer use:

**Option 1: Set Quantity to Zero**
```
Edit table type → Change Quantity to 0 → Save
```
This hides it from dashboard but keeps historical data.

**Option 2: Mark as Discontinued**
```
Edit table type → Change Name to "[DISCONTINUED] Standard Table" → Save
```
This keeps it visible in reports but clearly marked.

## Important Behaviors

### Price Changes

**NEW BOOKINGS**: Use the updated rate  
**ACTIVE BOOKINGS**: Keep the rate they started with  
**COMPLETED BOOKINGS**: Keep their original rate  

**Example:**
```
10:00 AM - Customer starts at ₹200/hour (old rate)
10:30 AM - You change rate to ₹220/hour
11:00 AM - First customer still pays ₹200/hour
11:30 AM - New customer pays ₹220/hour
```

This ensures:
- Fair to customers already playing
- All historical reports remain accurate
- No confusion about billing

### Quantity Changes

**Increasing Quantity:**
- New tables appear immediately on dashboard
- Available for booking right away

**Decreasing Quantity:**
- If tables are occupied beyond new quantity, they remain active
- No new bookings allowed beyond new limit
- Example: 3 tables → reduce to 2 → all 3 active sessions can finish, but only 2 can be started fresh

### Code/Name Changes

- Affects display immediately
- Historical bookings show under new name
- Reports group by table type ID (not name), so history preserved

## Common Scenarios

### Scenario 1: Seasonal Price Adjustment

**Situation:** Peak season, want to increase rates

**Action:**
1. Settings → Edit each table type
2. Increase rate by desired amount
3. Save

**Result:** New bookings use new rates, active sessions unaffected

---

### Scenario 2: New Table Arrival

**Situation:** Bought a new Super Standard table

**Action:**
1. Settings → Edit "Super Standard Table"
2. Change Quantity from 1 to 2
3. Save

**Result:** Dashboard shows 2 SS tables

---

### Scenario 3: Table Removal

**Situation:** One Medium table is broken/sold

**Action:**
1. Settings → Edit "Medium Table"
2. Change Quantity from 3 to 2
3. Save

**Result:** Dashboard shows 2 M tables

---

### Scenario 4: Complete Pricing Restructure

**Situation:** Want to simplify to just 2 categories

**Current:**
- SS: ₹220
- S: ₹200  
- M: ₹160

**New Plan:**
- Premium: ₹250 (2 tables)
- Standard: ₹180 (4 tables)

**Action:**
1. Add new "Premium" type (₹250, qty 2)
2. Add new "Standard" type (₹180, qty 4)
3. Set old table types quantity to 0 (or leave if you want historical data visible)

**Result:** Dashboard shows new structure, old bookings preserved in reports

## Tips & Best Practices

### 1. Test Price Changes at Off-Peak Times
- Make rate changes when no active sessions
- Easier to verify everything works

### 2. Keep Code Short & Consistent
- Good: SS, S, M, L, XL
- Avoid: SUPER_STANDARD, ST-1, TBL_STD

### 3. Descriptive Names
- Good: "Super Standard Table", "VIP Premium Table"
- Avoid: "Table 1", "Big One"

### 4. Don't Delete Unless Absolutely Necessary
- Better to set quantity to 0
- Preserves all historical data

### 5. Document Major Changes
Keep a simple log:
```
Jan 15, 2024 - Increased all rates by ₹20
Feb 1, 2024 - Added 2 new Medium tables
Mar 10, 2024 - Renamed "SS" to "Premium"
```

## Troubleshooting

### Problem: Can't save changes

**Possible Causes:**
- Missing required fields
- Duplicate table code
- Quantity set to negative number
- Rate set to zero or negative

**Solution:** Check form validation messages, ensure all fields valid

---

### Problem: Changes not showing on dashboard

**Solution:** 
- Refresh the browser page
- Go back to Dashboard tab and return

---

### Problem: Want to undo a change

**Solution:**
- Simply edit again and change back to original values
- System doesn't have "undo" but you can always re-edit

---

### Problem: Made a mistake and saved

**Solution:**
- Click Edit again
- Correct the mistake
- Save

## Security Note

⚠️ **Only authorized managers should access Settings tab**

Anyone with access to Settings can:
- Change all prices
- Add/remove table types
- Affect future revenue

**Recommendation:**
- Keep admin computer secure
- Don't leave browser open unattended
- Train only trusted staff on Settings

## Summary

The Settings feature gives you complete control over your billiards setup without needing technical knowledge. All changes are:
- ✅ Immediate
- ✅ Safe (protects historical data)
- ✅ Reversible (can always change back)
- ✅ Audit-friendly (all bookings keep their original rates)

**Remember:** When in doubt, it's always safer to add new table types rather than delete old ones!
