import { useEffect } from 'react';
import { Flex, notification } from 'antd';

import { EditProfileForm } from '@/components/forms/edit-profile-form';
import { AVATAR_IDS, useAvatarStore } from '@/store/avatarStore';
import { NotificationType, useNotificationStore } from '@/store/notificationStore';

import styles from './styles.module.css';

export const EditPage = () => {
  const { notification: notificationData, removeNotification } = useNotificationStore();
  const [api] = notification.useNotification();
  const { fetchAvatars } = useAvatarStore();

  useEffect(() => {
    fetchAvatars(AVATAR_IDS);
  }, [fetchAvatars]);

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
        <EditProfileForm />
      </Flex>
    </div>
  );
};
