// ============================================
// Maritime Talent Quest Supabase Schema (schema.ts)
// ============================================

export type Database = {
  public: {
    Tables: {
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

      students: {
        Row: {
          student_id: number
          user_id: number | null
          full_name: string
          age: number | null
          gender: string | null
          school: string | null
          course_year: string | null
          contact_number: string | null
          email: string | null
          created_at: string | null
        }
        Insert: {
          user_id?: number | null
          full_name: string
          age?: number | null
          gender?: string | null
          school?: string | null
          course_year?: string | null
          contact_number?: string | null
          email?: string | null
          created_at?: string | null
        }
        Update: {
          user_id?: number | null
          full_name?: string
          age?: number | null
          gender?: string | null
          school?: string | null
          course_year?: string | null
          contact_number?: string | null
          email?: string | null
          created_at?: string | null
        }
      }

      performances: {
        Row: {
          performance_id: number
          student_id: number
          performance_type: PerformanceType
          title: string | null
          duration: string | null
          num_performers: number | null
          group_members: string | null
          created_at: string | null
        }
        Insert: {
          student_id: number
          performance_type: PerformanceType
          title?: string | null
          duration?: string | null
          num_performers?: number | null
          group_members?: string | null
          created_at?: string | null
        }
        Update: {
          student_id?: number
          performance_type?: PerformanceType
          title?: string | null
          duration?: string | null
          num_performers?: number | null
          group_members?: string | null
          created_at?: string | null
        }
      }

      requirements: {
        Row: {
          requirement_id: number
          student_id: number
          certification_url: string | null
          school_id_url: string | null
          uploaded_at: string | null
        }
        Insert: {
          student_id: number
          certification_url?: string | null
          school_id_url?: string | null
          uploaded_at?: string | null
        }
        Update: {
          student_id?: number
          certification_url?: string | null
          school_id_url?: string | null
          uploaded_at?: string | null
        }
      }

      health_fitness: {
        Row: {
          declaration_id: number
          student_id: number
          is_physically_fit: boolean | null
          medical_conditions: string | null
          student_signature_url: string | null
          parent_guardian_signature_url: string | null
          declaration_date: string | null
        }
        Insert: {
          student_id: number
          is_physically_fit?: boolean | null
          medical_conditions?: string | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          declaration_date?: string | null
        }
        Update: {
          student_id?: number
          is_physically_fit?: boolean | null
          medical_conditions?: string | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          declaration_date?: string | null
        }
      }

      consents: {
        Row: {
          consent_id: number
          student_id: number
          info_correct: boolean | null
          agree_to_rules: boolean | null
          consent_to_publicity: boolean | null
          student_signature_url: string | null
          parent_guardian_signature_url: string | null
          consent_date: string | null
        }
        Insert: {
          student_id: number
          info_correct?: boolean | null
          agree_to_rules?: boolean | null
          consent_to_publicity?: boolean | null
          student_signature_url?: string | null
          parent_guardian_signature_url?: string | null
          consent_date?: string | null
        }
        Update: {
          student_id?: number
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
          student_id: number
          school_official_name: string | null
          position: string | null
          signature_url: string | null
          endorsement_date: string | null
        }
        Insert: {
          student_id: number
          school_official_name?: string | null
          position?: string | null
          signature_url?: string | null
          endorsement_date?: string | null
        }
        Update: {
          student_id?: number
          school_official_name?: string | null
          position?: string | null
          signature_url?: string | null
          endorsement_date?: string | null
        }
      }
    }

    Enums: {
      UserRole: 'admin' | 'student'
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
