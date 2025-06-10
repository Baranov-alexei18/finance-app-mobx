import { useNavigate } from 'react-router';
import { Button, List, Space, Tag, Typography } from 'antd';

import { ROUTE_PATHS } from '@/constants/route-path';
import { TransitionEnum, TransitionType } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

type Props = {
  type: TransitionEnum;
  transitions: TransitionType[];
};

export const RecentTransitions = ({ type, transitions }: Props) => {
  const navigate = useNavigate();
  const filtered = transitions
    .filter((t) => t.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const title = type === TransitionEnum.INCOME ? 'Последние доходы' : 'Последние расходы';

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Typography.Title level={2}>{title}</Typography.Title>
      <List
        dataSource={filtered}
        renderItem={(item) => (
          <List.Item>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Text>
                  {getCapitalizeFirstLetter(item.category?.name || 'Без категории')}
                </Typography.Text>
                <Tag color={type === TransitionEnum.INCOME ? 'green' : 'red'}>
                  {type === TransitionEnum.INCOME ? '+' : '-'}
                  {item.amount} y.e.
                </Tag>
              </div>
              <Typography.Text type="secondary">
                {new Date(item.date).toLocaleDateString()}
              </Typography.Text>
            </div>
          </List.Item>
        )}
      />
      <Button
        variant="outlined"
        onClick={() =>
          navigate(type === TransitionEnum.INCOME ? ROUTE_PATHS.income : ROUTE_PATHS.expense)
        }
      >
        {`Перейти к странице ${type === TransitionEnum.INCOME ? 'доходов' : 'расходов'}`}
      </Button>
    </Space>
  );
};
