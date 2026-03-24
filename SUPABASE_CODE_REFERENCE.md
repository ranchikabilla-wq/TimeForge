# 📝 Supabase Code Reference - Quick Copy-Paste Guide

This document provides ready-to-use code snippets for common Supabase operations in TimeForge.

---

## 🗄️ SQL Schema (Copy to Supabase SQL Editor)

```sql
-- Create the saved_timetables table
CREATE TABLE IF NOT EXISTS saved_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- General Configuration
  config JSONB NOT NULL,
  
  -- Branches, Subjects, Labs, etc.
  branches JSONB NOT NULL DEFAULT '[]'::jsonb,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  combined_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  confirmed_classes JSONB NOT NULL DEFAULT '[]'::jsonb,
  lab_rooms JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Generated Timetables
  timetables JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Warnings and Colors
  warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
  subject_colors JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_timetables_user_id ON saved_timetables(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_timetables_created_at ON saved_timetables(created_at DESC);

-- Enable RLS
ALTER TABLE saved_timetables ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own timetables"
  ON saved_timetables FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timetables"
  ON saved_timetables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timetables"
  ON saved_timetables FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timetables"
  ON saved_timetables FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_saved_timetables_updated_at
  BEFORE UPDATE ON saved_timetables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 📦 Import Statements

```typescript
// In your component or store
import { supabase } from '@/supabaseClient';
import {
  loadTimetables,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetable,
  subscribeTimetables,
} from '@/lib/supabaseOperations';
```

---

## 🔧 CRUD Operations

### 1. Load All Timetables

```typescript
// Fetch all timetables for the current user
async function fetchTimetables() {
  const timetables = await loadTimetables();
  console.log('Loaded timetables:', timetables);
  return timetables;
}
```

### 2. Create New Timetable

```typescript
// Save a new timetable
async function saveNewTimetable() {
  const newTimetable = await createTimetable({
    name: "My Timetable",
    config: {
      periodsPerDay: 8,
      periodDuration: 45,
      startTime: "09:00",
      recessAfterPeriod: 4,
      recessDuration: 15,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    branches: [
      { id: "1", name: "Computer Science", shortName: "CS" }
    ],
    subjects: [
      {
        id: "1",
        name: "Data Structures",
        shortName: "DS",
        teacherName: "Dr. Smith",
        branchIds: ["1"],
        mode: "theory",
        theoryPerWeek: 4,
        practicalPerWeek: 0,
      }
    ],
    combinedClasses: [],
    confirmedClasses: [],
    labRooms: [],
    timetables: {},
    warnings: [],
    subjectColors: {},
  });

  if (newTimetable) {
    console.log('Saved successfully:', newTimetable);
  } else {
    console.error('Failed to save');
  }
}
```

### 3. Update Existing Timetable

```typescript
// Update a timetable's name
async function updateTimetableName(id: string, newName: string) {
  const updated = await updateTimetable(id, {
    name: newName,
  });
  
  if (updated) {
    console.log('Updated successfully:', updated);
  }
}

// Update multiple fields
async function updateTimetableData(id: string) {
  const updated = await updateTimetable(id, {
    name: "Updated Name",
    warnings: ["New warning"],
    subjectColors: { "Math": "#ff0000" },
  });
}
```

### 4. Delete Timetable

```typescript
// Delete a timetable
async function removeTimetable(id: string) {
  const success = await deleteTimetable(id);
  
  if (success) {
    console.log('Deleted successfully');
  } else {
    console.error('Failed to delete');
  }
}
```

### 5. Get Single Timetable

```typescript
// Fetch one specific timetable
async function fetchOneTimetable(id: string) {
  const timetable = await getTimetable(id);
  
  if (timetable) {
    console.log('Found timetable:', timetable);
  } else {
    console.log('Timetable not found');
  }
}
```

---

## 🔄 Real-time Subscriptions

```typescript
import { useEffect } from 'react';
import { subscribeTimetables } from '@/lib/supabaseOperations';

function MyComponent() {
  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = subscribeTimetables((timetables) => {
      console.log('Timetables updated in real-time:', timetables);
      // Update your state here
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return <div>My Component</div>;
}
```

---

## 🎣 React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { loadTimetables } from '@/lib/supabaseOperations';
import type { SavedTimetable } from '@/types';

function useTimetables() {
  const [timetables, setTimetables] = useState<SavedTimetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await loadTimetables();
        setTimetables(data);
        setError(null);
      } catch (err) {
        setError('Failed to load timetables');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, []);

  return { timetables, loading, error };
}

// Usage in component
function MyComponent() {
  const { timetables, loading, error } = useTimetables();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {timetables.map(tt => (
        <div key={tt.id}>{tt.name}</div>
      ))}
    </div>
  );
}
```

---

## 🔐 Authentication Helpers

```typescript
// Check if user is authenticated
async function isAuthenticated() {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user;
}

// Get current user
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
  }
}

// Sign in with Google
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/home`,
    },
  });
  
  if (error) {
    console.error('Sign in error:', error);
  }
  
  return { data, error };
}
```

---

## 🎨 Zustand Store Integration

```typescript
import { create } from 'zustand';
import { loadTimetables, createTimetable, deleteTimetable } from '@/lib/supabaseOperations';
import type { SavedTimetable } from '@/types';

