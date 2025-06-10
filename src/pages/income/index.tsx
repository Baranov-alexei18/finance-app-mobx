import { useEffect, useMemo } from 'react';
import { BaseCardLayout } from '@components/common-components/base-card-layout';
import { TransitionForm } from '@components/forms/transition-form';
import { NotificationType, useNotificationStore } from '@store/notificationStore';
import { Flex, notification, Space } from 'antd';
import dayjs from 'dayjs';

import { ExplorerChart } from '@/components/charts/explorer';
import { PieChart } from '@/components/charts/pie';
import { GranularityPicker } from '@/components/common-components/granularity-picker';
import { TransitionTable } from '@/components/common-components/transition-table';
import { useGranularityStore } from '@/store/granularityStore';
import { useUserStore } from '@/store/userStore';
import { GRANULARITY_ENUM } from '@/types/granularity';
import { TransitionEnum } from '@/types/transition';

import styles from './styles.module.css';

export const IncomePage = () => {
  const { notification: notificationData, removeNotification } = useNotificationStore();
  const [api] = notification.useNotification();
  const { user, getTransactionsByType, loading } = useUserStore();
  const { period, type } = useGranularityStore();

  const incomeTransitions = useMemo(() => {
    const transitionsIncome = getTransactionsByType(TransitionEnum.INCOME);

    if (type === GRANULARITY_ENUM.all) {
      return transitionsIncome;
    }

    const start = dayjs(period).startOf(type).toDate();
    const end = dayjs(period).endOf(type).toDate();

    return transitionsIncome.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  }, [getTransactionsByType, user, period, type]);

  useEffect(() => {
    if (notificationData?.type) {
      viewNotification(notificationData);
      removeNotification();
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
            <PieChart height={370} width={370} data={incomeTransitions} loading={loading} />
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
};
