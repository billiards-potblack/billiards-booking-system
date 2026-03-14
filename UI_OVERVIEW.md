# User Interface Overview

## Application Layout

### Header (Purple Gradient)
```
🎱 Billiards Booking System
Manage your billiards tables, bookings, and revenue
```

### Navigation Tabs (White Bar)
```
[ Dashboard ] [ All Bookings ] [ Reports ] [ Pending Payments ] [ ⚙️ Settings ]
```

---

## 1. Dashboard Tab (Main Screen)

### Active Tables Section

**Layout:** Grid of cards (3 columns on desktop, 1 on mobile)

**Available Table Card (Green Border):**
```
┌──────────────────────────────┐
│ SS - Table 1    [AVAILABLE]  │  ← Green badge
├──────────────────────────────┤
│ Super Standard Table         │
│ ₹220/hour                    │
│                              │
│  [   Start Session   ]       │  ← Green button
└──────────────────────────────┘
```

**Active Table Card (Red Border):**
```
┌──────────────────────────────┐
│ M - Table 2      [IN USE]    │  ← Red badge
├──────────────────────────────┤
│ Customer: Rajesh Kumar       │
│ Started: 2:30 PM             │
│     02:15:43                 │  ← Running timer (Red)
│ ₹160/hour                    │
│                              │
│  [   End Session   ]         │  ← Red button
└──────────────────────────────┘
```

### Complete Dashboard View Example
```
Dashboard Tab - Shows all 6 tables:

Row 1:
[SS-1 AVAILABLE]  

Row 2:
[S-1 IN USE]      [S-2 AVAILABLE]

Row 3:
[M-1 AVAILABLE]   [M-2 IN USE]      [M-3 AVAILABLE]
```

---

## 2. Start Session Modal (Popup)

**When clicking available table:**

```
┌─────────────────────────────────┐
│  Start New Session           ×  │
├─────────────────────────────────┤
│                                 │
│  Table:  [SS - Table 1      ]  │  ← Disabled/grayed
│                                 │
│  Rate:   [₹220/hour         ]  │  ← Disabled/grayed
│                                 │
│  Customer Name: *               │
│  [________________]             │  ← Text input
│                                 │
│                                 │
│  [    Start Session    ]        │  ← Blue button
│                                 │
└─────────────────────────────────┘
```

---

## 3. End Session Modal (Popup)

**When clicking "End Session" on active table:**

```
┌─────────────────────────────────┐
│  End Session                 ×  │
├─────────────────────────────────┤
│                                 │
│  Customer:  [Rajesh Kumar   ]  │  ← Disabled
│                                 │
│  Amount to Pay:                 │
│  [________________]             │  ← Number input
│                                 │
│  Payment Method:                │
│  [Cash ▼]                       │  ← Dropdown
│                                 │
│  Notes:                         │
│  [________________]             │  ← Text area
│  [                ]             │
│  [                ]             │
│                                 │
│  [    End Session    ]          │  ← Red button
│                                 │
└─────────────────────────────────┘
```

---

## 4. All Bookings Tab

**Filter Section:**
```
┌─────────────────────────────────────────────────────┐
│ Status:        [All ▼]     Payment:   [All ▼]       │
│ Start Date:    [____/____/____]  End Date: [____]   │
└─────────────────────────────────────────────────────┘
```

**Bookings Table:**
```
┌───────────────────────────────────────────────────────────────────────┐
│ ID │ Date       │ Customer      │ Table │ Duration │ Total │ Paid │ Pending │ Status │
├────┼────────────┼───────────────┼───────┼──────────┼───────┼──────┼─────────┼────────┤
│ 45 │ 2024-01-15 │ Rajesh Kumar  │ M-2   │ 90 min   │ ₹240  │ ₹240 │ ₹0      │ [paid] │
│ 44 │ 2024-01-15 │ Amit Shah     │ S-1   │ 120 min  │ ₹400  │ ₹200 │ ₹200    │ [partial]│
│ 43 │ 2024-01-14 │ Priya Sharma  │ SS-1  │ 60 min   │ ₹220  │ ₹0   │ ₹220    │ [pending]│
└───────────────────────────────────────────────────────────────────────┘

Badges color-coded:
- [paid] = Green
- [partial] = Orange
- [pending] = Red
```

---

## 5. Reports Tab

**Report Type Selection:**
```
┌──────────────────────────────────────┐
│ Report Type: [Daily ▼]    Date: [____]│
└──────────────────────────────────────┘

Options: Daily, Weekly, Monthly, Yearly
```

**Statistics Cards (4 cards in a row, purple gradient):**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Total Bookings│ │Total Revenue │ │  Total Paid  │ │Total Pending │
│              │ │              │ │              │ │              │
│      24      │ │   ₹5,240.00  │ │  ₹4,800.00   │ │   ₹440.00    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Breakdown by Table Type:**
```
┌──────────────────────────────────────────────────────┐
│ Table Type           │ Bookings │ Revenue │ Hours   │
├──────────────────────┼──────────┼─────────┼─────────┤
│ Super Standard Table │    8     │ ₹1,760  │  8.0    │
│ Standard Table       │   10     │ ₹2,000  │  10.0   │
│ Medium Table         │    6     │ ₹960    │  6.0    │
└──────────────────────────────────────────────────────┘
```

---

## 6. Pending Payments Tab

**Summary Cards:**
```
┌──────────────┐ ┌──────────────┐
│Total Pending │ │Amount Pending│
│              │ │              │
│      12      │ │  ₹2,840.00   │
└──────────────┘ └──────────────┘
```

