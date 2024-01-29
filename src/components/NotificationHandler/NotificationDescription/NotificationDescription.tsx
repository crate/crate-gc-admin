import Text from '../../../components/Text';

type Message = {
  keyName: string;
  text: string;
};

export type NotificationDescriptionProps = {
  messages?: null | string | JSX.Element | Message[];
};

function NotificationDescription({ messages }: NotificationDescriptionProps) {
  return Array.isArray(messages) ? (
    <div className="mt-2">
      {messages.map(message => (
        <div key={message.keyName} className="mb-4">
          <Text className="font-bold">{`${message.keyName}: `}</Text>
          <Text>{message.text}</Text>
        </div>
      ))}
    </div>
  ) : (
    <>{messages}</>
  );
}

export default NotificationDescription;
