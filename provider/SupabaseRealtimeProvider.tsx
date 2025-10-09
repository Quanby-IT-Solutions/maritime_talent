"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Database } from '@/schema/schema';

// Define the types for our realtime data
type StudentData = Database['public']['Tables']['students']['Row'];
type GuestData = Database['public']['Tables']['guests']['Row'];
type GroupData = Database['public']['Tables']['groups']['Row'];
type SingleData = Database['public']['Tables']['singles']['Row'];
type QRCodeData = Database['public']['Tables']['qr_codes']['Row'];
type AttendanceLogData = Database['public']['Tables']['attendance_logs']['Row'];

// Realtime context type
interface RealtimeContextType {
  // Connection status
  isConnected: boolean;
  connectionError: string | null;
  
  // Data with real-time updates
  students: StudentData[];
  guests: GuestData[];
  groups: GroupData[];
  singles: SingleData[];
  qrCodes: QRCodeData[];
  attendanceLogs: AttendanceLogData[];
  
  // Loading states
  loading: {
    students: boolean;
    guests: boolean;
    groups: boolean;
    singles: boolean;
    qrCodes: boolean;
    attendanceLogs: boolean;
  };
  
  // Manual refresh functions
  refreshStudents: () => void;
  refreshGuests: () => void;
  refreshGroups: () => void;
  refreshSingles: () => void;
  refreshQRCodes: () => void;
  refreshAttendanceLogs: () => void;
  
