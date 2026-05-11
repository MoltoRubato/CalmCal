# CalmCal - Installation Guide for Clair Bear

A soft, local Chrome extension made just for you. It gives a gentle nudge when calendar planning goes on too long.
All data stays on your computer. No accounts, no tracking, no one watching except a tiny bunny.

---

## What you'll get

- A tiny mascot (bunny, cat, cloud, or flower -  your choice) that lives in your browser
- A gentle toast after ~10 minutes of active Google Calendar use
- A soft modal after ~18 minutes
- An optional "strict mode" that redirects to a breathing page after ~30 minutes
- Full control: pause it, change the timing, uninstall whenever

---

## How to install (takes about 2 minutes)

### Step 1 -  Get the files

**Option A: Download a ZIP from GitHub**
1. Go to the GitHub repository page (Ryan will send you the link)
2. Click the green **Code** button → **Download ZIP**
3. Unzip the folder somewhere you'll remember (e.g. your Desktop)

**Option B: Use git**
```
git clone <repo-url>
```

### Step 2 -  Load it into Chrome

1. Open Chrome and go to: **chrome://extensions**
2. Turn on **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `CalmCal` folder you downloaded/cloned

The CalmCal icon (a soft pink circle) will appear in your Chrome toolbar.
If you don't see it, click the puzzle-piece icon (Extensions) and pin CalmCal.

### Step 3 -  First run

A welcome tab will open automatically walking you through:
1. **Timing** -  how many minutes before the first nudge (8 / 12 / 20 min)
2. **Mascot** -  bunny, cat, cloud, or flower
3. **Strict mode** -  off by default; turn it on if you want a firmer nudge

That's it. CalmCal will now watch quietly in the background.

---

## Using CalmCal

### The nudges

| Time on Calendar | What happens |
|---|---|
| After your nudge threshold (default 10 min) | Small toast in the corner -  take a 30s pause, snooze 5 min, or keep going |
| ~1.6× the threshold (~16 min) | Soft blurred modal -  step away for 5 min, snooze, or pause for today |
| 3× the threshold (~30 min) | *Only if strict mode is on* -  8-second countdown, then redirects to the calm page |

All of these are opt-in. The first two you can always dismiss. Strict mode only activates if you turned it on yourself.

### The calm page

A gentle breathing animation with your chosen mascot. A 5-minute countdown. Click **I'm ready, go back** to return to Calendar whenever you like.

### The popup (click the toolbar icon)

- See how many minutes you've used today
- Change timing, strict mode, daily limit, cooldown, mascot, and colour palette
- **Pause CalmCal for today** -  one click, no nudges for the rest of the day

---

## Settings explained

| Setting | Default | What it does |
|---|---|---|
| Nudge after | 10 min | Minutes of active calendar use before Level 1 toast |
| Strict mode | Off | If on, redirects to calm page after 3× the threshold |
| Daily limit | 25 min | Optional cap -  triggers Level 2 if you hit it |
| Cooldown | 10 min | After the calm page, Calendar stays quiet for this long |
| Cute mode | Bunny | Which mascot appears in nudges |
| Pink intensity | Blush | Colour palette (blush / bubblegum / rose / dusty) |

---

## Privacy

- **No data leaves your browser.** Ever.
- CalmCal only knows you're on `calendar.google.com`. It does not read your events.
- All settings are stored locally in Chrome's extension storage.
- Uninstalling removes everything.

---

## Uninstalling

1. Go to **chrome://extensions**
2. Find CalmCal → click **Remove**

Done. Nothing is left behind.

---

## Updating

When a new version is available:
1. Download/pull the updated folder
2. Go to **chrome://extensions**
3. Click the **reload** icon (↻) next to CalmCal

---

## Troubleshooting

**The nudge isn't appearing**
- Make sure CalmCal is enabled in chrome://extensions
- Check that you're on `calendar.google.com` (not a Google Workspace subdomain)
- The timer only counts when the tab is active and the window is focused

**I accidentally paused it for today**
- Click the CalmCal icon → scroll down → the Pause button will show "Paused for today ✓"
- It resets automatically at midnight

**Developer mode warning in Chrome**
- Chrome shows a banner about developer mode -  this is normal for locally loaded extensions
- You can dismiss it; it doesn't affect anything
