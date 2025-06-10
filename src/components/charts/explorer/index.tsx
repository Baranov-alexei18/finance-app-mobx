import { Spin } from 'antd';
import {
  VictoryAxis,
  VictoryChart,
  VictoryLegend,
  VictoryLine,
  VictoryScatter,
  VictoryTheme,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from 'victory';

import { TransitionType } from '@/types/transition';
import { formatDate } from '@/utils/formatDate';
import { getCapitalizeFirstLetter } from '@/utils/get-capitalize-first-letter';

import styles from './styles.module.css';

type Props = {
  height?: number;
  width?: number;
  data: TransitionType[];
  loading?: boolean;
};

export const ExplorerChart = ({ data, loading, height = 400, width = 600 }: Props) => {
  if (loading) {
    return (
      <div style={{ width, height }} className={styles.spinWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  const grouped = data.reduce<Record<string, TransitionType[]>>((acc, item) => {
    const name = item.category?.name || 'Без категории';
    if (!acc[name]) acc[name] = [];
    acc[name].push(item);
    return acc;
  }, {});

  const lines = Object.entries(grouped).map(([category, items]) => {
    const sorted = [...items].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const points = sorted.map((item) => ({
      x: new Date(item.date),
      y: item.amount,
      _tooltip: `${getCapitalizeFirstLetter(category)}\n${formatDate(new Date(item.date))}\n${item.amount} y.e.`,
    }));

    const pointsScatter = points.map((item) => ({
      x: item.x,
      y: item.y,
    }));

    const color = items[0]?.category?.chartColor || '#888';

    return { category, points, pointsScatter, color };
  });

  const legendData = lines.map((line) => ({
    name: getCapitalizeFirstLetter(line.category),
    symbol: { fill: line.color },
  }));

  return (
    <VictoryChart
      height={height}
      width={width}
      theme={VictoryTheme.material}
      scale={{ x: 'time', y: 'linear' }}
      containerComponent={
        <VictoryVoronoiContainer
          labels={({ datum }) => datum._tooltip}
          labelComponent={
            <VictoryTooltip
              cornerRadius={2}
              flyoutStyle={{ fill: '#fff', stroke: '#ccc' }}
              style={{ fontSize: 10 }}
              constrainToVisibleArea
            />
          }
        />
      }
    >
      <VictoryAxis
        fixLabelOverlap
        tickFormat={(x: string | number | Date) => formatDate(new Date(x))}
        style={{ tickLabels: { fontSize: 10, angle: -45 } }}
      />
      <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10 } }} />

      {lines.map((line) => (
        <VictoryLine
          key={line.category}
          data={line.points}
          style={{
            data: { stroke: line.color, strokeWidth: 2 },
          }}
        />
      ))}

      {lines.map((line) => (
        <VictoryScatter
          key={`scatter-${line.category}`}
          data={line.pointsScatter}
          size={2}
          style={{ data: { fill: line.color } }}
        />
      ))}

      <VictoryLegend x={50} y={10} orientation="horizontal" gutter={20} data={legendData} />
    </VictoryChart>
  );
};
