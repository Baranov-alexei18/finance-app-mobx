import { useState } from 'react';
import { Progress, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { GoalType } from '@/types/goal';
import { TransitionType } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

// const { Panel } = Collapse;

type Props = {
  goals: GoalType[];
};

export const GoalsTable = ({ goals }: Props) => {
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const columns: ColumnsType<Omit<GoalType, 'target_amount'> & { targetAmount: number }> = [
    {
      title: 'Название цели',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => getCapitalizeFirstLetter(title),
    },
    {
      title: 'Прогресс',
      key: 'progress',
      render: (_, goal) => {
        const totalSaved = goal.transitions?.reduce((sum, t) => sum + t.amount, 0) || 0;
        const percent = Math.min(100, (totalSaved / goal.targetAmount) * 100);

        return (
          <Progress
            percent={percent}
            status={percent >= 100 ? 'success' : 'active'}
            format={(p) => `${p?.toFixed(2)}%`}
          />
        );
      },
    },
    {
      title: 'Сумма цели',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      render: (targetAmount: number) => `${targetAmount} y.e.`,
    },
    {
      title: 'Срок',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (endDate: string) => {
        const isOverdue = new Date(endDate) < new Date();
        return (
          <Tag color={isOverdue ? 'red' : 'blue'}>{new Date(endDate).toLocaleDateString()}</Tag>
        );
      },
    },
  ];

  const transactionColumns: ColumnsType<TransitionType> = [
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
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
      render: (category: { name: string }) =>
        getCapitalizeFirstLetter(category?.name) || 'Без категории',
    },
    {
      title: 'Описание',
      dataIndex: 'note',
      key: 'note',
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Title level={3}>Цели</Typography.Title>
      <Table
        rowKey="id"
        columns={columns as ColumnsType<GoalType>}
        dataSource={goals}
        expandable={{
          expandedRowRender: (goal) => {
            return (
              <Table
                rowKey="id"
                columns={transactionColumns}
                dataSource={goal?.transitions}
                pagination={false}
                size="small"
              />
            );
          },
          onExpand: (expanded, record) => setExpandedGoalId(expanded ? record.id! : null),
          expandedRowKeys: expandedGoalId ? [expandedGoalId] : [],
        }}
        pagination={false}
        size="middle"
      />
    </Space>
  );
};
