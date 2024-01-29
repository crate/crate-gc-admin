export type PulsingLightProps = {
  className: string;
};

function PulsingLight({ className }: PulsingLightProps) {
  return (
    <svg
      className="align-sub inline"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" className={className} r="6">
        <animate
          attributeName="opacity"
          values="0.1;1;0.1"
          dur="1.5s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

export default PulsingLight;
