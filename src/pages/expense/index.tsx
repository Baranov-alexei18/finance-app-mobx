import { useEffect, useMemo } from 'react';
import { Flex, notification, Space } from 'antd';
import dayjs from 'dayjs';

import { ExplorerChart } from '@/components/charts/explorer';
import { PieChart } from '@/components/charts/pie';
import { BaseCardLayout } from '@/components/common-components/base-card-layout';
import { GranularityPicker } from '@/components/common-components/granularity-picker';
import { TransitionTable } from '@/components/common-components/transition-table';
import { TransitionForm } from '@/components/forms/transition-form';
import { useGranularityStore } from '@/store/granularityStore';
import { NotificationType, useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { GRANULARITY_ENUM } from '@/types/granularity';
import { TransitionEnum } from '@/types/transition';

import styles from './styles.module.css';

export const ExpensePage = () => {
  const { notification: notificationData, removeNotification } = useNotificationStore();
  const [api] = notification.useNotification();
  const { period, type } = useGranularityStore();

  const { user, getTransactionsByType, loading } = useUserStore();

  useEffect(() => {
    if (notificationData?.type) {
      viewNotification(notificationData);
      removeNotification();
    }
  }, [notificationData]);

  const expenseTransitions = useMemo(() => {
    const transitionsExpense = getTransactionsByType(TransitionEnum.EXPENSE);

    if (type === GRANULARITY_ENUM.all) {
      return transitionsExpense;
    }

    const start = dayjs(period).startOf(type).toDate();
    const end = dayjs(period).endOf(type).toDate();

    return transitionsExpense.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  }, [getTransactionsByType, user, period, type]);
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
          <TransitionForm title="Расходы" type={TransitionEnum.EXPENSE} />
        </BaseCardLayout>
        <BaseCardLayout>
          <Space direction="vertical" align="center">
            <GranularityPicker />
            <PieChart height={370} width={370} data={expenseTransitions} loading={loading} />
          </Space>
        </BaseCardLayout>
      </Flex>
      {!!expenseTransitions.length && (
        <BaseCardLayout>
          <ExplorerChart height={600} width={1000} data={expenseTransitions} loading={loading} />
        </BaseCardLayout>
      )}
      <BaseCardLayout>
        <TransitionTable transitions={expenseTransitions} />
      </BaseCardLayout>
    </div>
  );
};
