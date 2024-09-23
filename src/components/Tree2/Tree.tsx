import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export type TreeNode = {
  key: string;
  label: React.ReactNode;
  testId?: string;
  children?: TreeNode[];
};

type TreeNodeProps = {
  node: TreeNode;
  level?: number;
};

export type TreeProps = {
  className?: string;
  nodes: TreeNode[];
  testId?: string;
};

const Tree2 = ({ className, nodes, testId }: TreeProps) => {
  return (
    <div className={className} data-testid={testId}>
      {nodes.map(node => (
        <TreeNode key={node.key} node={node} />
      ))}
    </div>
  );
};

const TreeNode = ({ node, level = 0 }: TreeNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div data-testid={node.testId}>
      <div
        className={`flex select-none items-center gap-0.5 py-0.5`}
        aria-expanded={isExpanded}
        tabIndex={0}
      >
        <span
          className="h-4 w-4 cursor-pointer"
          onClick={toggleExpand}
          role="button"
        >
          {hasChildren && (
            <ChevronRight
              className={`opacity-50 transition-transform duration-100 hover:opacity-100 ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}
              size={14}
            />
          )}
        </span>
        {node.label}
      </div>
      {hasChildren && (
        <div
          className={`duration-400 ml-[6px] overflow-hidden border-l-2 border-neutral-100 pl-2.5 transition-all ${isExpanded ? 'max-h-dvh' : 'max-h-0'}`}
        >
          {node.children!.map(childNode => (
            <TreeNode key={childNode.key} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Tree2;
