import { useEffect } from 'react';
import { Flex, notification } from 'antd';
import { observer } from 'mobx-react-lite';

import { EditProfileForm } from '@/components/forms/edit-profile-form';
import { AVATAR_IDS, avatarStore } from '@/store/avatarStore';
import { notificationStore, NotificationType } from '@/store/notificationStore';

import styles from './styles.module.css';

export const EditPage = observer(() => {
  const { notification: notificationData } = notificationStore;
  const [api] = notification.useNotification();

  const { fetchAvatars } = avatarStore;

  useEffect(() => {
    fetchAvatars(AVATAR_IDS);
  }, [fetchAvatars]);

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
        <EditProfileForm />
      </Flex>
    </div>
  );
});