**Pending Payments Table:**
```
┌────────────────────────────────────────────────────────────────────────┐
│ Date       │ Customer      │ Table │ Total │ Paid  │ Pending │ Action  │
├────────────┼───────────────┼───────┼───────┼───────┼─────────┼─────────┤
│ 2024-01-15 │ Amit Shah     │ S-1   │ ₹400  │ ₹200  │ ₹200    │ [Add Payment]│
│ 2024-01-14 │ Priya Sharma  │ SS-1  │ ₹220  │ ₹0    │ ₹220    │ [Add Payment]│
│ 2024-01-13 │ Vijay Kumar   │ M-3   │ ₹320  │ ₹100  │ ₹220    │ [Add Payment]│
└────────────────────────────────────────────────────────────────────────┘
```

**Add Payment Modal:**
```
┌─────────────────────────────────┐
│  Record Payment              ×  │
├─────────────────────────────────┤
│                                 │
│  Customer:   [Amit Shah     ]  │  ← Disabled
│  Total Amount: [₹400        ]  │  ← Disabled
│  Already Paid: [₹200        ]  │  ← Disabled
│                                 │
│  Payment Amount: *              │
│  [________________]             │  ← Number input
│                                 │
│  Payment Method:                │
│  [Cash ▼]                       │  ← Dropdown
│                                 │
│  Notes:                         │
│  [________________]             │  
│                                 │
│  [   Record Payment   ]         │  ← Blue button
│                                 │
└─────────────────────────────────┘
```

---

## 7. Settings Tab ⚙️ (NEW!)

**Header with Add Button:**
```
┌──────────────────────────────────────────────────┐
│  Table Configuration      [+ Add New Table Type] │
└──────────────────────────────────────────────────┘
```

**Warning Box (Yellow background):**
```
┌──────────────────────────────────────────────────┐
│ ⚠️ Important: Changing rates will only affect   │
│ NEW bookings. Active and completed bookings     │
│ keep their original rates.                      │
└──────────────────────────────────────────────────┘
```

**Configuration Table:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Code │ Table Name           │ Quantity │ Rate/Hour │ Actions       │
├──────┼──────────────────────┼──────────┼───────────┼───────────────┤
│ SS   │ Super Standard Table │    1     │   ₹220    │ [Edit][Delete]│
│ S    │ Standard Table       │    2     │   ₹200    │ [Edit][Delete]│
│ M    │ Medium Table         │    3     │   ₹160    │ [Edit][Delete]│
└────────────────────────────────────────────────────────────────────┘
```

**When Editing (Row becomes editable):**
```
┌────────────────────────────────────────────────────────────────────┐
│ Code │ Table Name           │ Quantity │ Rate/Hour │ Actions       │
├──────┼──────────────────────┼──────────┼───────────┼───────────────┤
│ [SS] │ [Standard Table   ]  │   [2]    │  [200]    │ [Save][Cancel]│
│ S    │ Standard Table       │    2     │   ₹200    │ [Edit][Delete]│
│ M    │ Medium Table         │    3     │   ₹160    │ [Edit][Delete]│
└────────────────────────────────────────────────────────────────────┘
           ↑ Text input boxes appear
```

**Add New Table Type Modal:**
```
┌─────────────────────────────────┐
│  Add New Table Type          ×  │
├─────────────────────────────────┤
│                                 │
│  Table Code: *                  │
│  [____]                         │
│  Short code like SS, S, M, L    │
│                                 │
│  Table Name: *                  │
│  [___________________]          │
│                                 │
│  Quantity: *                    │
│  [____]                         │
│  Number of tables of this type  │
│                                 │
│  Rate per Hour (₹): *           │
│  [____]                         │
│                                 │
│  [   Add Table Type   ]         │
│                                 │
└─────────────────────────────────┘
```

---

## Color Scheme

**Primary Colors:**
- Purple/Violet gradient: `#667eea → #764ba2` (Header, buttons, stats)
- White: `#ffffff` (Cards, background)
- Light gray: `#f5f7fa` (Page background)

**Status Colors:**
- Green: Available tables, paid status
- Red: Active tables, pending status  
- Orange: Partial payment status
- Blue: Primary action buttons

**Button Colors:**
- Blue (`#667eea`): Primary actions (Start, Add Payment)
- Red (`#f56565`): End Session, Delete
- Green (`#48bb78`): Success, Save
- Gray (`#e2e8f0`): Cancel, Disabled

---

## Responsive Design

**Desktop (>1024px):**
- Tables in 3-column grid
- All navigation visible
- Wide tables with all columns

**Tablet (768-1024px):**
- Tables in 2-column grid
- Compact navigation
- Scrollable tables

**Mobile (<768px):**
- Tables in 1-column stack
- Hamburger menu (if implemented)
- Card-based booking list instead of table

---

## Success/Error Messages

**Success Message (Green):**
```
┌──────────────────────────────────┐
│ ✓ Session started successfully!  │
└──────────────────────────────────┘
```

**Error Message (Red):**
```
┌──────────────────────────────────┐
│ ✗ Error: Customer name required  │
└──────────────────────────────────┘
```

Messages appear at top of page and auto-dismiss after 3 seconds.

---

## Professional Polish Features

✅ Smooth transitions and hover effects  
✅ Box shadows for depth  
✅ Rounded corners (12px radius)  
✅ Consistent spacing (20px, 15px, 10px)  
✅ Clean typography (System fonts)  
✅ Color-coded status badges  
✅ Real-time timer updates  
✅ Intuitive icons and labels  
✅ Mobile-friendly design  

---

This UI is designed to be:
- **Professional** - Looks like a commercial product
- **Intuitive** - Anyone can use it without training
- **Efficient** - Minimal clicks for common tasks
- **Informative** - All key info visible at a glance
- **Configurable** - Settings can be changed without coding
