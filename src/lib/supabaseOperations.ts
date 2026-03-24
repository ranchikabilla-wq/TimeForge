/**
 * Supabase Database Operations for TimeForge
 * ===========================================
 * This file contains all CRUD operations for saved timetables
 * All operations are scoped to the authenticated user via RLS
 */

import { supabase } from '@/supabaseClient';
import type { SavedTimetable } from '@/types';

// Database row type (matches Supabase schema)
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

/**
 * Convert database row to SavedTimetable type
 */
function rowToTimetable(row: SavedTimetableRow): SavedTimetable {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    config: row.config,
    branches: row.branches,
    subjects: row.subjects,
    combinedClasses: row.combined_classes,
    confirmedClasses: row.confirmed_classes,
    labRooms: row.lab_rooms,
    timetables: row.timetables,
    warnings: row.warnings,
    subjectColors: row.subject_colors,
  };
}

/**
 * Convert SavedTimetable to database row format
 */
function timetableToRow(timetable: Omit<SavedTimetable, 'id' | 'createdAt'>) {
  return {
    name: timetable.name,
    config: timetable.config,
    branches: timetable.branches,
    subjects: timetable.subjects,
    combined_classes: timetable.combinedClasses,
    confirmed_classes: timetable.confirmedClasses,
    lab_rooms: timetable.labRooms,
    timetables: timetable.timetables,
    warnings: timetable.warnings,
    subject_colors: timetable.subjectColors,
  };
}

/**
 * Load all saved timetables for the current user
 * Sorted by creation date (newest first)
 */
export async function loadTimetables(): Promise<SavedTimetable[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('saved_timetables')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading timetables:', error);
      throw error;
    }

    return (data || []).map(rowToTimetable);
  } catch (error) {
    console.error('Failed to load timetables:', error);
    return [];
  }
}

/**
 * Create a new saved timetable
 * Returns the created timetable with generated ID
 */
export async function createTimetable(
  timetable: Omit<SavedTimetable, 'id' | 'createdAt'>
): Promise<SavedTimetable | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to save timetables');
    }

    const row = {
      user_id: user.id,
      ...timetableToRow(timetable),
    };

    const { data, error } = await supabase
      .from('saved_timetables')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('Error creating timetable:', error);
      throw error;
    }

    return data ? rowToTimetable(data) : null;
  } catch (error) {
    console.error('Failed to create timetable:', error);
    return null;
  }
}

/**
 * Update an existing saved timetable
 * Only updates if the timetable belongs to the current user (enforced by RLS)
 */
export async function updateTimetable(
  id: string,
  updates: Partial<Omit<SavedTimetable, 'id' | 'createdAt'>>
): Promise<SavedTimetable | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to update timetables');
    }

    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.config !== undefined) dbUpdates.config = updates.config;
    if (updates.branches !== undefined) dbUpdates.branches = updates.branches;
    if (updates.subjects !== undefined) dbUpdates.subjects = updates.subjects;
    if (updates.combinedClasses !== undefined) dbUpdates.combined_classes = updates.combinedClasses;
    if (updates.confirmedClasses !== undefined) dbUpdates.confirmed_classes = updates.confirmedClasses;
    if (updates.labRooms !== undefined) dbUpdates.lab_rooms = updates.labRooms;
    if (updates.timetables !== undefined) dbUpdates.timetables = updates.timetables;
    if (updates.warnings !== undefined) dbUpdates.warnings = updates.warnings;
    if (updates.subjectColors !== undefined) dbUpdates.subject_colors = updates.subjectColors;

    const { data, error } = await supabase
      .from('saved_timetables')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating timetable:', error);
      throw error;
    }

    return data ? rowToTimetable(data) : null;
  } catch (error) {
    console.error('Failed to update timetable:', error);
    return null;
  }
}

/**
 * Delete a saved timetable
 * Only deletes if the timetable belongs to the current user (enforced by RLS)
 */
export async function deleteTimetable(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to delete timetables');
    }

    const { error } = await supabase
      .from('saved_timetables')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting timetable:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete timetable:', error);
    return false;
  }
}

/**
 * Get a single saved timetable by ID
 * Only returns if the timetable belongs to the current user (enforced by RLS)
 */
export async function getTimetable(id: string): Promise<SavedTimetable | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('saved_timetables')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error getting timetable:', error);
      throw error;
    }

    return data ? rowToTimetable(data) : null;
  } catch (error) {
    console.error('Failed to get timetable:', error);
    return null;
  }
}

/**
 * Subscribe to real-time changes for the current user's timetables
 * Useful for syncing across multiple tabs/devices
 */
export function subscribeTimetables(
  callback: (timetables: SavedTimetable[]) => void
) {
  const channel = supabase
    .channel('saved_timetables_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'saved_timetables',
      },
      async () => {
        // Reload all timetables when any change occurs
        const timetables = await loadTimetables();
        callback(timetables);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}
