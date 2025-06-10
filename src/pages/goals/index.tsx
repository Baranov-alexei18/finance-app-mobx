import { useEffect } from 'react';
import { notification, Space, Typography } from 'antd';

import { BaseCardLayout } from '@/components/common-components/base-card-layout';
import { GoalsTable } from '@/components/common-components/goals-table';
import { GoalForm } from '@/components/forms/goal-form';
import { NotificationType, useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';

import { INIT_VALUES } from './constants';

import styles from './styles.module.css';

export const GoalsPage = () => {
  const { notification: notificationData, removeNotification } = useNotificationStore();
  const [api] = notification.useNotification();
  const { user } = useUserStore();

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
      <BaseCardLayout>
        <Space size={16} direction="vertical" style={{ width: '100%' }}>
          <Typography.Title level={2}> Создание цели</Typography.Title>
          <GoalForm data={INIT_VALUES} />
        </Space>
      </BaseCardLayout>
      <BaseCardLayout>
        <GoalsTable goals={user?.goals || []} />
      </BaseCardLayout>
    </div>
  );
};
