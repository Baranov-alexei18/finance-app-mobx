/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Avatar, Button, Form, Input, Popover, Spin, Typography } from 'antd';

import { EDIT_USER, REGISTER_CREATE_USER } from '@/lib/graphQL/users';
import { AvatarType, useAvatarStore } from '@/store/avatarStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { checkPassword } from '@/utils/check-password';
import { getHashPassword } from '@/utils/getHashPassword';

import styles from './styles.module.css';

type EditFormProps = {
  updateAuthUser: { id: string };
};

export const EditProfileForm = () => {
  const { user } = useUserStore();
  const { setNotification } = useNotificationStore();
  const { avatars, loading: loadingAvatars } = useAvatarStore();

  const [form] = Form.useForm();
  const [editUser, { loading }] = useMutation<EditFormProps>(EDIT_USER);
  const [publishUser] = useMutation(REGISTER_CREATE_USER);

  const [avatarData, setAvatarData] = useState<AvatarType | null>(null);
  const [popoverVisible, setPopoverVisible] = useState(false);

  const onFinish = async (values: any) => {
    const { name, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: 'Пароли не совпадают',
      });

      return;
    }

    try {
      const hashPassword = await getHashPassword(values.newPassword);

      const formData = {
        name: name || user?.name,
        password: hashPassword,
        avatar: {
          connect: { id: avatarData?.id || user?.avatar?.id || null },
        },
      };

      const { data } = await editUser({
        variables: {
          id: user?.id,
          data: formData,
        },
      });

      const { data: userId } = await publishUser({
        variables: { id: data?.updateAuthUser.id },
      });

      if (!userId) {
        throw new Error('Не удалось сохранить обновить данные пользователя');
      }

      setNotification({
        type: 'success',
        message: 'Успешно сохранено',
        description: 'Профиль успешно обновлен',
      });
    } catch (e) {
      console.error(e);

      setNotification({
        type: 'error',
        message: 'Профиль не обновлен',
        description: String(e),
      });
    }
  };

  const validateOldPassword = async (_: any, value: string) => {
    if (!user) return;

    if (!value) {
      return Promise.reject('Введите старый пароль');
    }

    const result = await checkPassword(value, user.password!);

    if (!result) {
      return Promise.reject('Неверный старый пароль');
    }

    return Promise.resolve();
  };

  const handleAvatarSelect = (avatar: AvatarType) => {
    setAvatarData(avatar);
    setPopoverVisible(false);
  };

  if (!user) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperAvatar}>
        <Typography.Title level={2}>Редактировать профиль</Typography.Title>
        <Popover
          content={
            loadingAvatars ? (
              <Spin />
            ) : (
              <div className={styles.avatarList}>
                {avatars?.map((avatar) => (
                  <Avatar
                    key={avatar.id}
                    src={avatar.url}
                    size={64}
                    style={{ cursor: 'pointer', margin: 4 }}
                    onClick={() => handleAvatarSelect(avatar)}
                  />
                ))}
              </div>
            )
          }
          title="Выберите аватар"
          trigger="click"
          open={popoverVisible}
          onOpenChange={(visible) => setPopoverVisible(visible)}
        >
          <Avatar
            size={128}
            src={avatarData?.url || user?.avatar?.url || undefined}
            icon={<UserOutlined />}
            style={{ cursor: 'pointer' }}
          />
        </Popover>
        <Typography.Paragraph type="secondary" style={{ marginTop: 8 }}>
          Нажмите на фото, чтобы изменить
        </Typography.Paragraph>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} className={styles.wrapperForm}>
        <Form.Item label="Имя" name="name" initialValue={user?.name || ''}>
          {<Input size="large" />}
        </Form.Item>

        <Form.Item
          label="Старый пароль"
          name="oldPassword"
          rules={[{ validator: validateOldPassword }]}
          hasFeedback
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item
          label="Новый пароль"
          name="newPassword"
          rules={[
            { required: true, message: 'Введите новый пароль' },
            { min: 4, message: 'Пароль должен содержать минимум 4 символа' },
          ]}
          hasFeedback
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item
          label="Подтвердите новый пароль"
          name="confirmPassword"
          rules={[
            { required: true, message: 'Подтвердите новый пароль' },
            { min: 4, message: 'Пароль должен содержать минимум 4 символа' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Пароли не совпадают'));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Сохранить изменения
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
