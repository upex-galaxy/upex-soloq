import type { APIResponse } from '@playwright/test';
import type { CreateClientRequest, CreateClientRuntimeResponse, GetClientResponse, ListClientsResponse } from '@schemas/clients.types';

import { ApiBase } from '@api/ApiBase';
import { expect } from '@playwright/test';
import { atc } from '@utils/decorators';

export class ClientsApi extends ApiBase {
  private readonly endpoints = {
    list: '/api/clients',
    get: (id: string) => `/api/clients/${id}`,
    create: '/api/clients',
  };

  @atc('SQ-XXX')
  async listClientsSuccessfully(): Promise<[APIResponse, ListClientsResponse]> {
    const [response, body] = await this.apiGET<ListClientsResponse>(this.endpoints.list);
    expect(response.status()).toBe(200);
    expect(Array.isArray(body.clients)).toBe(true);
    return [response, body];
  }

  @atc('SQ-XXX')
  async getClientSuccessfully(id: string): Promise<[APIResponse, GetClientResponse]> {
    const [response, body] = await this.apiGET<GetClientResponse>(this.endpoints.get(id));
    expect(response.status()).toBe(200);
    expect(body.client?.id).toBe(id);
    return [response, body];
  }

  @atc('SQ-XXX')
  async createClientSuccessfully(
    payload: CreateClientRequest,
  ): Promise<[APIResponse, CreateClientRuntimeResponse, CreateClientRequest]> {
    const [response, body, sentPayload] = await this.apiPOST<CreateClientRuntimeResponse, CreateClientRequest>(
      this.endpoints.create,
      payload,
    );
    expect(response.status()).toBe(201);
    expect(body.client?.id ?? body.data?.id).toBeDefined();
    return [response, body, sentPayload];
  }
}