  // Subscribe to specific table changes
  subscribeToTable: (table: string, callback: (payload: any) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

interface SupabaseRealtimeProviderProps {
  children: React.ReactNode;
}

export function SupabaseRealtimeProvider({ children }: SupabaseRealtimeProviderProps) {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const maxRetries = 3;
  const retryDelay = 3000; // 3 seconds
  
  // Data states
  const [students, setStudents] = useState<StudentData[]>([]);
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [singles, setSingles] = useState<SingleData[]>([]);
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogData[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    students: true,
    guests: true,
    groups: true,
    singles: true,
    qrCodes: true,
    attendanceLogs: true,
  });
  
  // Channels for each table
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  // Fetch initial data
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, students: true }));
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('student_id', { ascending: false });
      
      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load contestant data');
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  }, []);

  const fetchGuests = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, guests: true }));
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('guest_id', { ascending: false });
      
      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guest data');
    } finally {
      setLoading(prev => ({ ...prev, guests: false }));
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, groups: true }));
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('group_id', { ascending: false });
      
      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load group data');
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  }, []);

  const fetchSingles = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, singles: true }));
      const { data, error } = await supabase
        .from('singles')
        .select('*')
        .order('single_id', { ascending: false });
      
      if (error) throw error;
      setSingles(data || []);
    } catch (error) {
      console.error('Error fetching singles:', error);
      toast.error('Failed to load single performance data');
    } finally {
      setLoading(prev => ({ ...prev, singles: false }));
    }
  }, []);

  const fetchQRCodes = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, qrCodes: true }));
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('qr_id', { ascending: false });
      
      if (error) throw error;
      setQRCodes(data || []);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast.error('Failed to load QR code data');
    } finally {
      setLoading(prev => ({ ...prev, qrCodes: false }));
    }
  }, []);

  const fetchAttendanceLogs = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, attendanceLogs: true }));
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .order('attendance_id', { ascending: false });
      
      if (error) throw error;
      setAttendanceLogs(data || []);
    } catch (error) {
      console.error('Error fetching attendance logs:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(prev => ({ ...prev, attendanceLogs: false }));
    }
  }, []);

  // Handle realtime changes
  const handleStudentChange = useCallback((payload: RealtimePostgresChangesPayload<StudentData>) => {
    console.log('Student change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setStudents(prev => [payload.new, ...prev]);
        toast.success('New contestant registered!');
        break;
      case 'UPDATE':
        setStudents(prev => 
          prev.map(item => item.student_id === payload.new.student_id ? payload.new : item)
        );
        toast.info('Contestant information updated');
        break;
      case 'DELETE':
        setStudents(prev => 
          prev.filter(item => item.student_id !== payload.old.student_id)
        );
        toast.info('Contestant registration removed');
        break;
    }
  }, []);

  const handleGuestChange = useCallback((payload: RealtimePostgresChangesPayload<GuestData>) => {
    console.log('Guest change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setGuests(prev => [payload.new, ...prev]);
        toast.success('New guest registered!');
        break;
      case 'UPDATE':
        setGuests(prev => 
          prev.map(item => item.guest_id === payload.new.guest_id ? payload.new : item)
        );
        toast.info('Guest information updated');
        break;
      case 'DELETE':
        setGuests(prev => 
          prev.filter(item => item.guest_id !== payload.old.guest_id)
        );
        toast.info('Guest registration removed');
        break;
    }
  }, []);

  const handleGroupChange = useCallback((payload: RealtimePostgresChangesPayload<GroupData>) => {
    console.log('Group change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setGroups(prev => [payload.new, ...prev]);
        toast.success('New group performance registered!');
        break;
      case 'UPDATE':
        setGroups(prev => 
          prev.map(item => item.group_id === payload.new.group_id ? payload.new : item)
        );
        toast.info('Group performance updated');
        break;
      case 'DELETE':
        setGroups(prev => 
          prev.filter(item => item.group_id !== payload.old.group_id)
        );
        toast.info('Group performance removed');
        break;
    }
  }, []);

  const handleSingleChange = useCallback((payload: RealtimePostgresChangesPayload<SingleData>) => {
    console.log('🔔 Single change detected:', payload.eventType, payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setSingles(prev => {
          console.log(`➕ Adding single: ${payload.new.single_id}, prev count: ${prev.length}`);
          return [payload.new, ...prev];
        });
        toast.success('New single performance registered!');
        break;
      case 'UPDATE':
        setSingles(prev => {
          console.log(`✏️ Updating single: ${payload.new.single_id}`);
          return prev.map(item => item.single_id === payload.new.single_id ? payload.new : item);
        });
        toast.info('Single performance updated');
        break;
      case 'DELETE':
        setSingles(prev => {
          console.log(`🗑️ Deleting single: ${payload.old.single_id}`);
          return prev.filter(item => item.single_id !== payload.old.single_id);
        });
        toast.info('Single performance removed');
        break;
    }
  }, []);

  const handleQRCodeChange = useCallback((payload: RealtimePostgresChangesPayload<QRCodeData>) => {
    console.log('QR Code change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setQRCodes(prev => [payload.new, ...prev]);
        toast.success('New QR code generated!');
        break;
      case 'UPDATE':
        setQRCodes(prev => 
          prev.map(item => item.qr_id === payload.new.qr_id ? payload.new : item)
        );
        break;
      case 'DELETE':
        setQRCodes(prev => 
          prev.filter(item => item.qr_id !== payload.old.qr_id)
        );
        toast.info('QR code removed');
        break;
    }
  }, []);

  const handleAttendanceLogChange = useCallback((payload: RealtimePostgresChangesPayload<AttendanceLogData>) => {
    console.log('Attendance log change:', payload);
    
    switch (payload.eventType) {
      case 'INSERT':
        setAttendanceLogs(prev => [payload.new, ...prev]);
        toast.success('Attendance recorded!');
        break;
      case 'UPDATE':
        setAttendanceLogs(prev => 
          prev.map(item => item.attendance_id === payload.new.attendance_id ? payload.new : item)
        );
        toast.info('Attendance log updated');
        break;
      case 'DELETE':
        setAttendanceLogs(prev => 
          prev.filter(item => item.attendance_id !== payload.old.attendance_id)
        );
        toast.info('Attendance log removed');
        break;
    }
  }, []);

  // Generic subscription function
  const subscribeToTable = useCallback((table: string, callback: (payload: any) => void) => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();

    setChannels(prev => [...prev, channel]);

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
      setChannels(prev => prev.filter(c => c !== channel));
    };
  }, []);

  // Retry connection function
  const retryConnection = useCallback(() => {
    if (retryCount < maxRetries && !isRetrying) {
      setIsRetrying(true);
      console.log(`🔄 Retrying connection (${retryCount + 1}/${maxRetries})...`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
        setConnectionError(null);
      }, retryDelay);
    } else if (retryCount >= maxRetries) {
      console.error('❌ Max retries reached. Realtime features disabled.');
      toast.error('Unable to connect to realtime updates. Please refresh the page.');
    }
  }, [retryCount, isRetrying]);

  // Set up realtime subscriptions
  useEffect(() => {
    console.log('Setting up realtime subscriptions...');
    const totalChannels = 6;
    const subscribedChannels = new Set<string>();
    
    const checkAllSubscribed = () => {
      if (subscribedChannels.size === totalChannels) {
        console.log('✅ All channels subscribed successfully');
        setIsConnected(true);
        setRetryCount(0);
        setConnectionError(null);
        clearTimeout(connectionTimeout);
      }
    };
    
    // Set a timeout to detect if connection is stuck
    const connectionTimeout = setTimeout(() => {
      if (subscribedChannels.size === 0) {
        console.error('⏱️ Connection timeout - no channels subscribed after 10 seconds');
        setConnectionError('Connection timeout. Your Supabase project may be paused or unreachable.');
        toast.error('Unable to connect to Supabase. Please check if your project is active.');
      }
    }, 10000); // 10 second timeout
    
    // Create channels for each table with proper status callbacks
    const studentChannel = supabase
      .channel('students-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, handleStudentChange)
      .subscribe((status) => {
        console.log('Students channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Students realtime subscribed');
          subscribedChannels.add('students');
          checkAllSubscribed();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Students channel error');
          clearTimeout(connectionTimeout);
          setConnectionError('Failed to subscribe to students channel');
          retryConnection();
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Students channel timed out');
          clearTimeout(connectionTimeout);
          setConnectionError('Connection timed out');
          retryConnection();
        } else if (status === 'CLOSED') {
          console.warn('🔌 Students channel closed');
          setIsConnected(false);
        }
      });

    const guestChannel = supabase
      .channel('guests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, handleGuestChange)
      .subscribe((status) => {
        console.log('Guests channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Guests realtime subscribed');
          subscribedChannels.add('guests');
          checkAllSubscribed();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Guests channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Guests channel timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔌 Guests channel closed');
        }
      });

    const groupChannel = supabase
      .channel('groups-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, handleGroupChange)
      .subscribe((status) => {
        console.log('Groups channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Groups realtime subscribed');
          subscribedChannels.add('groups');
          checkAllSubscribed();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Groups channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Groups channel timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔌 Groups channel closed');
        }
      });

    const singleChannel = supabase
      .channel('singles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'singles' }, handleSingleChange)
      .subscribe((status) => {
        console.log('Singles channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Singles realtime subscribed');
          subscribedChannels.add('singles');
          checkAllSubscribed();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Singles channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Singles channel timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔌 Singles channel closed');
        }
      });

    const qrCodeChannel = supabase
      .channel('qr-codes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qr_codes' }, handleQRCodeChange)
      .subscribe((status) => {
        console.log('QR Codes channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ QR Codes realtime subscribed');
          subscribedChannels.add('qr_codes');
          checkAllSubscribed();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ QR Codes channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ QR Codes channel timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔌 QR Codes channel closed');
        }
      });

    const attendanceLogChannel = supabase
      .channel('attendance-logs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs' }, handleAttendanceLogChange)
      .subscribe((status) => {
        console.log('Attendance Logs channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Attendance Logs realtime subscribed');
          subscribedChannels.add('attendance_logs');
          checkAllSubscribed();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Attendance Logs channel error');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Attendance Logs channel timed out');
        } else if (status === 'CLOSED') {
          console.warn('🔌 Attendance Logs channel closed');
        }
      });

    setChannels([studentChannel, guestChannel, groupChannel, singleChannel, qrCodeChannel, attendanceLogChannel]);

    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscriptions...');
      clearTimeout(connectionTimeout);
      supabase.removeChannel(studentChannel);
      supabase.removeChannel(guestChannel);
      supabase.removeChannel(groupChannel);
      supabase.removeChannel(singleChannel);
      supabase.removeChannel(qrCodeChannel);
      supabase.removeChannel(attendanceLogChannel);
    };
  }, [handleStudentChange, handleGuestChange, handleGroupChange, handleSingleChange, handleQRCodeChange, handleAttendanceLogChange, retryConnection, retryCount]);

  // Fetch initial data on mount
  useEffect(() => {
    Promise.all([
      fetchStudents(),
      fetchGuests(),
      fetchGroups(),
      fetchSingles(),
      fetchQRCodes(),
      fetchAttendanceLogs(),
    ]).then(() => {
      console.log('✅ Initial data loaded');
    }).catch((error) => {
      console.error('❌ Error loading initial data:', error);
      setConnectionError('Failed to load initial data');
    });
  }, [fetchStudents, fetchGuests, fetchGroups, fetchSingles, fetchQRCodes, fetchAttendanceLogs]);

  const contextValue: RealtimeContextType = {
    isConnected,
    connectionError,
    students,
    guests,
    groups,
    singles,
    qrCodes,
    attendanceLogs,
    loading,
    refreshStudents: fetchStudents,
    refreshGuests: fetchGuests,
    refreshGroups: fetchGroups,
    refreshSingles: fetchSingles,
    refreshQRCodes: fetchQRCodes,
    refreshAttendanceLogs: fetchAttendanceLogs,
    subscribeToTable,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}

