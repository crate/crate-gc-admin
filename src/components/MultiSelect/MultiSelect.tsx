import { CaretDownOutlined } from '@ant-design/icons';
import { PropsWithChildren, useState } from 'react';
import { Button, DropdownMenu, Input } from 'components';

type MultiSelectItem = {
  label: string;
  id: string;
};

type MultiSelectProps = {
  elements: MultiSelectItem[];
  value: string[];
  onChange: (value: string[]) => void;
  searchBar?: boolean;
  testId?: string;
};

export default function MultiSelect({
  children,
  elements,
  value,
  searchBar = false,
  testId,
  onChange,
}: PropsWithChildren<MultiSelectProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredElements = elements.filter(el =>
    el.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
    if (value.length === 0) {
      onChange(filteredElements.map(el => el.label));
    } else {
      onChange([]);
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
            id={testId}
          >
            {children} <CaretDownOutlined />
          </Button>
        </span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-64">
        {searchBar && (
          <>
            <DropdownMenu.Label className="font-normal">
              <Input
                placeholder="Search..."
                value={searchTerm}
                data-testid={testId && `${testId}-search`}
                onChange={e => {
                  setSearchTerm(e.target.value);
                }}
              />
            </DropdownMenu.Label>
            <DropdownMenu.Separator />
          </>
        )}

        <DropdownMenu.CheckboxItem
          checked={elements.length === value.length}
          indeterminate={value.length > 0 && value.length < elements.length}
          onClick={() => {
            selectAll();
          }}
          data-testid={testId && `${testId}-select-all`}
        >
          Select All
        </DropdownMenu.CheckboxItem>

        {filteredElements.map(el => {
          return (
            <DropdownMenu.CheckboxItem
              key={el.id}
              checked={value.includes(el.id)}
              onClick={() => {
                triggerCheck(el.id);
              }}
              data-testid={testId && `${testId}-select-${el.id}`}
            >
              {el.label}
            </DropdownMenu.CheckboxItem>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Menu>
  );
}
