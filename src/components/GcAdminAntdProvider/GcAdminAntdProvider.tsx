import { ConfigProvider } from 'antd';
import { colors } from 'constants/colors';
import { PropsWithChildren } from 'react';

type GcAdminAntdProvider = PropsWithChildren;

const GcAdminAntdProvider = ({ children }: GcAdminAntdProvider) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.blue,
          colorSplit: '#D4D4D4', // tailwind neutral-300
          colorError: '#ef4444', // tailwind red-500
          borderRadius: 4,
          paddingContentVertical: 6,
        },
        components: {
          Layout: {
            siderBg: '#262626', // Tailwind Neutral 800
          },
          Menu: {
            darkItemBg: '#262626', // Tailwind Neutral 800
            darkSubMenuItemBg: '#262626', // Tailwind Neutral 800,
            colorHighlight: colors.blue,
            darkItemColor: '#e5e5e5', // Tailwind Neutral 300
          },
          Slider: {
            trackBg: colors.blue,
            trackHoverBg: colors.blue,
            dotActiveBorderColor: colors.blue,
            handleColor: colors.blue,
          },
          Tabs: {
            colorHighlight: colors.blue,
          },
          Table: {
            headerColor: '#737373', // tailwind neutral-500
            borderColor: '#e5e5e5', // tailwind neutral-200
          },
          Input: {
            colorBorder: '#a3a3a3', // tailwind neutral-400
          },
          Select: {
            colorBorder: '#a3a3a3', // tailwind neutral-400
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};

export default GcAdminAntdProvider;
