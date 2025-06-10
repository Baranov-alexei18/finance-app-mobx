/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from '@apollo/client';
import { Button, DatePicker, Form, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';

import { CREATE_GOAL, PUBLISH_GOAL } from '@/lib/graphQL/goal';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { GoalType } from '@/types/goal';

import styles from './styles.module.css';

type GoalFormProps = {
  data: GoalType;
};

export const GoalForm = ({ data }: GoalFormProps) => {
  const { setNotification } = useNotificationStore();
  const { user, addNewGoal } = useUserStore();
  const [form] = Form.useForm();
  const [createGoal, { loading }] = useMutation(CREATE_GOAL);
  const [publishGoal] = useMutation(PUBLISH_GOAL);

  const onFinish = async (values: any) => {
    try {
      const { title, description, target_amount, start_date, end_date } = values;

      const { data } = await createGoal({
        variables: {
          data: {
            authUser: {
              connect: { id: user?.id },
            },
            title,
            description,
            targetAmount: target_amount,
            startDate: start_date,
            endDate: end_date,
          },
        },
      });

      await publishGoal({ variables: { id: data.createGoal.id } });

      addNewGoal(values);
      setNotification({
        type: 'success',
        message: 'Успешно',
        description: 'Цель  создана',
      });
    } catch (e) {
      console.error(e);
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: 'Не удалось сохранить цель',
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <Form
        layout="vertical"
        form={form}
        initialValues={{
          title: data.title,
          description: data.description,
          target_amount: data.target_amount,
          start_date: dayjs(data.start_date),
          end_date: dayjs(data.end_date),
        }}
        onFinish={onFinish}
        className={styles.wrapperForm}
      >
        <Form.Item name="title" rules={[{ required: true, message: 'Введите название цели' }]}>
          <Input placeholder="Название цели" size="large" />
        </Form.Item>

        <Form.Item name="description" rules={[{ required: true, message: 'Введите описание' }]}>
          <Input.TextArea placeholder="Описание цели" rows={2} size="large" />
        </Form.Item>

        <Form.Item
          name="target_amount"
          rules={[{ required: true, message: 'Введите целевую сумму' }]}
        >
          <InputNumber size="large" style={{ width: '100%' }} min={0} />
        </Form.Item>

        <Form.Item
          name="start_date"
          label="Дата начала"
          rules={[{ required: true, message: 'Выберите дату начала' }]}
        >
          <DatePicker size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="end_date"
          label="Дата окончания"
          rules={[
            { required: true, message: 'Выберите дату окончания' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startDate = getFieldValue('start_date');
                if (!value || !startDate) {
                  return Promise.resolve(); // не валидируем, пока оба значения не выбраны
                }

                if (value.isAfter(startDate)) {
                  return Promise.resolve();
                }

                return Promise.reject(new Error('Дата окончания должна быть позже даты начала'));
              },
            }),
          ]}
        >
          <DatePicker size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            Создать
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
