import React from 'react';
import { Tree, message } from 'antd';
import { DataNode } from 'antd/lib/tree';
import TypeAwareValue from '../TypeAwareValue/TypeAwareValue.tsx';

export type JSONTreeParams = {
  json: object;
};

const { DirectoryTree } = Tree;

function JSONTree({ json }: JSONTreeParams) {
  const copyToClipboard = async (value: string) => {
    message.info({ content: 'Copied!' }, 1);
    await navigator.clipboard.writeText(value);
  };

  const typeTitle = (
    val: object | object[] | string | number | boolean | undefined,
  ) => {
    if (Array.isArray(val)) {
      const len = val.length;
      return (
        <span>
          Array <span className="text-crate-blue">[{len}]</span>
        </span>
      );
    } else if (typeof val === 'object') {
      return 'Object';
    }
    return;
  };

  // the parentIsArray is used to determine if the key is an array index
  // CrateDB uses 1-based indexing, not 0-based as in JavaScript
  const buildTree = (
    obj: object | object[] | string | number | boolean,
    config: { toplevel?: boolean; path?: string } = { toplevel: false, path: '' },
    parentIsArray: boolean = false,
  ): DataNode[] | undefined => {
    if (!obj) {
      return;
    }

    if (config.toplevel) {
      return [
        {
          key: `TLObject`,
          title: typeTitle(obj),
          children: buildTree(
            obj,
            { toplevel: false, path: '' },
            Array.isArray(obj),
          ),
        },
      ];
    }

    return Object.keys(obj).map(k => {
      // @ts-expect-error can be any type
      const val = obj[k];
      let children;
      const isArray = Array.isArray(val);
      if (isArray || typeof val === 'object') {
        children = buildTree(val, { path: `${config.path}-${k}` }, isArray);
      }
      const title: string | React.JSX.Element = children ? (
        <div key={`${config.path}-${k}-title`}>
          {k}: <span className="opacity-50">{typeTitle(val)}</span>
        </div>
      ) : (
        <div
          key={`${config.path}-${k}-title`}
          onDoubleClick={async () => {
            await copyToClipboard(val);
          }}
        >
          {parentIsArray ? parseInt(k) + 1 : k}:{' '}
          <TypeAwareValue value={val} quoteStrings />
        </div>
      );
      return { key: `${config.path}-${k}`, title: title, children: children };
    });
  };

  return (
    <DirectoryTree
      selectable={false}
      icon={false}
      treeData={buildTree(json, { toplevel: true })}
    />
  );
}

export default JSONTree;
