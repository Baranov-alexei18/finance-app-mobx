import { LockOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import { DocumentNode, OperationVariables, TypedDocumentNode, useMutation } from '@apollo/client';
import type { FormProps } from 'antd';
import { Button, Form, Input } from 'antd';

import { CREATE_USER, REGISTER_CREATE_USER } from '@/lib/graphQL/users';
import { useNotificationStore } from '@/store/notificationStore';
import { UserType } from '@/types/user';
import { getHashPassword } from '@/utils/getHashPassword';

import styles from './styles.module.css';

type Props = {
  switchToAuth: () => void;
};

type AuthFormProps = {
  authUser: UserType;
};

type AuthFormResponse = {
  createAuthUser: { id: DocumentNode | TypedDocumentNode<AuthFormProps, OperationVariables> };
};

export const RegisterForm = ({ switchToAuth }: Props) => {
  const [createNewUser, { loading }] = useMutation<AuthFormResponse>(CREATE_USER);
  const [publishUser] = useMutation(REGISTER_CREATE_USER);

  const { setNotification } = useNotificationStore();

  const onFinish: FormProps<UserType>['onFinish'] = async (values) => {
    if (!values.email || !values.password) {
      return;
    }

    const hashPassword = await getHashPassword(values.password);

    const formData = {
      email: values.email,
      password: hashPassword,
      name: values.name,
    };

    try {
      const { data } = await createNewUser({
        variables: { data: formData },
      });

      if (!data?.createAuthUser.id) {
        throw new Error('Не удалось создать пользователя');
      }

      const { data: userId } = await publishUser({
        variables: { id: data.createAuthUser.id },
      });

      if (!userId) {
        throw new Error('Не удалось сохранить учетную запись пользователя');
      }

      setNotification({
        type: 'success',
        message: 'Регистрация',
        description: 'Новый аккаунт успешно зарегестрирован',
      });

      switchToAuth();
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Регистрация не пройдена',
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

        <Form.Item name="name" rules={[{ required: true, message: 'Введите ваше имя' }]}>
          <Input size="large" prefix={<UserAddOutlined />} placeholder="Имя" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль!' }]}>
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Пароль" />
        </Form.Item>

        <Form.Item
          name="password2"
          dependencies={['password']}
          rules={[
            {
              required: true,
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The new password that you entered do not match!'));
              },
            }),
          ]}
        >
          <Input.Password size="large" prefix={<LockOutlined />} placeholder="Повторите пароль" />
        </Form.Item>

        <Form.Item>
          <Button size="large" block type="primary" htmlType="submit" loading={loading}>
            Зарегистрироваться
          </Button>
          <Button type="link" style={{ width: '100%' }} onClick={switchToAuth}>
            Уже есть аккаунт? Войти
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
