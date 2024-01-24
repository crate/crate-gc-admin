import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  Line,
  ComposedChart,
  Legend,
} from 'recharts';
import { Heading } from '@crate.io/crate-ui-components';
import { useState } from 'react';
import { Payload } from 'recharts/types/component/DefaultLegendContent';

type ValueType = {
  time: number;
} & object;

type GCChartElementConfig = {
  key: string;
  name: string;
  stroke?: string;
  fill?: string;
};

type GCChartConfig = {
  lines?: GCChartElementConfig[] | undefined;
  areas?: GCChartElementConfig[] | undefined;
  start_from?: number | undefined;
};

type GCChartParams = {
  title: string;
  config: GCChartConfig;
  data: ValueType[] | undefined;
};

// I made these up completely. Please suggest better colours.
const colors = [
  // These three make the Lithuanian flag. Because reasons.
  'rgb(234 179 8)',
  'rgb(34 197 94)',
  'rgb(239 68 68)',
  // Black is the new black.
  'rgb(0 0 0)',
  // I typed random numbers in, turns out its greenish.
  'rgb(150 200 80)',
];

function GCChart({ title, config, data }: GCChartParams) {
  const [showHide, setShowHide] = useState<object>({});
  let key = 0;

  const nextKey = () => {
    return key++;
  };

  /*
  If we get a start_from specified and it is less than the first timestamp,
  we will backfill the data up to the first timestamp with null values.
  This is so that the chart can start on the right hand side, and slowly fill up
  as more datapoints are being added.
   */
  const firstTs = data?.slice(0, 1).pop()?.time;
  const actualData = data ? [...data] : [];
  if (firstTs && config.start_from && config.start_from < firstTs) {
    let ts = config.start_from;
    const prefix = [];
    while (ts < firstTs) {
      const dp = { time: ts };
      ts += 10 * 1000;
      prefix.push(dp);
    }
    actualData.unshift(...prefix);
  }

  const legendSelect = (e: Payload) => {
    setShowHide({
      ...showHide,
      // @ts-expect-error access {} with string index.
      [e.dataKey]: !showHide[e.dataKey],
    });
  };

  const shouldHide = (key: string) => {
    // @ts-expect-error access {} with string index
    return showHide[key];
  };

  return (
    <div className="bg-white p-2">
      <Heading level={Heading.levels.h3}>{title}</Heading>
      <ResponsiveContainer minWidth={200} minHeight={400} maxHeight={400}>
        <ComposedChart
          data={actualData}
          margin={{
            top: 0,
            right: 20,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey={v => new Date(v.time).toLocaleTimeString()} />
          <YAxis />
          <Tooltip />
          <Legend onClick={legendSelect} />
          {config?.areas?.map(area => {
            return (
              <Area
                key={`area-${nextKey()}`}
                type="monotone"
                dataKey={area.key}
                stroke="#00a6d1"
                fill="#cbe9f1"
                name={area.name}
                dot={false}
                isAnimationActive={false}
                hide={shouldHide(area.key)}
              />
            );
          })}
          {config?.lines?.map(line => {
            const k = nextKey();
            return (
              <Line
                key={`line-${k}`}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={colors[k % colors.length]}
                dot={false}
                connectNulls={true}
                isAnimationActive={false}
                hide={shouldHide(line.key)}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GCChart;
