// ============================================
// Maritime Talent Quest Supabase Schema (schema.ts)
// ============================================

export type Database = {
  public: {
    Tables: {
      attendance_logs: {
        Row: {
          attendance_id: number
          qr_id: number
          scan_time: string | null
          scanned_by: string | null
          status: string | null
        }
        Insert: {
          qr_id: number
          scan_time?: string | null
          scanned_by?: string | null
          status?: string | null
        }
        Update: {
          qr_id?: number
          scan_time?: string | null
          scanned_by?: string | null
          status?: string | null
        }
      }
      consents: {
        Row: {
          consent_id: number
          student_id: number | null
          info_correct: boolean | null
          agree_to_rules: boolean | null
          consent_to_publicity: boolean | null
          student_signature_url: string | null
          parent_guardian_signature_url: string | null
          consent_date: string | null
        }
        Insert: {
          student_id?: number | null
          info_correct?: boolean | null
          agree_to_rules?: boolean | null
          consent_to_publicity?: boolean | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          consent_date?: string | null
        }
        Update: {
          student_id?: number | null
          info_correct?: boolean | null
          agree_to_rules?: boolean | null
          consent_to_publicity?: boolean | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          consent_date?: string | null
        }
      }
      endorsements: {
        Row: {
          endorsement_id: number
          student_id: number | null
          school_official_name: string | null
          position: string | null
          signature_url: string | null
          endorsement_date: string | null
        }
        Insert: {
          student_id?: number | null
          school_official_name?: string | null
          position?: string | null
          signature_url?: string | null
          endorsement_date?: string | null
        }
        Update: {
          student_id?: number | null
          school_official_name?: string | null
          position?: string | null
          signature_url?: string | null
          endorsement_date?: string | null
        }
      }
      groups: {
        Row: {
          group_id: number
          group_name: string
          leader_id: number | null
          performance_title: string | null
          performance_description: string | null
          created_at: string | null
        }
        Insert: {
          group_name: string
          leader_id?: number | null
          performance_title?: string | null
          performance_description?: string | null
          created_at?: string | null
        }
        Update: {
          group_name?: string
          leader_id?: number | null
          performance_title?: string | null
          performance_description?: string | null
          created_at?: string | null
        }
      }
      guests: {
        Row: {
          guest_id: number
          full_name: string
          age: number | null
          gender: string | null
          contact_number: string | null
          email: string | null
          organization: string | null
          address: string | null
          registration_date: string | null
        }
        Insert: {
          full_name: string
          age?: number | null
          gender?: string | null
          contact_number?: string | null
          email?: string | null
          organization?: string | null
          address?: string | null
          registration_date?: string | null
        }
        Update: {
          full_name?: string
          age?: number | null
          gender?: string | null
          contact_number?: string | null
          email?: string | null
          organization?: string | null
          address?: string | null
          registration_date?: string | null
        }
      }
      health_fitness: {
        Row: {
          declaration_id: number
          student_id: number | null
          is_physically_fit: boolean | null
          medical_conditions: string | null
          student_signature_url: string | null
          parent_guardian_signature_url: string | null
          declaration_date: string | null
        }
        Insert: {
          student_id?: number | null
          is_physically_fit?: boolean | null
          medical_conditions?: string | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          declaration_date?: string | null
        }
        Update: {
          student_id?: number | null
          is_physically_fit?: boolean | null
          medical_conditions?: string | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          declaration_date?: string | null
        }
      }
      performances: {
        Row: {
          performance_id: number
          student_id: number | null
          performance_type: PerformanceType
          title: string | null
          duration: string | null
          num_performers: number | null
          group_members: string | null
          created_at: string | null
        }
        Insert: {
          student_id?: number | null
          performance_type: PerformanceType
          title?: string | null
          duration?: string | null
          num_performers?: number | null
          group_members?: string | null
          created_at?: string | null
        }
        Update: {
          student_id?: number | null
          performance_type?: PerformanceType
          title?: string | null
          duration?: string | null
          num_performers?: number | null
          group_members?: string | null
          created_at?: string | null
        }
      }
      qr_codes: {
        Row: {
          qr_id: number
          qr_code_url: string
          group_id: number | null
          single_id: number | null
          guest_id: number | null
          created_at: string | null
        }
        Insert: {
          qr_code_url: string
          group_id?: number | null
          single_id?: number | null
          guest_id?: number | null
          created_at?: string | null
        }
        Update: {
          qr_code_url?: string
          group_id?: number | null
          single_id?: number | null
          guest_id?: number | null
          created_at?: string | null
        }
      }
      requirements: {
        Row: {
          requirement_id: number
          student_id: number | null
          certification_url: string | null
          school_id_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          student_id?: number | null
          certification_url?: string | null
          school_id_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          student_id?: number | null
          certification_url?: string | null
          school_id_url?: string | null
          uploaded_at?: string | null
        }
      }
      singles: {
        Row: {
          single_id: number
          performance_title: string | null
          performance_description: string | null
          created_at: string | null
          student_id: number | null
        }
        Insert: {
          performance_title?: string | null
          performance_description?: string | null
          created_at?: string | null
          student_id?: number | null
        }
        Update: {
          performance_title?: string | null
          performance_description?: string | null
          created_at?: string | null
          student_id?: number | null
        }
      }
      students: {
        Row: {
          student_id: number
          full_name: string
          age: number | null
          gender: string | null
          school: string | null
          course_year: string | null
          contact_number: string | null
          email: string | null
          gid: number | null
          sid: number | null
        }
        Insert: {
          full_name: string
          age?: number | null
          gender?: string | null
          school?: string | null
          course_year?: string | null
          contact_number?: string | null
          email?: string | null
          gid?: number | null
          sid?: number | null
        }
        Update: {
          full_name?: string
          age?: number | null
          gender?: string | null
          school?: string | null
          course_year?: string | null
          contact_number?: string | null
          email?: string | null
          gid?: number | null
          sid?: number | null
        }
      }
      users: {
        Row: {
          user_id: number
          email: string
          password_hash: string
          full_name: string
          role: UserRole
          created_at: string | null
        }
        Insert: {
          email: string
          password_hash: string
          full_name: string
          role?: UserRole
          created_at?: string | null
        }
        Update: {
          email?: string
          password_hash?: string
          full_name?: string
          role?: UserRole
          created_at?: string | null
        }
      }
    }
    Enums: {
      UserRole: 'admin' | 'student' | 'user'
      PerformanceType:
        | 'Singing'
        | 'Dancing'
        | 'Musical Instrument'
        | 'Spoken Word/Poetry'
        | 'Theatrical/Drama'
        | 'Other'
    }
  }
}

// ==========================
// Helper Type Aliases
// ==========================
export type UserRole = Database['public']['Enums']['UserRole']
export type PerformanceType = Database['public']['Enums']['PerformanceType']

export type Tables = Database['public']['Tables']
export type TableNames = keyof Tables