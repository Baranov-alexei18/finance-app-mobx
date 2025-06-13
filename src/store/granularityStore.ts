import dayjs, { Dayjs } from 'dayjs';
import { makeAutoObservable } from 'mobx';

import { GRANULARITY } from '@/constants/granularity';

export type GranularityType = keyof typeof GRANULARITY;

class GranularityStore {
  type: GranularityType = 'month';
  period: Dayjs | null = dayjs();

  constructor() {
    makeAutoObservable(this);
  }

  setGranularityType(data: GranularityType) {
    this.type = data || 'month';
  }

  setGranularityPeriod(data: Dayjs | null) {
    this.period = data;
  }
}

export const granularityStore = new GranularityStore();
