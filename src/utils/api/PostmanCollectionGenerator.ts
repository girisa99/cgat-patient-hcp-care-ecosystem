
/**
 * Postman Collection Generation Utilities for API Integrations
 */

import { ApiIntegration, ApiEndpoint, PostmanCollection, PostmanItem } from './ApiIntegrationTypes';
import { SchemaAnalyzer } from './SchemaAnalyzer';

export class PostmanCollectionGenerator {
  static async generatePostmanCollection(integration: ApiIntegration): Promise<PostmanCollection> {
    const collection: PostmanCollection = {
      info: {
        name: `${integration.name} API`,
        description: `${integration.description}\n\nType: ${integration.type}\nCategory: ${integration.category}\nStatus: ${integration.status}`,
        version: integration.version,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: integration.baseUrl,
          type: 'string'
        }
      ]
    };

    if (integration.endpoints[0]?.authentication && integration.endpoints[0].authentication.type !== 'none') {
      collection.auth = this.generatePostmanAuth(integration.endpoints[0].authentication);
    }

    for (const endpoint of integration.endpoints) {
      const item = this.generatePostmanItem(endpoint, integration);
      collection.item.push(item);
    }

    return collection;
  }

  static generatePostmanAuth(auth: ApiEndpoint['authentication']) {
    if (!auth) return undefined;

    switch (auth.type) {
      case 'bearer':
        return {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{bearerToken}}',
              type: 'string'
            }
          ]
        };
      case 'api-key':
        return {
          type: 'apikey',
          apikey: [
            {
              key: 'key',
              value: 'X-API-Key',
              type: 'string'
            },
            {
              key: 'value',
              value: '{{apiKey}}',
              type: 'string'
            }
          ]
        };
      default:
        return undefined;
    }
  }

  static generatePostmanItem(endpoint: ApiEndpoint, integration: ApiIntegration): PostmanItem {
    const item: PostmanItem = {
      name: endpoint.name,
      request: {
        method: endpoint.method,
        header: Object.entries(endpoint.headers).map(([key, value]) => ({
          key,
          value,
          type: 'text'
        })),
        url: {
          raw: endpoint.fullUrl || `{{baseUrl}}${endpoint.url}`,
          host: endpoint.fullUrl ? [endpoint.fullUrl.split('/')[2]] : ['{{baseUrl}}'],
          path: endpoint.url.split('/').filter(p => p)
        }
      },
      response: []
    };

    if (endpoint.queryParams) {
      item.request.url.query = Object.entries(endpoint.queryParams).map(([key, value]) => ({
        key,
        value
      }));
    }

    if (endpoint.bodySchema && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
      item.request.body = {
        mode: 'raw',
        raw: JSON.stringify(SchemaAnalyzer.generateSampleData(endpoint.bodySchema), null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      };
    }

    return item;
  }

  static exportPostmanCollection(collection: PostmanCollection): string {
    return JSON.stringify(collection, null, 2);
  }
}
