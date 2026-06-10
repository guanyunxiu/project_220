import { Link, Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  UserOutlined,
  AuditOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: <Link to="/admin/dashboard">数据概览</Link> },
  { key: 'works', icon: <BookOutlined />, label: <Link to="/admin/works">作品管理</Link> },
  { key: 'users', icon: <UserOutlined />, label: <Link to="/admin/users">用户管理</Link> },
  { key: 'reviews', icon: <AuditOutlined />, label: <Link to="/admin/reviews">内容审核</Link> },
  { key: 'analytics', icon: <BarChartOutlined />, label: <Link to="/admin/analytics">数据分析</Link> },
];

export default function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const selectedKey = location.pathname.split('/').pop() || 'dashboard';

  const userMenuItems = [
    { key: 'home', icon: <DashboardOutlined />, label: <Link to="/">返回首页</Link> },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => logout(),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider width={240} theme="dark">
        <div className="h-16 flex items-center justify-center gap-2 border-b border-gray-700">
          <span className="text-2xl">🛡️</span>
          <span className="text-xl font-bold text-white">墨染管理后台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="border-r-0 mt-2"
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow-sm px-6 flex items-center justify-between" style={{ padding: 0 }}>
          <div className="px-6 text-gray-600">
            欢迎使用墨染文学管理后台
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="px-6 cursor-pointer hover:bg-gray-50 h-16 flex items-center gap-2">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span className="font-medium">{user?.nickname || user?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
