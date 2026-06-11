import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Badge, Avatar, Dropdown, Menu, Button, Drawer, Popover, List, Empty, Tag, Space } from 'antd';
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
  CheckOutlined,
  DeleteOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { useAuthStore, NotificationItem } from '../store/useAuthStore';
import dayjs from 'dayjs';
import type { MenuProps } from 'antd';

const typeIconMap: Record<string, string> = {
  system: '🔔',
  reward: '💰',
  comment: '💬',
  reply: '↩️',
  subscription: '📖',
  audit: '📋',
};

const typeTextMap: Record<string, string> = {
  system: '系统',
  reward: '打赏',
  comment: '评论',
  reply: '回复',
  subscription: '订阅',
  audit: '审核',
};

const typeColorMap: Record<string, string> = {
  system: 'blue',
  reward: 'gold',
  comment: 'cyan',
  reply: 'purple',
  subscription: 'green',
  audit: 'orange',
};

export default function Header() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, token, logout, unreadCount, notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } =
    useAuthStore();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleNotifClick = (n: NotificationItem) => {
    if (!n.isRead) {
      markNotificationRead(n.id);
    }
    if (n.relatedUrl) {
      navigate(n.relatedUrl);
    }
  };

  const notificationContent = (
    <div className="w-[360px] max-h-[480px] overflow-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b sticky top-0 bg-white z-10">
        <span className="font-medium">消息通知 ({notifications.length})</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => markAllNotificationsRead()}>
            全部已读
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} className="py-12" />
      ) : (
        <List
          dataSource={notifications.slice(0, 50)}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              className={`!px-3 !py-2.5 cursor-pointer hover:bg-gray-50 ${!item.isRead ? 'bg-blue-50/40' : ''}`}
              onClick={() => handleNotifClick(item)}
            >
              <List.Item.Meta
                avatar={
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {typeIconMap[item.type] || '📩'}
                  </div>
                }
                title={
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {!item.isRead && <Badge color="red" />}
                      <Tag color={typeColorMap[item.type]} style={{ margin: 0 }}>
                        {typeTextMap[item.type] || '消息'}
                      </Tag>
                      <span className="font-medium truncate text-[13px]">{item.title}</span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      className="!text-gray-400 hover:!text-red-500 !p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                    />
                  </div>
                }
                description={
                  <div>
                    <p className="text-xs text-gray-600 line-clamp-2 m-0">{item.content}</p>
                    <p className="text-xs text-gray-400 mt-1 mb-0">{dayjs(item.createdAt).fromNow()}</p>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      {notifications.length > 0 && (
        <div className="border-t px-3 py-2 sticky bottom-0 bg-white">
          <Link to="/user/notifications" className="text-xs text-primary-500 hover:underline flex items-center justify-center gap-1">
            <ReadOutlined /> 查看全部消息
          </Link>
        </div>
      )}
    </div>
  );

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

            {token && user ? (
              <Popover
                content={notificationContent}
                trigger="click"
                placement="bottomRight"
                overlayInnerStyle={{ padding: 0, width: 360 }}
              >
                <Badge count={unreadCount} className="!leading-none">
                  <Button type="text" icon={<BellOutlined />} className="!text-xl" />
                </Badge>
              </Popover>
            ) : (
              <Badge count={0} className="hidden md:block">
                <Button type="text" icon={<BellOutlined />} className="!text-xl" />
              </Badge>
            )}

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
          <Input.Search placeholder="搜索作品、作者..." allowClear onSearch={handleSearch} />
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
