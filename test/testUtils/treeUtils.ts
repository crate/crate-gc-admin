import { UserEvent } from '@testing-library/user-event';

export const checkTreeItem = async (
  tree: HTMLElement,
  itemId: string,
  user: UserEvent,
) => {
  const itemCheckbox = tree.querySelector(
    `[data-testid='${itemId}'] > .ant-tree-checkbox`,
  );

  await user.click(itemCheckbox!);
};

export const isTreeItemChecked = (tree: HTMLElement, itemId: string) => {
  const checkedElements = getCheckedTreeItems(tree);
  return checkedElements.includes(itemId);
};

export const getCheckedTreeItems = (tree: HTMLElement) => {
  const checkedItems = tree.querySelectorAll('.ant-tree-treenode-checkbox-checked');

  return Array.from(checkedItems).map(el => el.getAttribute('data-testid')!);
};
