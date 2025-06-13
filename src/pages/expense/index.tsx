import { useEffect, useMemo } from 'react';
import { Flex, notification, Space } from 'antd';
import dayjs from 'dayjs';
import { observer } from 'mobx-react-lite';

import { ExplorerChart } from '@/components/charts/explorer';
import { PieChart } from '@/components/charts/pie';
import { BaseCardLayout } from '@/components/common-components/base-card-layout';
import { GranularityPicker } from '@/components/common-components/granularity-picker';
import { TransitionTable } from '@/components/common-components/transition-table';
import { TransitionForm } from '@/components/forms/transition-form';
import { granularityStore } from '@/store/granularityStore';
import { notificationStore, NotificationType } from '@/store/notificationStore';
import { userStore } from '@/store/userStore';
import { GRANULARITY_ENUM } from '@/types/granularity';
import { TransitionEnum } from '@/types/transition';

import styles from './styles.module.css';

export const ExpensePage = observer(() => {
  const { notification: notificationData } = notificationStore;
  const [api] = notification.useNotification();
  const { period, type } = granularityStore;

  const { user, loading } = userStore;

  useEffect(() => {
    if (notificationData?.type) {
      viewNotification(notificationData);
      notificationStore.removeNotification();
    }
  }, [notificationData]);

  const expenseTransitions = useMemo(() => {
    const transitionsExpense = userStore.getTransactionsByType(TransitionEnum.EXPENSE);

    if (type === GRANULARITY_ENUM.all) {
      return transitionsExpense;
    }

    const start = dayjs(period).startOf(type).toDate();
    const end = dayjs(period).endOf(type).toDate();

    return transitionsExpense.filter((item) => {
      const date = new Date(item.date);
      return date >= start && date <= end;
    });
  }, [user, period, type]);
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
});
