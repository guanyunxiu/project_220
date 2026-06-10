import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Badge, Avatar, Dropdown, Menu, Button, Drawer } from 'antd';
import {
  SearchOutlined,
  BellOutlined,
  UserOutlined,
  LoginOutlined,
  SettingOutlined,
  BookOutlined,
  HistoryOutlined,
  GiftOutlined,
  LogoutOutlined,
  EditOutlined,
  DashboardOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import type { MenuProps } from 'antd';

export default function Header() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, logout, unreadCount } = useAuthStore();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const userMenuItems: MenuProps['items'] = user
    ? [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: <Link to="/user">个人中心</Link>,
        },
        {
          key: 'bookshelf',
          icon: <BookOutlined />,
          label: <Link to="/user/bookshelf">我的书架</Link>,
        },
        {
          key: 'history',
          icon: <HistoryOutlined />,
          label: <Link to="/user/history">阅读历史</Link>,
        },
        {
          key: 'rewards',
          icon: <GiftOutlined />,
          label: <Link to="/user/rewards">打赏记录</Link>,
        },
        {
          type: 'divider' as const,
        },
        ...(user.role === 'author' || user.role === 'admin'
          ? [
              {
                key: 'author',
                icon: <EditOutlined />,
                label: <Link to="/author/works">作者后台</Link>,
              },
            ]
          : []),
        ...(user.role === 'admin'
          ? [
              {
                key: 'admin',
                icon: <DashboardOutlined />,
                label: <Link to="/admin/dashboard">管理后台</Link>,
              },
            ]
          : []),
        {
          type: 'divider' as const,
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: <Link to="/user/settings">账号设置</Link>,
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: () => {
            logout();
            navigate('/');
          },
        },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">📖</span>
              <span className="text-xl font-bold text-primary-500">墨染</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
                首页
              </Link>
              <Link to="/category" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
                分类
              </Link>
              <Link to="/ranking" className="text-gray-700 hover:text-primary-500 transition-colors font-medium">
                排行榜
              </Link>
            </nav>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <Input.Search
              placeholder="搜索作品、作者..."
              allowClear
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="md:hidden !text-xl"
              onClick={() => setMobileMenuOpen(true)}
            />

            <Badge count={unreadCount} className="hidden md:block">
              <Button type="text" icon={<BellOutlined />} className="!text-xl" />
            </Badge>

            {token && user ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1">
                  <Avatar src={user.avatar} icon={<UserOutlined />} size={32} />
                  <span className="hidden md:inline text-sm font-medium">
                    {user.nickname || user.username}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button type="primary" icon={<LoginOutlined />}>
                  登录
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <Drawer
        title="导航菜单"
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        width={280}
      >
        <div className="mb-4">
          <Input.Search
            placeholder="搜索作品、作者..."
            allowClear
            onSearch={handleSearch}
          />
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={[]}
          items={[
            { key: 'home', icon: <BookOutlined />, label: <Link to="/">首页</Link> },
            { key: 'category', icon: <BookOutlined />, label: <Link to="/category">分类浏览</Link> },
            { key: 'ranking', icon: <BookOutlined />, label: <Link to="/ranking">排行榜</Link> },
          ]}
        />
        {token && user && (
          <div className="mt-4 pt-4 border-t">
            <Menu
              mode="inline"
              items={[
                { key: 'user', icon: <UserOutlined />, label: <Link to="/user">个人中心</Link> },
                { key: 'bookshelf', icon: <BookOutlined />, label: <Link to="/user/bookshelf">我的书架</Link> },
                ...(user.role === 'author' || user.role === 'admin'
                  ? [{ key: 'author', icon: <EditOutlined />, label: <Link to="/author/works">作者后台</Link> }]
                  : []),
                ...(user.role === 'admin'
                  ? [{ key: 'admin', icon: <DashboardOutlined />, label: <Link to="/admin/dashboard">管理后台</Link> }]
                  : []),
              ]}
            />
          </div>
        )}
      </Drawer>
    </header>
  );
}