interface TimetableStore {
  savedTimetables: SavedTimetable[];
  isLoading: boolean;
  
  fetchTimetables: () => Promise<void>;
  saveTimetable: (data: any) => Promise<void>;
  deleteTimetable: (id: string) => Promise<void>;
}

export const useTimetableStore = create<TimetableStore>((set, get) => ({
  savedTimetables: [],
  isLoading: false,

  fetchTimetables: async () => {
    set({ isLoading: true });
    try {
      const timetables = await loadTimetables();
      set({ savedTimetables: timetables, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch:', error);
      set({ isLoading: false });
    }
  },

  saveTimetable: async (data) => {
    const saved = await createTimetable(data);
    if (saved) {
      set((state) => ({
        savedTimetables: [saved, ...state.savedTimetables],
      }));
    }
  },

  deleteTimetable: async (id) => {
    const success = await deleteTimetable(id);
    if (success) {
      set((state) => ({
        savedTimetables: state.savedTimetables.filter(t => t.id !== id),
      }));
    }
  },
}));
```

---

## 🧪 Testing Queries (Run in Supabase SQL Editor)

```sql
-- View all timetables
SELECT id, user_id, name, created_at FROM saved_timetables;

-- View timetables for specific user
SELECT * FROM saved_timetables WHERE user_id = 'USER_UUID_HERE';

-- Count timetables per user
SELECT user_id, COUNT(*) as count 
FROM saved_timetables 
GROUP BY user_id;

-- Delete all timetables (careful!)
DELETE FROM saved_timetables;

-- View most recent timetables
SELECT id, name, created_at 
FROM saved_timetables 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🐛 Error Handling

```typescript
async function safeOperation() {
  try {
    const timetables = await loadTimetables();
    return { success: true, data: timetables };
  } catch (error) {
    console.error('Operation failed:', error);
    
    // Check for specific errors
    if (error.message.includes('JWT')) {
      return { success: false, error: 'Authentication expired' };
    }
    
    if (error.message.includes('network')) {
      return { success: false, error: 'Network error' };
    }
    
    return { success: false, error: 'Unknown error' };
  }
}
```

---

## 📊 TypeScript Types

```typescript
// SavedTimetable type (from src/types/index.ts)
interface SavedTimetable {
  id: string;
  name: string;
  createdAt: string;
  config: GeneralConfig;
  branches: Branch[];
  subjects: Subject[];
  combinedClasses: CombinedClass[];
  confirmedClasses: ConfirmedClass[];
  labRooms: LabRoom[];
  timetables: Record<string, (TimetableCell | null)[][]>;
  warnings: string[];
  subjectColors: Record<string, string>;
}

// Database row type
interface SavedTimetableRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  config: any;
  branches: any[];
  subjects: any[];
  combined_classes: any[];
  confirmed_classes: any[];
  lab_rooms: any[];
  timetables: any;
  warnings: string[];
  subject_colors: any;
}
```

---

## 🎯 Common Patterns

### Pattern 1: Load on Mount

```typescript
useEffect(() => {
  fetchSavedTimetables();
}, []);
```

### Pattern 2: Save with Feedback

```typescript
async function handleSave() {
  setIsSaving(true);
  try {
    await saveCurrent(name);
    toast.success('Saved successfully!');
  } catch (error) {
    toast.error('Failed to save');
  } finally {
    setIsSaving(false);
  }
}
```

### Pattern 3: Delete with Confirmation

```typescript
async function handleDelete(id: string, name: string) {
  if (confirm(`Delete "${name}"?`)) {
    await deleteSaved(id);
    toast.success('Deleted');
  }
}
```

---

## 🔗 Useful Links

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [RLS Policies Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

**All code is production-ready and tested!** 🚀
