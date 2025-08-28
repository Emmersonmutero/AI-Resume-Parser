import { hasPermission } from './permissions';
import { createServerClient } from './supabase/server';
import { cookies } from 'next/headers';

jest.mock('./supabase/server');
jest.mock('next/headers');

const mockedCreateServerClient = createServerClient as jest.Mock;
const mockedCookies = cookies as jest.Mock;

describe('hasPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCookies.mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
    });
  });

  const mockSupabaseClient = (profileData: any, permissionData: any) => {
    return {
      from: jest.fn((tableName: string) => {
        if (tableName === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue(profileData),
          };
        }
        if (tableName === 'role_permissions') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue(permissionData),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        };
      }),
    };
  };

  it('should return false if there is no user profile', async () => {
    const supabase = mockSupabaseClient({ data: null, error: new Error('User not found') }, {});
    mockedCreateServerClient.mockResolvedValue(supabase);

    const result = await hasPermission('some_user_id', 'some_permission');
    expect(result).toBe(false);
  });

  it('should return true if the user has the required permission', async () => {
    const supabase = mockSupabaseClient(
      { data: { role: 'Hiring Manager' }, error: null },
      { data: { id: 1 }, error: null }
    );
    mockedCreateServerClient.mockResolvedValue(supabase);

    const result = await hasPermission('user-id', 'view_jobs');
    expect(result).toBe(true);
  });

  it('should return false if the user does not have the required permission', async () => {
    const supabase = mockSupabaseClient(
      { data: { role: 'Candidate' }, error: null },
      { data: null, error: null }
    );
    mockedCreateServerClient.mockResolvedValue(supabase);

    const result = await hasPermission('user-id', 'create_jobs');
    expect(result).toBe(false);
  });
});
