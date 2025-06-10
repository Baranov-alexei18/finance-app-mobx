import { useState } from 'react';
import { Spin } from 'antd';
import { VictoryContainer, VictoryLabel, VictoryPie, VictoryTheme, VictoryTooltip } from 'victory';

import { TransitionEnum, TransitionType } from '@/types/transition';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

import styles from './styles.module.css';

type Props = {
  height?: number;
  width?: number;
  data: TransitionType[];
  loading?: boolean;
  isGroupedByType?: boolean;
};

export const PieChart = ({
  data,
  height = 300,
  width = 300,
  loading = false,
  isGroupedByType = false,
}: Props) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div style={{ width, height }} className={styles.spinWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  const grouped = isGroupedByType
    ? data.reduce<Record<TransitionEnum, { amount: number; color: string }>>(
        (acc, item) => {
          const type = item.type;
          const color = type === TransitionEnum.INCOME ? '#52c41a' : '#ff4d4f';

          if (!acc[type]) {
            acc[type] = { amount: item.amount, color };
          } else {
            acc[type].amount += item.amount;
          }

          return acc;
        },
        {} as Record<TransitionEnum, { amount: number; color: string }>
      )
    : data.reduce<Record<string, { amount: number; color: string }>>((acc, item) => {
        const categoryName = item?.category?.name || 'Без категории';
        const chartColor = item?.category?.chartColor || '#ccc';

        if (!acc[categoryName]) {
          acc[categoryName] = { amount: item?.amount, color: chartColor };
        } else {
          acc[categoryName].amount += item?.amount;
        }

        return acc;
      }, {});

  const total = isGroupedByType
    ? Number(grouped?.INCOME?.amount || 0) - Number(grouped?.EXPENSE?.amount || 0)
    : Object.values(grouped).reduce((sum, val) => sum + val.amount, 0);

  const chartData = Object.entries(grouped).map(([label, { amount, color }]) => {
    const totalAmount = isGroupedByType
      ? Number(grouped?.INCOME?.amount || 0) + Number(grouped?.EXPENSE?.amount || 0)
      : total;

    const percentage = ((amount / totalAmount) * 100).toFixed(2);

    return {
      x: isGroupedByType ? (label === TransitionEnum.INCOME ? 'Доходы' : 'Расходы') : label,
      y: amount,
      label: `${getCapitalizeFirstLetter(isGroupedByType ? (label === TransitionEnum.INCOME ? 'Доходы' : 'Расходы') : label)}\n${amount?.toFixed(2)} y.e. (${percentage}%)`,
      color,
    };
  });

  const hasData = chartData.length > 0;

  return (
    <svg viewBox={`0 0 ${height} ${width}`} style={{ width: `${width}px`, height: `${height}px` }}>
      <VictoryPie
        containerComponent={<VictoryContainer responsive={false} />}
        standalone={false}
        width={width}
        height={height}
        data={hasData ? chartData : [{ x: 'Нет данных', y: 1, label: 'Нет данных', color: '#eee' }]}
        innerRadius={hasData ? 68 : 60}
        labelRadius={hasData ? 100 : 80}
        theme={VictoryTheme.clean}
        style={{
          data: {
            fill: ({ datum }) => datum.color,
            opacity: ({ index }) => {
              if (!hasData) return 1;
              return activeIndex === null || activeIndex === index ? 1 : 0.5;
            },
            stroke: hasData ? undefined : '#ccc',
            strokeWidth: hasData ? 0 : 1,
          },
        }}
        events={[
          {
            target: 'data',
            eventHandlers: {
              onMouseOver: (_, props) => {
                setActiveIndex(props.index);
                return [
                  { target: 'data', mutation: () => ({ active: true }) },
                  { target: 'labels', mutation: () => ({ active: true }) },
                ];
              },
              onMouseOut: () => {
                setActiveIndex(null);
                return [
                  { target: 'data', mutation: () => ({ active: false }) },
                  { target: 'labels', mutation: () => ({ active: false }) },
                ];
              },
            },
          },
        ]}
        labelComponent={
          <VictoryTooltip
            constrainToVisibleArea
            flyoutStyle={{
              fill: '#fff',
              stroke: '#ccc',
              strokeWidth: 1,
            }}
            style={{ fontSize: 14, fill: '#333' }}
            cornerRadius={4}
            flyoutPadding={10}
          />
        }
      />
      <VictoryLabel
        textAnchor="middle"
        style={{ fontSize: 20, fill: hasData ? '#000' : '#999' }}
        x={height / 2}
        y={width / 2}
        text={hasData ? `Всего:\n${total.toFixed(2)} y.e.` : 'Нет данных'}
      />
    </svg>
  );
};
