import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('../src/lib/supabase/env', () => ({ isSupabaseConfigured: true }));

import { createClient } from '../src/lib/supabase/server';
import { POST } from '../src/app/api/public/review-suggestions/route';

const requestFor = (
  body: unknown,
  clientIp = '198.51.100.1'
) => new Request('https://reviewqr.example/api/public/review-suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-real-ip': clientIp },
  body: JSON.stringify(body),
});

const feedback = {
  token: 'public_qr_token_1234567890',
  rating: 4,
  language: 'en',
  experience: 'The staff helped us find the entrance.',
};

describe('Public review suggestions API', () => {
  beforeEach(() => {
    vi.stubEnv('OPENROUTER_API_KEY', '');
    vi.stubEnv('OPENAI_API_KEY', 'test-server-key');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              suggestions: [
                'The staff helped us find the entrance.',
                'I appreciated the staff helping us locate the entrance.',
                'The staff made it easier to find the entrance.',
              ],
            }),
          },
        }],
      }), { status: 200 }))
    );
    vi.mocked(createClient).mockResolvedValue({
      rpc: vi.fn(async () => ({
        data: [{ business_category: 'Hotel' }],
        error: null,
      })),
    } as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('uses the token-resolved category and customer text in the server-side provider request', async () => {
    const response = await POST(requestFor(feedback, '198.51.100.10'));
    const result = await response.json();
    const providerRequest = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(String(providerRequest[1]?.body));
    const userMessage = JSON.parse(payload.messages[1].content);

    expect(response.status).toBe(200);
    expect(result.suggestions).toHaveLength(3);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toHaveProperty('topic');
    expect(result.items[0]).toHaveProperty('text');
    expect(userMessage.customerExperience).toBe(feedback.experience);
    expect(userMessage.businessCategory).toBe('Hotel');
    expect(payload.messages[0].content).toContain('Do not add any service');
    expect(providerRequest[1]?.headers).toHaveProperty('Authorization', 'Bearer test-server-key');
  });

  it('returns a truthful unavailable state when the provider key is missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');

    const response = await POST(requestFor(feedback, '198.51.100.11'));
    const result = await response.json();

    expect(response.status).toBe(503);
    expect(result.code).toBe('AI_NOT_CONFIGURED');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not turn provider failures into successful suggestions', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('unavailable', { status: 429 })));

    const response = await POST(requestFor(feedback, '198.51.100.12'));
    const result = await response.json();

    expect(response.status).toBe(502);
    expect(result.code).toBe('AI_PROVIDER_ERROR');
    expect(result.suggestions).toBeUndefined();
  });

  it('does not request generated content without descriptive customer feedback', async () => {
    const response = await POST(requestFor({ ...feedback, experience: ' ' }, '198.51.100.15'));
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects invalid input and rate-limits repeat requests from one address', async () => {
    const invalid = await POST(requestFor({ ...feedback, rating: 0 }, '198.51.100.13'));
    expect(invalid.status).toBe(400);

    const ip = '198.51.100.14';
    for (let count = 0; count < 5; count += 1) {
      expect((await POST(requestFor(feedback, ip))).status).toBe(200);
    }
    const limited = await POST(requestFor(feedback, ip));
    const result = await limited.json();
    expect(limited.status).toBe(429);
    expect(result.code).toBe('RATE_LIMITED');
    expect(limited.headers.get('Retry-After')).toBe('60');
  });
});
