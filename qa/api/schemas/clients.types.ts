import type { components, paths } from '@openapi';

export type Client = components['schemas']['Client'];
export type ClientInput = components['schemas']['ClientInput'];

export interface RuntimeClientRecord {
  id?: string
  user_id?: string
  name?: string
  email?: string
  company?: string | null
  phone?: string | null
  address?: string | null
  tax_id?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

type ListClientsPath = paths['/clients']['get'];
export type ListClientsResponse = ListClientsPath['responses']['200']['content']['application/json'];

type CreateClientPath = paths['/clients']['post'];
export type CreateClientRequest = CreateClientPath['requestBody']['content']['application/json'];
export type CreateClientResponse = CreateClientPath['responses']['201']['content']['application/json'];
export interface CreateClientRuntimeResponse extends CreateClientResponse {
  data?: RuntimeClientRecord
}

type GetClientPath = paths['/clients/{clientId}']['get'];
export type GetClientResponse = GetClientPath['responses']['200']['content']['application/json'];
