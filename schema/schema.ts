// ============================================
// Maritime Talent Quest Supabase Schema (schema.ts)
// ============================================

export type Database = {
  public: {
    Tables: {
      attendance_logs: {
        Row: {
          attendance_id: string
          qr_id: string
          scan_time: string | null
          scanned_by: string | null
          status: string | null
        }
        Insert: {
          attendance_id?: string
          qr_id: string
          scan_time?: string | null
          scanned_by?: string | null
          status?: string | null
        }
        Update: {
          attendance_id?: string
          qr_id?: string
          scan_time?: string | null
          scanned_by?: string | null
          status?: string | null
        }
      }
      consents: {
        Row: {
          consent_id: string
          student_id: string | null
          info_correct: boolean | null
          agree_to_rules: boolean | null
          consent_to_publicity: boolean | null
          student_signature_url: string | null
          parent_guardian_signature_url: string | null
          consent_date: string | null
        }
        Insert: {
          consent_id?: string
          student_id?: string | null
          info_correct?: boolean | null
          agree_to_rules?: boolean | null
          consent_to_publicity?: boolean | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          consent_date?: string | null
        }
        Update: {
          consent_id?: string
          student_id?: string | null
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
          endorsement_id: string
          student_id: string | null
          official_name: string | null
          position: string | null
        }
        Insert: {
          endorsement_id?: string
          student_id?: string | null
          official_name?: string | null
          position?: string | null
        }
        Update: {
          endorsement_id?: string
          student_id?: string | null
          official_name?: string | null
          position?: string | null
        }
      }
      group_members: {
        Row: {
          group_member_id: string
          group_id: string
          student_id: string
          is_leader: boolean | null
          joined_at: string | null
        }
        Insert: {
          group_member_id?: string
          group_id: string
          student_id: string
          is_leader?: boolean | null
          joined_at?: string | null
        }
        Update: {
          group_member_id?: string
          group_id?: string
          student_id?: string
          is_leader?: boolean | null
          joined_at?: string | null
        }
      }
      groups: {
        Row: {
          group_id: string
          group_name: string
          performance_title: string | null
          performance_description: string | null
          performance_type: PerformanceType | null
          created_at: string | null
        }
        Insert: {
          group_id?: string
          group_name: string
          performance_title?: string | null
          performance_description?: string | null
          performance_type?: PerformanceType | null
          created_at?: string | null
        }
        Update: {
          group_id?: string
          group_name?: string
          performance_title?: string | null
          performance_description?: string | null
          performance_type?: PerformanceType | null
          created_at?: string | null
        }
      }
      guests: {
        Row: {
          guest_id: string
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
          guest_id?: string
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
          guest_id?: string
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
          declaration_id: string
          student_id: string | null
          is_physically_fit: boolean | null
          student_signature_url: string | null
          parent_guardian_signature_url: string | null
          declaration_date: string | null
        }
        Insert: {
          declaration_id?: string
          student_id?: string | null
          is_physically_fit?: boolean | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          declaration_date?: string | null
        }
        Update: {
          declaration_id?: string
          student_id?: string | null
          is_physically_fit?: boolean | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          declaration_date?: string | null
        }
      }
      performances: {
        Row: {
          performance_id: string
          student_id: string | null
          performance_type: PerformanceType
          title: string | null
          duration: string | null
          num_performers: number | null
          group_members: string | null
          created_at: string | null
        }
        Insert: {
          performance_id?: string
          student_id?: string | null
          performance_type: PerformanceType
          title?: string | null
          duration?: string | null
          num_performers?: number | null
          group_members?: string | null
          created_at?: string | null
        }
        Update: {
          performance_id?: string
          student_id?: string | null
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
          qr_id: string
          qr_code_url: string
          group_id: string | null
          single_id: string | null
          guest_id: string | null
          created_at: string | null
        }
        Insert: {
          qr_id?: string
          qr_code_url: string
          group_id?: string | null
          single_id?: string | null
          guest_id?: string | null
          created_at?: string | null
        }
        Update: {
          qr_id?: string
          qr_code_url?: string
          group_id?: string | null
          single_id?: string | null
          guest_id?: string | null
          created_at?: string | null
        }
      }
      requirements: {
        Row: {
          requirement_id: string
          student_id: string | null
          certification_url: string | null
          school_id_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          requirement_id?: string
          student_id?: string | null
          certification_url?: string | null
          school_id_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          requirement_id?: string
          student_id?: string | null
          certification_url?: string | null
          school_id_url?: string | null
          uploaded_at?: string | null
        }
      }
      singles: {
        Row: {
          single_id: string
          student_id: string | null
          performance_title: string | null
          performance_description: string | null
          performance_type: PerformanceType | null
          created_at: string | null
        }
        Insert: {
          single_id?: string
          student_id?: string | null
          performance_title?: string | null
          performance_description?: string | null
          performance_type?: PerformanceType | null
          created_at?: string | null
        }
        Update: {
          single_id?: string
          student_id?: string | null
          performance_title?: string | null
          performance_description?: string | null
          performance_type?: PerformanceType | null
          created_at?: string | null
        }
      }
      students: {
        Row: {
          student_id: string
          full_name: string
          age: number | null
          gender: string | null
          school: string | null
          course_year: string | null
          contact_number: string | null
          email: string | null
          single_id: string | null
          group_id: string | null
          qr_id: string | null
          created_at: string | null
          is_registered: boolean | null
        }
        Insert: {
          student_id?: string
          full_name: string
          age?: number | null
          gender?: string | null
          school?: string | null
          course_year?: string | null
          contact_number?: string | null
          email?: string | null
          single_id?: string | null
          group_id?: string | null
          qr_id?: string | null
          created_at?: string | null
          is_registered?: boolean | null
        }
        Update: {
          student_id?: string
          full_name?: string
          age?: number | null
          gender?: string | null
          school?: string | null
          course_year?: string | null
          contact_number?: string | null
          email?: string | null
          single_id?: string | null
          group_id?: string | null
          qr_id?: string | null
          created_at?: string | null
          is_registered?: boolean | null
        }
      }
      users: {
        Row: {
          user_id: string
          email: string
          full_name: string
          role: UserRole
          created_at: string | null
        }
        Insert: {
          user_id?: string
          email: string
          password_hash: string
          full_name: string
          role?: UserRole
          created_at?: string | null
        }
        Update: {
          user_id?: string
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