import { useNavigate } from 'react-router';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useLazyQuery } from '@apollo/client';
import type { FormProps } from 'antd';
import { Button, Checkbox, Flex, Form, Input } from 'antd';

import { ROUTE_PATHS } from '@/constants/route-path';
import { GET_USER_BY_EMAIL } from '@/lib/graphQL/users';
import { useNotificationStore } from '@/store/notificationStore';
import { UserType } from '@/types/user';
import { checkPassword } from '@/utils/check-password';

import styles from './styles.module.css';

type Props = {
  switchToRegister: () => void;
};

type AuthFormProps = {
  authUser: UserType;
};

export const AuthForm = ({ switchToRegister }: Props) => {
  const navigate = useNavigate();
  const { setNotification } = useNotificationStore();
  const [fetchUserByEmail, { loading }] = useLazyQuery<AuthFormProps>(GET_USER_BY_EMAIL);

  const onFinish: FormProps<UserType>['onFinish'] = async (values) => {
    if (!values.email || !values.password) {
      return;
    }

    try {
      const { data } = await fetchUserByEmail({ variables: { email: values.email } });

      if (!data?.authUser) {
        throw new Error('Не найден email');
      }

      const result = await checkPassword(values.password, data.authUser.password!);

      if (!result) {
        throw new Error('Не верный пароль');
      }

      setNotification({
        type: 'success',
        message: 'Успешный вход',
        description: 'Вы успешно вошли в систему.',
      });
      sessionStorage.setItem('userId', data.authUser.id);
      navigate(ROUTE_PATHS.home);
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: String(e),
      });
    }
  };

  const onFinishFailed: FormProps<UserType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className={styles.wrapper}>
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className={styles.wrapperForm}
      >
        <Form.Item name="email" rules={[{ required: true, message: 'Введите email!' }]}>
          <Input size="large" prefix={<UserOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль!' }]}>
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>

        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>
          </Flex>
        </Form.Item>

        <Form.Item>
          <Button size="large" block type="primary" htmlType="submit" loading={loading}>
            Войти
          </Button>
          <Button type="link" style={{ width: '100%' }} onClick={switchToRegister}>
            Зарегистрироваться
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
