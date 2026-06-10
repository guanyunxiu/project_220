import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Avatar,
  message,
  Popconfirm,
  Switch,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PlusOutlined,
  CrownOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Search } = Input;

enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  ADMIN = 'admin',
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

interface User {
  id: string;
  username: string;
  nickname: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  balance: number;
  bio: string;
  totalReads: number;
  totalWorks: number;
  totalFollowers: number;
  totalFollowing: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLoginAt: string;
  lastLoginIp: string;
  createdAt: string;
}

const roleMap: Record<UserRole, { text: string; color: string; icon: any }> = {
  [UserRole.USER]: { text: '普通用户', color: 'default', icon: <UserOutlined /> },
  [UserRole.AUTHOR]: { text: '创作者', color: 'green', icon: <EditOutlined /> },
  [UserRole.ADMIN]: { text: '管理员', color: 'red', icon: <CrownOutlined /> },
};

const statusMap: Record<UserStatus, { text: string; color: string }> = {
  [UserStatus.ACTIVE]: { text: '正常', color: 'green' },
  [UserStatus.INACTIVE]: { text: '未激活', color: 'orange' },
  [UserStatus.BANNED]: { text: '已封禁', color: 'red' },
};

const UsersPage: React.FC = () => {
  const [data, setData] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      nickname: '超级管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      avatar: '',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      balance: 10000.00,
      bio: '平台管理员',
      totalReads: 1567,
      totalWorks: 0,
      totalFollowers: 1289,
      totalFollowing: 12,
      emailVerified: true,
      phoneVerified: true,
      lastLoginAt: '2025-06-10 09:15:30',
      lastLoginIp: '192.168.1.100',
      createdAt: '2024-01-01 00:00:00',
    },
    {
      id: '2',
      username: 'zhangsan',
      nickname: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      avatar: '',
      role: UserRole.AUTHOR,
      status: UserStatus.ACTIVE,
      balance: 5680.50,
      bio: '科幻小说作家,代表作《星辰大海的冒险》',
      totalReads: 23456,
      totalWorks: 5,
      totalFollowers: 8923,
      totalFollowing: 156,
      emailVerified: true,
      phoneVerified: true,
      lastLoginAt: '2025-06-10 08:45:12',
      lastLoginIp: '10.0.0.5',
      createdAt: '2024-01-15 10:30:00',
    },
    {
      id: '3',
      username: 'lisi',
      nickname: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      avatar: '',
      role: UserRole.AUTHOR,
      status: UserStatus.ACTIVE,
      balance: 3240.00,
      bio: '都市修仙类作家',
      totalReads: 18901,
      totalWorks: 3,
      totalFollowers: 5678,
      totalFollowing: 89,
      emailVerified: true,
      phoneVerified: false,
      lastLoginAt: '2025-06-09 22:30:45',
      lastLoginIp: '172.16.0.10',
      createdAt: '2024-02-20 09:15:00',
    },
    {
      id: '4',
      username: 'wangwu',
      nickname: '王五',
      email: 'wangwu@example.com',
      phone: '13800138003',
      avatar: '',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      balance: 128.80,
      bio: '',
      totalReads: 456,
      totalWorks: 0,
      totalFollowers: 23,
      totalFollowing: 56,
      emailVerified: true,
      phoneVerified: true,
      lastLoginAt: '2025-06-10 10:20:00',
      lastLoginIp: '192.168.2.50',
      createdAt: '2024-05-10 14:00:00',
    },
    {
      id: '5',
      username: 'baduser',
      nickname: '坏用户',
      email: 'bad@example.com',
      phone: '13800138099',
      avatar: '',
      role: UserRole.USER,
      status: UserStatus.BANNED,
      balance: 50.00,
      bio: '违规用户',
      totalReads: 78,
      totalWorks: 0,
      totalFollowers: 2,
      totalFollowing: 1,
      emailVerified: false,
      phoneVerified: false,
      lastLoginAt: '2025-06-05 12:00:00',
      lastLoginIp: '10.0.0.99',
      createdAt: '2024-08-01 10:00:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      dataIndex: 'username',
      key: 'username',
      fixed: 'left',
      width: 260,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={48} src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>
              {record.nickname || record.username}
              {record.role === UserRole.ADMIN && <CrownOutlined style={{ color: '#faad14', marginLeft: 4 }} />}
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>@{record.username}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: UserRole) => (
        <Tag color={roleMap[role].color} icon={roleMap[role].icon}>
          {roleMap[role].text}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: UserStatus) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 100,
      sorter: (a, b) => a.balance - b.balance,
      render: (val) => `¥${val.toLocaleString()}`,
    },
    {
      title: '作品数',
      dataIndex: 'totalWorks',
      key: 'totalWorks',
      width: 80,
      sorter: (a, b) => a.totalWorks - b.totalWorks,
      render: (val, record) => (
        record.role !== UserRole.USER ? val : '-'
      ),
    },
    {
      title: '粉丝数',
      dataIndex: 'totalFollowers',
      key: 'totalFollowers',
      width: 80,
      sorter: (a, b) => a.totalFollowers - b.totalFollowers,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '阅读数',
      dataIndex: 'totalReads',
      key: 'totalReads',
      width: 90,
      sorter: (a, b) => a.totalReads - b.totalReads,
      render: (val) => val.toLocaleString(),
    },
    {
      title: '邮箱验证',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      width: 90,
      render: (val) => val ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>已验证</Tag>
      ) : (
        <Tag color="orange">未验证</Tag>
      ),
    },
    {
      title: '手机验证',
      dataIndex: 'phoneVerified',
      key: 'phoneVerified',
      width: 90,
      render: (val) => val ? (
        <Tag color="green" icon={<CheckCircleOutlined />}>已验证</Tag>
      ) : (
        <Tag color="orange">未验证</Tag>
      ),
    },
    {
      title: '最后登录',
      key: 'lastLogin',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12 }}>{record.lastLoginAt}</div>
          <div style={{ fontSize: 12, color: '#999' }}>IP: {record.lastLoginIp}</div>
        </div>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 240,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          >
            角色
          </Button>
          {record.status !== UserStatus.BANNED ? (
            <Popconfirm
              title="确定要封禁该用户吗?"
              onConfirm={() => handleToggleStatus(record.id, UserStatus.BANNED)}
              okText="确定封禁"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
              >
                封禁
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定要解封该用户吗?"
              onConfirm={() => handleToggleStatus(record.id, UserStatus.ACTIVE)}
              okText="确定解封"
              cancelText="取消"
            >
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
              >
                解封
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除该用户吗?"
            description="此操作不可恢复"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEditRole = (user: User) => {
    setEditingUser(user);
    roleForm.setFieldsValue({
      role: user.role,
      balance: user.balance,
    });
    setRoleModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleToggleStatus = (id: string, status: UserStatus) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
    message.success(`操作成功: ${statusMap[status].text}`);
  };

  const handleRoleModalOk = async () => {
    try {
      const values = await roleForm.validateFields();
      if (editingUser) {
        setData(
          data.map((item) =>
            item.id === editingUser.id ? { ...item, ...values } : item
          )
        );
        message.success('用户信息已更新');
      }
      setRoleModalVisible(false);
      setEditingUser(null);
      roleForm.resetFields();
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.username.toLowerCase().includes(searchText.toLowerCase()) ||
      item.nickname.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase());
    const matchRole = !roleFilter || item.role === roleFilter;
    const matchStatus = !statusFilter || item.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TeamOutlined /> 用户管理
        </h2>
        <Button icon={<PlusOutlined />}>批量导入</Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索用户名/昵称/邮箱"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="用户角色"
          allowClear
          style={{ width: 140 }}
          value={roleFilter || undefined}
          onChange={(val) => setRoleFilter(val || '')}
        >
          {Object.entries(roleMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.text}</Option>
          ))}
        </Select>
        <Select
          placeholder="用户状态"
          allowClear
          style={{ width: 140 }}
          value={statusFilter || undefined}
          onChange={(val) => setStatusFilter(val || '')}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.text}</Option>
          ))}
        </Select>
      </div>

      <Table<User>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1600 }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个用户`,
        }}
      />

      <Modal
        title={`编辑用户 - ${editingUser?.nickname || editingUser?.username}`}
        open={roleModalVisible}
        onOk={handleRoleModalOk}
        onCancel={() => {
          setRoleModalVisible(false);
          setEditingUser(null);
          roleForm.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={500}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item
            label="用户角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select>
              <Option value={UserRole.USER}>普通用户</Option>
              <Option value={UserRole.AUTHOR}>创作者</Option>
              <Option value={UserRole.ADMIN}>管理员</Option>
            </Select>
          </Form.Item>
          <Form.Item label="调整余额(元)" name="balance">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={10}
              formatter={(value) => `¥ ${value}`}
              parser={(value) => value?.replace(/¥\s?/g, '') as any}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;
