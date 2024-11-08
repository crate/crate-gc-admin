export type VerticalProgressProps = {
  max: number;
  current: number;
  testId?: string;
};

export const VERTICAL_PROGRESS_BARS = 10;

function VerticalProgress({ max, current, testId }: VerticalProgressProps) {
  const normalized = Math.floor(
    (Math.min(current, max) / max) * VERTICAL_PROGRESS_BARS,
  );
  const missing =
    normalized < VERTICAL_PROGRESS_BARS
      ? new Array(VERTICAL_PROGRESS_BARS - normalized).fill('')
      : [];
  const filled = new Array(normalized).fill('');

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
            className="mb-0.5 h-[4px] w-full bg-crate-blue"
          ></div>
        );
      })}
    </div>
  );
}

export default VerticalProgress;
