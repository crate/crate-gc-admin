import { NodeStatus } from "types/cratedb";

export type VerticalProgressProps = {
  max: number;
  current: number;
  status?: NodeStatus;
  testId?: string;
};

export const VERTICAL_PROGRESS_BARS = 10;

function VerticalProgress({ max, current, status, testId }: VerticalProgressProps) {
  const normalized = Math.floor(
    (Math.min(current, max) / max) * VERTICAL_PROGRESS_BARS,
  );
  const missing =
    normalized < VERTICAL_PROGRESS_BARS
      ? new Array(VERTICAL_PROGRESS_BARS - normalized).fill('')
      : [];
  const filled = new Array(normalized).fill('');
  let fillColor = 'bg-crate-blue';
  if (status === 'CRITICAL') {
    fillColor = 'bg-red-400';
  } else if (status === 'WARNING') {
    fillColor = 'bg-amber-400';
  }

  return (
    <div className="h-full" data-testid={testId}>
      {missing.map((_, index) => {
        return (
          <div
            key={`${index}_missing`}
            className="mb-0.5 h-[4px] w-full bg-gray-300"
          ></div>
        );
      })}
      {filled.map((_, index) => {
        return (
          <div
            key={`${index}_filled`}
            className={`mb-0.5 h-[4px] w-full ${fillColor}`}
          ></div>
        );
      })}
    </div>
  );
}

export default VerticalProgress;
