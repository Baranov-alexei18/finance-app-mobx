import { useEffect, useMemo } from 'react';
import { BaseCardLayout } from '@components/common-components/base-card-layout';
import { TransitionForm } from '@components/forms/transition-form';
import { notificationStore, NotificationType } from '@store/notificationStore';
import { Flex, notification, Space } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';

import { ExplorerChart } from '@/components/charts/explorer';
import { PieChart } from '@/components/charts/pie';
import { GranularityPicker } from '@/components/common-components/granularity-picker';
import { TransitionTable } from '@/components/common-components/transition-table';
import { granularityStore } from '@/store/granularityStore';
import { userStore } from '@/store/userStore';
import { GRANULARITY_ENUM } from '@/types/granularity';
import { TransitionEnum } from '@/types/transition';

import styles from './styles.module.css';

export const IncomePage = observer(() => {
  const { notification: notificationData } = notificationStore;
  const [api] = notification.useNotification();
  const { user, loading } = userStore;
  const { period, type } = granularityStore;

  const incomeTransitions = useMemo(() => {
    const transitionsIncome = userStore.getTransactionsByType(TransitionEnum.INCOME);

    if (type === GRANULARITY_ENUM.all) {
      return transitionsIncome;
    }

    const start = dayjs(period).startOf(type).toDate();
    const end = dayjs(period).endOf(type).toDate();

    return transitionsIncome.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  }, [user, period, type]);

  useEffect(() => {
    if (notificationData?.type) {
      viewNotification(notificationData);
      notificationStore.removeNotification();
    }
  }, [notificationData]);

  const viewNotification = (data: NotificationType | null) => {
    if (!data) return;

    const { type, message, description } = data;

    if (type === 'error') {
      api.error({
        message,
        description,
      });
    } else if (type === 'success') {
      api.success({
        message,
        description,
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <Flex className={styles.wrapperDashboard}>
        <BaseCardLayout>
          <TransitionForm title="Доходы" type={TransitionEnum.INCOME} />
        </BaseCardLayout>
        <BaseCardLayout>
          <Space direction="vertical" align="center">
            <GranularityPicker />
            <PieChart height={360} width={360} data={incomeTransitions} loading={loading} />
          </Space>
        </BaseCardLayout>
      </Flex>
      {!!incomeTransitions.length && (
        <BaseCardLayout>
          <ExplorerChart height={600} width={1000} data={incomeTransitions} loading={loading} />
        </BaseCardLayout>
      )}
      <BaseCardLayout>
        <TransitionTable transitions={incomeTransitions} />
      </BaseCardLayout>
    </div>
  );
});
