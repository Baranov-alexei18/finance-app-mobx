/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button, DatePicker, Form, Input, Select, Typography } from 'antd';
import dayjs from 'dayjs';

import { CreateCategoryModal } from '@/components/common-components/create-category-modal';
import { TransitionEditType } from '@/components/common-components/transition-table';
import { CREATE_CATEGORY, REGISTER_CREATE_CATEGORY } from '@/lib/graphQL/category';
import { CREATE_TRANSITION, REGISTER_CREATE_TRANSITION } from '@/lib/graphQL/transition';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { TransitionEnum, TransitionType } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

import { CategoryFormProps, TransitionFormProps, TransitionFormType } from './types';

import styles from './styles.module.css';

type Props = {
  title: string;
  type: TransitionEnum;
  data?: TransitionType;
  onEdit?: (data: TransitionEditType) => void;
  onCancel?: () => void;
};

export const TransitionForm = ({ title, type, data, onEdit, onCancel }: Props) => {
  const { user, getCategoriesByType, addNewCategory, addNewTransaction } = useUserStore();
  const { setNotification } = useNotificationStore();

  const [createTransition, { loading }] = useMutation<TransitionFormProps>(CREATE_TRANSITION);
  const [publishTransition] = useMutation(REGISTER_CREATE_TRANSITION);

  const [createCategory, { loading: loadingCategory }] =
    useMutation<CategoryFormProps>(CREATE_CATEGORY);
  const [publishCategory] = useMutation(REGISTER_CREATE_CATEGORY);

  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        date: data.date ? dayjs(data.date) : null,
        category: data.category?.id || null,
        goal: data.goal?.id || null,
        amount: String(data.amount),
        note: data.note || '',
      });
    }
  }, [data, form]);

  const categories = getCategoriesByType(TransitionEnum[type]).map(
    (item) => ({
      value: item.id,
      label: getCapitalizeFirstLetter(item.name),
    }),
    []
  );

  const userGoals = user?.goals.map(
    (item) => ({
      value: item.id,
      label: getCapitalizeFirstLetter(item.title),
    }),
    []
  );

  const onFinish = async (values: TransitionFormType) => {
    const formattedDate = values.date ? dayjs(values.date).format('YYYY-MM-DD') : null;
    const formData = {
      authUser: {
        connect: { id: user?.id },
      },
      category: {
        connect: { id: values.category },
      },
      goal: {
        connect: { id: values.goal },
      },
      type: type,
      date: formattedDate,
      amount: Number(values.amount),
      note: values.note || null,
    };

    if (data) {
      onEdit?.({ id: data.id, ...formData } as unknown as TransitionEditType);
      return;
    }

    try {
      const { data } = await createTransition({
        variables: { data: formData },
      });

      if (!data?.createTransition.id) {
        throw new Error('Не удалось создать запись');
      }

      const { data: transitionId } = await publishTransition({
        variables: { id: data.createTransition.id },
      });

      if (!transitionId) {
        throw new Error('Не удалось сохранить запись');
      }

      addNewTransaction(data.createTransition);

      setNotification({
        type: 'success',
        message: 'Успешно сохранено',
        description: `Статья ${type === TransitionEnum.INCOME ? 'доходов' : 'расходов'} создана`,
      });

      handleReset();
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: String(e),
      });
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('❌ Ошибка формы:', errorInfo);
  };

  const handleReset = () => {
    if (data) {
      onCancel?.();
      return;
    }

    form.resetFields();
  };

  const handleAddCategory = async (newCategory: string, color: string) => {
    if (newCategory.trim() && user) {
      const value = newCategory.trim().toLowerCase().replace(/\s+/g, '-');

      const formData = {
        authUser: {
          connect: { id: user?.id },
        },
        type: type,
        name: value,
        chartColor: color,
      };

      try {
        const { data } = await createCategory({
          variables: { data: formData },
        });

        if (!data?.createCategory.id) {
          throw new Error('Не удалось сохранить новую категорию');
        }

        const { data: categoryId } = await publishCategory({
          variables: { id: data.createCategory.id },
        });

        if (!categoryId) {
          throw new Error('Не удалось сохранить новую категорию');
        }

        addNewCategory({
          type: type,
          name: value,
          chartColor: color,
          id: categoryId.publishCategory.id,
        });

        setNotification({
          type: 'success',
          message: 'Успешно сохранено',
          description: 'Новая категория создана',
        });

        handleCloseModal();
      } catch (e) {
        console.error('❌ Ошибка:', e);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <Typography.Title level={2}>{title}</Typography.Title>

      <Form
        form={form}
        name="transition"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        className={styles.wrapperForm}
        initialValues={{
          date: dayjs(),
          category: null,
          goal: null,
          amount: '',
          comment: '',
        }}
      >
        <Form.Item name="date" rules={[{ required: true, message: 'Обязательно' }]}>
          <DatePicker size="large" style={{ width: '100%' }} />
        </Form.Item>

        <div className={styles.wrapperCategories}>
          <Form.Item name="category">
            <Select
              showSearch
              size="large"
              placeholder="Категория"
              defaultValue={categories[0]}
              options={categories}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
              filterSort={(a, b) =>
                (a.label as string).toLowerCase().localeCompare((b.label as string).toLowerCase())
              }
              style={{ flex: 1 }}
              allowClear
            />
          </Form.Item>
          <Button size="large" onClick={() => setIsModalOpen(true)}>
            + Добавить
          </Button>
        </div>

        {type === TransitionEnum.INCOME && (
          <Form.Item name="goal">
            <Select
              showSearch
              size="large"
              placeholder="Цель"
              options={userGoals}
              defaultValue={null}
              optionFilterProp="label"
              filterSort={(optionA, optionB) =>
                (optionA?.label ?? '')
                  .toLowerCase()
                  .localeCompare((optionB?.label ?? '').toLowerCase())
              }
            />
          </Form.Item>
        )}

        <Form.Item
          name="amount"
          rules={[{ required: true, message: 'Обязательно' }]}
          normalize={(value) => value.replace(/[^\d]/g, '')}
        >
          <Input size="large" placeholder="Сумма (только цифры)" />
        </Form.Item>

        <Form.Item name="note">
          <Input size="large" placeholder="Комментарий" />
        </Form.Item>

        <Form.Item>
          <Button size="large" type="primary" htmlType="submit" loading={loading}>
            Сохранить
          </Button>
          <Button size="large" type="default" onClick={handleReset} className={styles.cancelButton}>
            {data ? 'Отмена' : 'Очистить'}
          </Button>
        </Form.Item>
      </Form>
      <CreateCategoryModal
        type={type}
        loading={loadingCategory}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
};
