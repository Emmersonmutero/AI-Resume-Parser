import { GET, POST } from './route';
import { DELETE, PUT } from './[id]/route';
import { createServerClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/permissions';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/permissions');

const mockedCreateServerClient = createServerClient as jest.Mock;
const mockedHasPermission = hasPermission as jest.Mock;

const mockRequest = (method: string, body?: any) => {
  const req = {
    method,
    headers: new Headers(),
    json: async () => body,
  } as unknown as NextRequest;
  return req;
};

describe('Jobs API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupMocks = (hasPerm: boolean) => {
    mockedHasPermission.mockResolvedValue(hasPerm);

    const mock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-id' } }, error: null }),
      },
    };

    mockedCreateServerClient.mockResolvedValue(mock);
    return mock;
  };

  describe('GET /api/jobs', () => {
    it('should return a list of jobs for a user with permission', async () => {
      const { order } = setupMocks(true);
      order.mockResolvedValue({ data: [{ id: 'job-1' }, { id: 'job-2' }], error: null });

      const req = mockRequest('GET');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.jobs).toHaveLength(2);
    });

    it('should return 403 for a user without permission', async () => {
      setupMocks(false);
      const req = mockRequest('GET');
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });
  });

  describe('POST /api/jobs', () => {
    it('should create a new job for a user with permission', async () => {
        const { single } = setupMocks(true);
        single.mockResolvedValue({ data: { id: 'new-job' }, error: null });

        const req = mockRequest('POST', { title: 'New Job', description: 'Job Description' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.job.id).toBe('new-job');
    });

    it('should return 403 for a user without permission', async () => {
        setupMocks(false);
        const req = mockRequest('POST', { title: 'New Job', description: 'Job Description' });
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Forbidden');
    });
  });

  describe('PUT /api/jobs/[id]', () => {
    it('should update a job for a user with permission', async () => {
        const { single } = setupMocks(true);
        single.mockResolvedValue({ data: { id: 'updated-job' }, error: null });

        const req = mockRequest('PUT', { title: 'Updated Job' });
        const response = await PUT(req, { params: { id: 'job-id' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.job.id).toBe('updated-job');
    });

    it('should return 403 for a user without permission', async () => {
        setupMocks(false);
        const req = mockRequest('PUT', { title: 'Updated Job' });
        const response = await PUT(req, { params: { id: 'job-id' } });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Forbidden');
    });
  });

  describe('DELETE /api/jobs/[id]', () => {
    it('should delete a job for a user with permission', async () => {
        const { from } = setupMocks(true);
        from.mockReturnValue({
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
        });

        const req = mockRequest('DELETE');
        const response = await DELETE(req, { params: { id: 'job-id' } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
    });

    it('should return 403 for a user without permission', async () => {
        setupMocks(false);
        const req = mockRequest('DELETE');
        const response = await DELETE(req, { params: { id: 'job-id' } });
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.error).toBe('Forbidden');
    });
  });
});