// Custom hook to use the realtime context
export function useSupabaseRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useSupabaseRealtime must be used within a SupabaseRealtimeProvider');
  }
  return context;
}

// Individual hooks for each data type
export function useRealtimeStudents() {
  const { students, loading, refreshStudents } = useSupabaseRealtime();
  return { data: students, isLoading: loading.students, refetch: refreshStudents };
}

export function useRealtimeGuests() {
  const { guests, loading, refreshGuests } = useSupabaseRealtime();
  return { data: guests, isLoading: loading.guests, refetch: refreshGuests };
}

export function useRealtimeGroups() {
  const { groups, loading, refreshGroups } = useSupabaseRealtime();
  return { data: groups, isLoading: loading.groups, refetch: refreshGroups };
}

export function useRealtimeSingles() {
  const { singles, loading, refreshSingles } = useSupabaseRealtime();
  return { data: singles, isLoading: loading.singles, refetch: refreshSingles };
}

export function useRealtimeQRCodes() {
  const { qrCodes, loading, refreshQRCodes } = useSupabaseRealtime();
  return { data: qrCodes, isLoading: loading.qrCodes, refetch: refreshQRCodes };
}

export function useRealtimeAttendanceLogs() {
  const { attendanceLogs, loading, refreshAttendanceLogs } = useSupabaseRealtime();
  return { data: attendanceLogs, isLoading: loading.attendanceLogs, refetch: refreshAttendanceLogs };
}
