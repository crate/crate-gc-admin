import { CaretDownOutlined } from '@ant-design/icons';
import { Button, DropdownMenu, Input } from 'components';
import { PropsWithChildren, useState } from 'react';

type MultiSelectItem = {
  label: string;
  id: string;
};

type MultiSelectProps = {
  elements: MultiSelectItem[];
  value: string[];
  onChange: (value: string[]) => void;
};

export default function MultiSelect({
  children,
  elements,
  value,
  onChange,
}: PropsWithChildren<MultiSelectProps>) {
  const [searchTerm, setSearchTerm] = useState('');

  const triggerCheck = (id: string) => {
    let newSelectedElements = value;
    if (value.includes(id)) {
      // element is already checked, needs to be un-checked
      newSelectedElements = value.filter(el => el !== id);
    } else {
      // element needs to be checked
      newSelectedElements = [...value, id];
    }

    onChange(newSelectedElements);
  };

  const selectAll = () => {
    if (value.length === elements.length) {
      onChange([]);
    } else {
      onChange(elements.map(el => el.label));
    }
  };

  return (
    <DropdownMenu.Menu>
      <DropdownMenu.Trigger asChild>
        <span>
          <Button
            kind={Button.kinds.SECONDARY}
            className="bg-white"
            size={Button.sizes.SMALL}
          >
            {children} <CaretDownOutlined />
          </Button>
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-64">
        <DropdownMenu.Label className="font-normal">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
            }}
          />
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem
          checked={elements.length === value.length}
          indeterminate={value.length > 0 && value.length < elements.length}
          onClick={() => {
            selectAll();
          }}
        >
          Select All
        </DropdownMenu.CheckboxItem>

        {elements
          .filter(el => el.label.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(el => {
            return (
              <DropdownMenu.CheckboxItem
                key={el.id}
                checked={value.includes(el.id)}
                onClick={() => {
                  triggerCheck(el.id);
                }}
              >
                {el.label}
              </DropdownMenu.CheckboxItem>
            );
          })}
      </DropdownMenu.Content>
    </DropdownMenu.Menu>
  );
}