/**
 * 用户域 API
 */

import { post } from '../client';
import type { UserProfile } from '@fe/shared';

export const user = {
  async profile(): Promise<UserProfile> {
    return post<UserProfile>('/v1/user/profile');
  },

  async update(input: {
    nickname?: string;
    avatarUrl?: string;
    phone?: string;
  }): Promise<UserProfile> {
    return post<UserProfile>('/v1/user/update', input);
  },
};
