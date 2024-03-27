import { Heading, Text } from 'components';
import type { ReactNode } from 'react';

export type CardIconDescriptorProps = {
  imageSrc: string;
  imageAlt: string;
  title: ReactNode;
  description: ReactNode;
};

function CardIconDescriptor({
  imageSrc,
  imageAlt,
  title,
  description,
}: CardIconDescriptorProps) {
  return (
    <div className="w-full text-left sm:inline-flex">
      <div className="flex size-14 min-w-[54px] items-center rounded-lg border border-crate-border-mid p-2 sm:mr-3">
        <img src={imageSrc} alt={imageAlt} />
      </div>
      <div className="mt-1 grid sm:mt-0">
        <Heading className="truncate" level={Heading.levels.h3}>
          {title}
        </Heading>
        <Text pale truncate>
          {description}
        </Text>
      </div>
    </div>
  );
}

export default CardIconDescriptor;
