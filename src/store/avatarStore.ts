import { create } from 'zustand';

import client from '@/lib/apollo';
import { GET_ASSETS_BY_IDS } from '@/lib/graphQL/assets';

export const AVATAR_IDS = [
  'cm9zcuhsvlffr07lrmnm7531v',
  'cm9zcuht9lffw07lrrjvexvfz',
  'cm9zcuho7bpx507mwamx1vae5',
  'cm9zcuh2tlffh07lr243uwdvu',
  'cm9zcuh2rlfff07lrcyctpbf6',
  'cm9zcuhr1lffm07lrw45lujsd',
  'cm9zcuhmibpws07mwwpww2oe4',
  'cm9zcuhmqbpwv07mwilxulb3n',
  'cm9zcuhkubpwn07mwiklf2nkk',
  'cm9zcuho8bpx707mwz3s4bn7r',
];

export type AvatarType = {
  id: string;
  url: string;
  fileName: string;
};

type Props = {
  avatars: AvatarType[];
  loading: boolean;
  error: Error | null;
  fetchAvatars: (ids: string[]) => Promise<void>;
};

export const useAvatarStore = create<Props>((set) => ({
  avatars: [],
  loading: false,
  error: null,
  fetchAvatars: async (ids: string[]) => {
    set({ loading: true, error: null });

    try {
      const { data } = await client.query({
        query: GET_ASSETS_BY_IDS,
        variables: { ids },
      });

      set({
        avatars: data.assets,
        loading: false,
        error: null,
      });
    } catch (err) {
      set({
        loading: false,
        error: err as Error,
      });
    }
  },
}));
