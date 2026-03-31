# 🔥 TimeForge Supabase Integration Guide

This guide will help you connect your TimeForge timetable generator to Supabase for cloud storage and user authentication.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Setup Instructions](#setup-instructions)
4. [Supabase Operations](#supabase-operations)
5. [Testing](#testing)

---

## 🎯 Overview

The TimeForge app now stores **saved timetables** in Supabase with:
- ✅ User authentication (each user sees only their own timetables)
- ✅ Row Level Security (RLS) policies
- ✅ Real-time sync capabilities
- ✅ Cloud backup of all timetable data

### What Gets Saved?

Each saved timetable includes:
- General configuration (periods, duration, working days, etc.)
- Branches, subjects, labs, combined classes, confirmed classes
- Generated timetable grids for all branches
- Subject colors and generation warnings

---

## 🗄️ Database Schema

The app uses a single table: **`saved_timetables`**

### Table Structure

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to `auth.users` |
| `name` | TEXT | Timetable name |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `config` | JSONB | General configuration |
| `branches` | JSONB | Array of branches |
| `subjects` | JSONB | Array of subjects |
| `combined_classes` | JSONB | Array of combined classes |
| `confirmed_classes` | JSONB | Array of confirmed/pinned classes |
| `lab_rooms` | JSONB | Array of lab rooms |
| `timetables` | JSONB | Generated timetable grids |
| `warnings` | JSONB | Generation warnings |
| `subject_colors` | JSONB | Subject color mappings |

### Row Level Security (RLS)

All policies ensure users can only access their own data:
- ✅ Users can **SELECT** their own timetables
- ✅ Users can **INSERT** their own timetables
- ✅ Users can **UPDATE** their own timetables
- ✅ Users can **DELETE** their own timetables

---

## 🚀 Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: TimeForge (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click **"Create new project"** and wait for setup to complete

### Step 2: Run SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of [`supabase-schema.sql`](./supabase-schema.sql)
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Verify success: You should see "Success. No rows returned"

### Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Find these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

### Step 4: Configure Your App

1. Open [`src/supabaseClient.js`](./src/supabaseClient.js)
2. Replace the placeholder values:

```javascript
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
```

### Step 5: Enable Google OAuth (Optional)

If you want Google login:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable **Google** provider
3. Follow Supabase's guide to set up Google OAuth credentials
4. Add authorized redirect URLs:
   - `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`
   - `http://localhost:5173/home` (for local development)

---

## 🔧 Supabase Operations

All database operations are in [`src/lib/supabaseOperations.ts`](./src/lib/supabaseOperations.ts)

### Available Functions

#### 1. **Load All Timetables**
```typescript
import { loadTimetables } from '@/lib/supabaseOperations';

const timetables = await loadTimetables();
// Returns: SavedTimetable[] (sorted by newest first)
```

#### 2. **Create New Timetable**
```typescript
import { createTimetable } from '@/lib/supabaseOperations';

const newTimetable = await createTimetable({
  name: "Spring 2024 Schedule",
  config: generalConfig,
  branches: branches,
  subjects: subjects,
  combinedClasses: combinedClasses,
  confirmedClasses: confirmedClasses,
  labRooms: labRooms,
  timetables: generatedTimetables,
  warnings: warnings,
  subjectColors: subjectColors,
});
// Returns: SavedTimetable | null
```

#### 3. **Update Existing Timetable**
```typescript
import { updateTimetable } from '@/lib/supabaseOperations';

const updated = await updateTimetable(timetableId, {
  name: "Updated Name",
  warnings: newWarnings,
});
// Returns: SavedTimetable | null
```

#### 4. **Delete Timetable**
```typescript
import { deleteTimetable } from '@/lib/supabaseOperations';

const success = await deleteTimetable(timetableId);
// Returns: boolean
```

#### 5. **Get Single Timetable**
```typescript
import { getTimetable } from '@/lib/supabaseOperations';

const timetable = await getTimetable(timetableId);
// Returns: SavedTimetable | null
```

#### 6. **Subscribe to Real-time Changes**
```typescript
import { subscribeTimetables } from '@/lib/supabaseOperations';

const unsubscribe = subscribeTimetables((timetables) => {
  console.log('Timetables updated:', timetables);
  // Update your UI here
});

// Later, when component unmounts:
unsubscribe();
```

---

## 🧪 Testing

### Test the Integration

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Sign in** with Google (or your auth method)

3. **Create a timetable**:
   - Go through the generator wizard
   - Configure branches, subjects, labs
   - Generate a timetable
   - Click **"Save"** and give it a name

4. **Verify in Supabase**:
   - Go to Supabase dashboard → **Table Editor**
   - Select `saved_timetables` table
   - You should see your saved timetable

5. **Test loading**:
   - Navigate to **"Saved Timetables"** page
   - Your timetable should appear
   - Click **"View"** to load it

6. **Test deletion**:
   - Click the trash icon on a saved timetable
   - Verify it's removed from both UI and Supabase

### Verify RLS Policies

1. Create a second user account
2. Sign in with the second account
3. Verify you **cannot** see the first user's timetables
4. Create a timetable with the second user
5. Sign back in as first user
6. Verify you **cannot** see the second user's timetables

---

## 🎨 UI Integration

The app automatically:
- ✅ Fetches saved timetables when you visit the "Saved Timetables" page
- ✅ Shows a loading state while fetching
- ✅ Saves to Supabase when you click "Save" button
- ✅ Deletes from Supabase when you click trash icon
- ✅ Keeps local state in sync with database

### Modified Components

1. **[`src/stores/timetableStore.ts`](./src/stores/timetableStore.ts)**
   - Added `fetchSavedTimetables()` function
   - Made `saveCurrent()` async to save to Supabase
   - Made `deleteSaved()` async to delete from Supabase
   - Added `isLoadingSaved` state

2. **[`src/pages/SavedTimetables.tsx`](./src/pages/SavedTimetables.tsx)**
   - Fetches timetables on mount
   - Shows loading state
   - Handles async delete

3. **[`src/pages/TimetableView.tsx`](./src/pages/TimetableView.tsx)**
   - Made save handler async

---

## 🔐 Security Notes

- ✅ All database operations require authentication
- ✅ RLS policies prevent users from accessing other users' data
- ✅ The `anon` key is safe to expose in client-side code
- ✅ Never expose your `service_role` key in client code
- ✅ All operations are scoped to `auth.uid()` automatically

---

## 🐛 Troubleshooting

### "No authenticated user found"
- Make sure you're signed in
- Check that Google OAuth is properly configured
- Verify redirect URLs are correct

### "Failed to save timetable"
- Check browser console for detailed error
- Verify your Supabase URL and anon key are correct
- Ensure the SQL schema was run successfully
- Check that RLS policies are enabled

### "Cannot read properties of undefined"
- Make sure you ran the SQL schema
- Verify the table `saved_timetables` exists
- Check that all columns match the schema

### Empty timetables list
- Verify you're signed in as the correct user
- Check Supabase Table Editor to see if data exists
- Look for errors in browser console

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

## ✅ Summary

You now have:
1. ✅ SQL schema for storing timetables
2. ✅ Complete CRUD operations in `supabaseOperations.ts`
3. ✅ Updated store with async save/delete/fetch
4. ✅ UI components that load from Supabase
5. ✅ Row Level Security protecting user data

**Your TimeForge app is now connected to Supabase!** 🎉

Users can save, load, and delete timetables, and all data is securely stored in the cloud with proper authentication and authorization.
