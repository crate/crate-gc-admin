import React from 'react';
import { docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import ReactSyntaxHighlighter from 'react-syntax-highlighter';
import CustomPreTag from './CustomPreTag';
import CopyToClipboard from '../../components/CopyToClipboard';
import Heading from '../../components/Heading';
import Text from '../../components/Text';

export type SyntaxHighlighterProps = {
  language?: string;
  children: string;
  title?: React.ReactNode;
  helpText?: React.ReactNode;
};

function SyntaxHighlighter({
  language,
  title,
  children,
  helpText,
}: SyntaxHighlighterProps) {
  return (
    <div className="flex flex-col gap-2">
      {title && <Heading level={Heading.levels.h4}>{title}</Heading>}

      <div className="rounded-lg bg-neutral-100 py-1 pl-2 pr-4">
        <div className="flex items-start justify-between">
          <ReactSyntaxHighlighter
            language={language}
            PreTag={CustomPreTag}
            style={docco}
            wrapLongLines
          >
            {children}
          </ReactSyntaxHighlighter>

          <CopyToClipboard textToCopy={children}>
            <Text className="py-2 text-sm text-crate-blue">Copy</Text>
          </CopyToClipboard>
        </div>
      </div>
      {helpText && (
        <div className="mt-1 flex items-start justify-between px-1">
          <div className="mr-2 text-base text-neutral-500">{helpText}</div>
        </div>
      )}
    </div>
  );
}

export default SyntaxHighlighter;
