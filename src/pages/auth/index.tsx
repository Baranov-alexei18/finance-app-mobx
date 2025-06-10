import { useEffect, useState } from 'react';
import type { TabsProps } from 'antd';
import { notification, Tabs } from 'antd';

import { AuthForm } from '@/components/forms/auth-form';
import { RegisterForm } from '@/components/forms/register-form';
import { NotificationType, useNotificationStore } from '@/store/notificationStore';

import styles from './styles.module.css';

export const AuthPage = () => {
  const [activeKey, setActiveKey] = useState('auth');
  const { notification: notificationData, removeNotification } = useNotificationStore();
  const [api, contextHolder] = notification.useNotification();

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

  const items: TabsProps['items'] = [
    {
      key: 'auth',
      label: 'Авторизация',
      children: <AuthForm switchToRegister={() => setActiveKey('register')} />,
    },
    {
      key: 'register',
      label: 'Регистрация',
      children: <RegisterForm switchToAuth={() => setActiveKey('auth')} />,
    },
  ];

  return (
    <div className={styles.wrapper}>
      {contextHolder}
      <Tabs
        className={styles.formWrapper}
        activeKey={activeKey}
        onChange={(key) => setActiveKey(key)}
        items={items}
      />
    </div>
  );
};
