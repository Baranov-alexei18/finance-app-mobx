/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { useState } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useMutation } from '@apollo/client';
import { Collapse, Modal, Space, Table, Tag, Tooltip, Typography } from 'antd';

import { TransitionForm } from '@/components/forms/transition-form';
import {
  DELETE_TRANSITION,
  EDIT_TRANSITION,
  REGISTER_CREATE_TRANSITION,
} from '@/lib/graphQL/transition';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { TransitionEnum, TransitionType } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

import { GranularityPicker } from '../granularity-picker';

const { Panel } = Collapse;

type Props = {
  transitions: TransitionType[];
};

export type TransitionEditType = Omit<TransitionType, 'category'> & {
  category: { connect: { id: string } };
};

export const TransitionTable = ({ transitions }: Props) => {
  const { deleteTransactionById, updateTransactionById } = useUserStore((state) => state);
  const [deleteTransition, { loading: removeLoading }] = useMutation(DELETE_TRANSITION);
  const [updateTransition, { loading: updateLoading }] = useMutation(EDIT_TRANSITION);
  const [publishTransition] = useMutation(REGISTER_CREATE_TRANSITION);
  const { setNotification } = useNotificationStore();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TransitionType | null>(null);

  const handleEdit = (record: TransitionType) => {
    setSelectedRecord(record);
    setIsEditModalVisible(true);
  };

  const handleDelete = (record: TransitionType) => {
    setSelectedRecord(record);
    setIsDeleteModalVisible(true);
  };

  const handleCloseEditModal = () => setIsEditModalVisible(false);

  const handleUpdateTransition = async (record: TransitionEditType) => {
    try {
      const { data } = await updateTransition({
        variables: {
          id: record.id,
          data: {
            note: record.note,
            amount: Number(record.amount),
            date: record.date,
            type: record.type,
            category: {
              connect: { id: record.category?.connect?.id || null },
            },
            goal: record.goal?.id || null,
          },
        },
      });

      if (!data?.updateTransition.id) {
        throw new Error('Не удалось изменить запись');
      }

      const { data: transitionId } = await publishTransition({
        variables: { id: data.updateTransition.id },
      });

      if (!transitionId) {
        throw new Error('Не удалось сохранить изменения Запись');
      }

      updateTransactionById(transitionId.publishTransition.id, data.updateTransition);

      setNotification({
        type: 'success',
        message: 'Запись изменена',
        description: 'Запись успешно обновлена',
      });
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: String(e),
      });
    }

    handleCloseEditModal();
  };

  const handleDeleteTransition = async (record: TransitionType) => {
    try {
      await deleteTransition({ variables: { id: record.id } });

      deleteTransactionById(record.id);

      setNotification({
        type: 'success',
        message: 'Выполнено',
        description: 'Запись успешно удалена',
      });
    } catch (e) {
      setNotification({
        type: 'error',
        message: 'Ошибка',
        description: String(e),
      });
    }

    setIsDeleteModalVisible(false);
  };

  const grouped = transitions.reduce<Record<string, TransitionType[]>>((acc, curr) => {
    const category = curr.category?.name || 'Без категории';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(curr);
    return acc;
  }, {});

  const columns = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      width: 150,
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: TransitionEnum) => (
        <Tag color={type === TransitionEnum.INCOME ? 'green' : 'red'}>
          {type === TransitionEnum.INCOME ? 'Доход' : 'Расход'}
        </Tag>
      ),
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount} y.e.`,
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      key: 'category',
      render: (category: { name: string }) => category?.name || 'Без категории',
    },
    {
      title: 'Описание',
      dataIndex: 'note',
      key: 'note',
      width: 300,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      render: (record: TransitionType) => (
        <Space size={20}>
          <Tooltip title="Редактировать">
            <EditOutlined
              onClick={() => handleEdit(record)}
              style={{ cursor: 'pointer', color: '#1890ff', fontSize: '20px' }}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <DeleteOutlined
              onClick={() => handleDelete(record)}
              style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '20px' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Space size={20} align="center">
        <Typography.Title level={3} style={{ marginTop: 12 }}>
          {`Все транзакции за `}
        </Typography.Title>
        <GranularityPicker />
      </Space>

      <Collapse style={{ width: '100%' }}>
        {Object.entries(grouped).map(([category, records]) => (
          <Panel
            header={
              <Typography.Text strong>
                {getCapitalizeFirstLetter(category)} (
                {records.reduce((sum, r) => sum + r.amount, 0)} y.e.)
              </Typography.Text>
            }
            key={category}
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={records}
              pagination={false}
              size="middle"
            />
          </Panel>
        ))}
      </Collapse>

      <Modal
        title="Редактировать транзакцию"
        open={isEditModalVisible}
        loading={updateLoading}
        width={700}
        onCancel={handleCloseEditModal}
        footer={null}
      >
        <TransitionForm
          title=""
          type={selectedRecord?.type!}
          data={selectedRecord!}
          onEdit={handleUpdateTransition}
          onCancel={handleCloseEditModal}
        />
      </Modal>

      <Modal
        title="Удалить транзакцию"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={() => handleDeleteTransition(selectedRecord!)}
        okText="Удалить"
        okButtonProps={{ danger: true }}
        loading={removeLoading}
      >
        <p>Вы уверены, что хотите удалить транзакцию с описанием "{selectedRecord?.note}"?</p>
      </Modal>
    </Space>
  );
};
