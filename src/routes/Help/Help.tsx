import { FaDiscourse, FaGithub, FaStackOverflow } from 'react-icons/fa';
import { BookOutlined } from '@ant-design/icons';
import { Heading } from 'components';

function Help() {
  const panels = [
    {
      icon: <FaStackOverflow />,
      text: 'Check Stack Overflow for common problems.',
      title: 'Stack Overflow',
      url: 'https://stackoverflow.com/tags/cratedb',
    },
    {
      icon: <FaDiscourse />,
      text: 'Ask CrateDB engineers in our Discourse community.',
      title: 'Discourse',
      url: 'https://community.cratedb.com/',
    },
    {
      icon: <FaGithub />,
      text: 'Code with us on GitHub.',
      title: 'GitHub',
      url: 'https://github.com/crate/crate',
    },
    {
      icon: <BookOutlined />,
      text: 'Read the CrateDB documentation.',
      title: 'CrateDB docs',
      url: 'https://cratedb.com/docs/',
    },
    {
      icon: <BookOutlined />,
      text: 'Check our pricing page for Enterprise support.',
      title: 'Enterprise support',
      url: 'https://cratedb.com/product/pricing/support-plans',
    },
  ];

  return (
    <div>
      <Heading level="h1">Help</Heading>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {panels.map(panel => (
          <a
            href={panel.url}
            target="_blank"
            className="group flex cursor-pointer gap-3 rounded bg-slate-50 p-4 transition-none hover:bg-crate-blue hover:text-white"
          >
            <div className="text-4xl">{panel.icon}</div>
            <div>
              <Heading
                level="h4"
                className="pb-1 leading-tight group-hover:text-white"
              >
                {panel.title}
              </Heading>
              <p className="leading-snug text-black group-hover:text-white">
                {panel.text}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default Help;
