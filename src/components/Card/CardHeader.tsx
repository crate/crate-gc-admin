import { ApartmentOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CARD_HEADER_TYPES from './CardConstants';
import { ValueOf } from 'types/utils';
import { Heading } from 'components';
import type { ReactNode } from 'react';

export type CardHeaderProps = {
  type: ValueOf<typeof CARD_HEADER_TYPES>;
  title: string;
  extra: ReactNode;
};

function CardHeader({ type, title, extra }: CardHeaderProps) {
  return (
    <div className="-mx-6 -mt-6 mb-5 items-center border-b border-crate-border-light px-6 py-4 sm:flex sm:justify-between">
      <div className="flex max-w-[90%] items-center">
        {type === CardHeader.types.CLUSTER ? (
          <ApartmentOutlined className="hidden text-base text-crate-blue sm:block" />
        ) : (
          <ExclamationCircleOutlined className="hidden text-base text-red-500 sm:block" />
        )}
        <Heading className="truncate sm:ml-2" level={Heading.levels.h4}>
          {title}
        </Heading>
      </div>
      {extra}
    </div>
  );
}

CardHeader.types = CARD_HEADER_TYPES;

export default CardHeader;
