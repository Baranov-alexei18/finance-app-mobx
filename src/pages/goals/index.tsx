import { useEffect } from 'react';
import { notification, Space, Typography } from 'antd';

import { BaseCardLayout } from '@/components/common-components/base-card-layout';
import { GoalsTable } from '@/components/common-components/goals-table';
import { GoalForm } from '@/components/forms/goal-form';
import { notificationStore, NotificationType } from '@/store/notificationStore';
import { userStore } from '@/store/userStore';

import { INIT_VALUES } from './constants';

import styles from './styles.module.css';

export const GoalsPage = () => {
  const { notification: notificationData } = notificationStore;
  const [api] = notification.useNotification();
  const { user } = userStore;

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
