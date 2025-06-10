/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Flex, List, notification, Progress, Space, Typography } from 'antd';
import dayjs from 'dayjs';

import { PieChart } from '@/components/charts/pie';
import { BaseCardLayout } from '@/components/common-components/base-card-layout';
import { GranularityPicker } from '@/components/common-components/granularity-picker';
import { RecentTransitions } from '@/components/common-components/recent-transitions';
import { ROUTE_PATHS } from '@/constants/route-path';
import { useGranularityStore } from '@/store/granularityStore';
import { NotificationType, useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { GRANULARITY_ENUM } from '@/types/granularity';
import { TransitionEnum } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

import styles from './styles.module.css';

export const HomePage = () => {
  const navigate = useNavigate();
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

  const allTransitions = useMemo(() => {
    const transitions = user?.transitions;

    if (type === GRANULARITY_ENUM.all) {
      return transitions;
    }

    const start = dayjs(period).startOf(type).toDate();
    const end = dayjs(period).endOf(type).toDate();

    return transitions?.filter((item) => {
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
          <Space direction="vertical" size={4} className={styles.wrapperGoals}>
            <Typography.Title level={3}>Мои цели</Typography.Title>
            <List
              dataSource={user?.goals}
              renderItem={(goal, index) => {
                const totalSaved = goal.transitions?.reduce((sum, t) => sum + t.amount, 0) || 0;
                const percent = Math.min(100, (totalSaved / (goal as any).targetAmount) * 100);

                return (
                  <List.Item>
                    <div className={styles.goalItem}>
                      <Typography.Text className={styles.goalTitle}>
                        {`${index + 1}. ${getCapitalizeFirstLetter(goal.title)}`}
                      </Typography.Text>
                      <Progress
                        percent={percent > 100 ? 100 : +percent.toFixed(2)}
                        status={percent >= 100 ? 'success' : 'active'}
                      />
                    </div>
                  </List.Item>
                );
              }}
            />
            <Button
              variant="outlined"
              className={styles.goalsButton}
              onClick={() => navigate(ROUTE_PATHS.goals)}
            >
              Перейти к созданию цели
            </Button>
          </Space>
        </BaseCardLayout>
        <BaseCardLayout>
          <Space direction="vertical" align="center">
            <GranularityPicker />
            <PieChart
              height={370}
              width={370}
              data={allTransitions || []}
              loading={loading}
              isGroupedByType={true}
            />
          </Space>
        </BaseCardLayout>
      </Flex>
      <Flex className={styles.wrapperDashboard}>
        <BaseCardLayout>
          <RecentTransitions transitions={allTransitions || []} type={TransitionEnum.INCOME} />
        </BaseCardLayout>
        <BaseCardLayout>
          <RecentTransitions transitions={allTransitions || []} type={TransitionEnum.EXPENSE} />
        </BaseCardLayout>
      </Flex>
    </div>
  );
};
