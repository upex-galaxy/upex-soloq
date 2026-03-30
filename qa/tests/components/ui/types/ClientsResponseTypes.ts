export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  company: string | null
  phone: string | null
  address: string | null
  tax_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ClientsResponse {
  clients: Client[]
  total: number
  page: number
  totalPages: number
}
