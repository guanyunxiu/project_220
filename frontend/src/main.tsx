import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import 'antd/dist/reset.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import App from './App';
import './styles/globals.css';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const theme = {
  token: {
    colorPrimary: '#f97316',
    borderRadius: 8,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Button: {
      controlHeight: 40,
    },
    Input: {
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 12,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider locale={zhCN} theme={theme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
