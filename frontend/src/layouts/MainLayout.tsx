import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  FireOutlined,
  RocketOutlined,
  HeartOutlined,
  CrownOutlined,
  BookOutlined,
  PictureOutlined,
  MessageOutlined,
  TeamOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Sider, Content } = Layout;

const categories = [
  { key: 'all', icon: <BookOutlined />, label: '全部', color: 'text-gray-600' },
  { key: 'xuanhuan', icon: <FireOutlined />, label: '玄幻奇幻', color: 'text-red-500' },
  { key: 'xianxia', icon: <CrownOutlined />, label: '武侠仙侠', color: 'text-blue-500' },
  { key: 'dushi', icon: <HeartOutlined />, label: '都市言情', color: 'text-pink-500' },
  { key: 'lishi', icon: <TrophyOutlined />, label: '历史军事', color: 'text-amber-600' },
  { key: 'kehuan', icon: <RocketOutlined />, label: '科幻游戏', color: 'text-cyan-500' },
  { key: 'xuanyi', icon: <MessageOutlined />, label: '悬疑灵异', color: 'text-purple-500' },
  { key: 'erciyuan', icon: <StarOutlined />, label: '二次元', color: 'text-orange-400' },
  { key: 'manhua', icon: <PictureOutlined />, label: '漫画', color: 'text-green-500' },
  { key: 'tongren', icon: <TeamOutlined />, label: '同人衍生', color: 'text-indigo-500' },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/category')) {
      const id = path.split('/')[2] || 'all';
      return id;
    }
    return '';
  };

  return (
    <Layout className="min-h-screen">
      <Header />
      <Layout className="max-w-7xl mx-auto w-full" style={{ background: 'transparent' }}>
        <Sider
          width={220}
          collapsible
          collapsed={collapsed}
          collapsedWidth={64}
          onCollapse={setCollapsed}
          className="bg-white sticky top-16 self-start hidden lg:block"
          style={{
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            borderRadius: '0 0 8px 8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
          trigger={null}
        >
          <div className="px-4 py-4 border-b">
            <div className={`font-semibold text-gray-800 ${collapsed ? 'text-center text-xs' : ''}`}>
              {collapsed ? '分类' : '📚 分类导航'}
            </div>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            inlineCollapsed={collapsed}
            items={categories.map((cat) => ({
              key: cat.key,
              icon: cat.icon,
              label: (
                <Link to={cat.key === 'all' ? '/category' : `/category/${cat.key}`} className={cat.color}>
                  {cat.label}
                </Link>
              ),
            }))}
            className="border-r-0 py-2"
          />
          {!collapsed && (
            <div className="p-4 mt-4 border-t">
              <div className="text-xs text-gray-400 mb-2">热门标签</div>
              <div className="flex flex-wrap gap-2">
                {['爽文', '甜宠', '快穿', '穿书', '重生', '系统', '种田', '无限流'].map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-2 py-1 bg-gray-50 hover:bg-primary-50 hover:text-primary-500 rounded-full text-gray-600 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </Sider>
        <Content
          className="py-6 px-4 lg:px-6"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <Outlet />
        </Content>
      </Layout>
      <Footer />
    </Layout>
  );
}
