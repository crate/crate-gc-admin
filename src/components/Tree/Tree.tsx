import { Tree as AntdTree } from 'antd';
import type { TreeProps as AntdTreeProps } from 'antd';

export type TreeItem = {
  title: React.ReactNode;
  key: string;
  'data-testid'?: string;
  children?: TreeItem[];
};

type CheckedStrictlyTreeProps = {
  checkStrictly: true;
  onCheck?: (checked: { checked: string[]; halfChecked: string[] }) => void;
};
type NotCheckedStrictlyTreeProps = {
  checkStrictly: false;
  onCheck?: (checked: string[]) => void;
};

type CommonTreeProps = {
  elements: TreeItem[];
  checkable?: boolean;
  defaultExpandAll?: boolean;
  className?: string;
  checkedKeys?: string[];
  noElementsLabel?: string;
  testId?: string;
};

type TreeProps = CommonTreeProps &
  (CheckedStrictlyTreeProps | NotCheckedStrictlyTreeProps);

const Tree = ({
  elements,
  checkedKeys = [],
  checkable = false,
  defaultExpandAll = false,
  noElementsLabel = 'No elements to display.',
  checkStrictly,
  onCheck,
  className,
  testId,
}: TreeProps) => {
  return (
    <div>
      {elements.length > 0 ? (
        <>
          <AntdTree
            className={className}
            treeData={elements}
            selectable={false}
            icon={false}
            checkedKeys={checkedKeys}
            checkable={checkable}
            checkStrictly={checkStrictly}
            onCheck={onCheck as AntdTreeProps['onCheck']}
            defaultExpandAll={defaultExpandAll}
            data-testid={testId}
          />
        </>
      ) : (
        noElementsLabel
      )}
    </div>
  );
};

export default Tree;
