import { useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Calendar } from 'antd';
import { Popover } from 'antd';
import { Dayjs } from 'dayjs';
import { observer } from 'mobx-react-lite';

import { GRANULARITY } from '@/constants/granularity';
import { granularityStore } from '@/store/granularityStore';
import { GRANULARITY_ENUM } from '@/types/granularity';

import styles from './styles.module.css';

type GranularityKey = keyof typeof GRANULARITY;

const granularitySteps: Record<GranularityKey, (date: Dayjs, direction: 'prev' | 'next') => Dayjs> =
  {
    week: (date, dir) => date.add(dir === 'next' ? 1 : -1, GRANULARITY_ENUM.week),
    month: (date, dir) => date.add(dir === 'next' ? 1 : -1, GRANULARITY_ENUM.month),
    year: (date, dir) => date.add(dir === 'next' ? 1 : -1, GRANULARITY_ENUM.year),
    all: (date) => date,
  };

const formatByGranularity: Record<GranularityKey, (date: Dayjs) => string> = {
  week: (date) =>
    `${date.startOf(GRANULARITY_ENUM.week).format('DD.MM.YYYY')} - ${date.endOf(GRANULARITY_ENUM.week).format('DD.MM.YYYY')}`,
  month: (date) => date.format('MMMM YYYY'),
  year: (date) => date.format('YYYY'),
  all: () => 'За все время',
};

export const GranularityPicker = observer(() => {
  const { type, period } = granularityStore;
  const [open, setOpen] = useState(false);

  const formattedPeriod = period ? formatByGranularity[type](period) : '';

  const handleArrowClick = (direction: 'prev' | 'next') => {
    const stepFunc = granularitySteps[type];
    granularityStore.setGranularityPeriod(stepFunc(period!, direction));
  };

  const handleSelect = (date: Dayjs) => {
    granularityStore.setGranularityPeriod(date);
    setOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      {type !== GRANULARITY_ENUM.all && (
        <LeftOutlined onClick={() => handleArrowClick('prev')} className={styles.active} />
      )}

      {period && (
        <Popover
          open={open}
          onOpenChange={setOpen}
          content={
            <Calendar
              className={styles.popoverWrapper}
              fullscreen={false}
              value={period}
              onSelect={handleSelect}
            />
          }
          trigger="click"
          className={styles.popoverWrapper}
        >
          <div onClick={() => setOpen(true)} className={styles.active}>
            {formattedPeriod}
          </div>
        </Popover>
      )}
      {type !== GRANULARITY_ENUM.all && (
        <RightOutlined onClick={() => handleArrowClick('next')} className={styles.active} />
      )}
    </div>
  );
});
