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
  message,
  Card,
  Tabs,
  DatePicker,
  Upload,
  Alert,
  Switch,
  InputNumber,
  Tooltip,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  NotificationOutlined,
  SendOutlined,
  BellOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
  WarningOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TabsProps, UploadProps } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

enum NotificationType {
  SYSTEM = 'system',
  COMMENT = 'comment',
  LIKE = 'like',
  FOLLOW = 'follow',
  SUBSCRIPTION = 'subscription',
  REWARD = 'reward',
  CHAPTER_UPDATE = 'chapter_update',
  MENTION = 'mention',
  REPORT = 'report',
  NEWS = 'news',
}

enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

enum SendTargetType {
  ALL = 'all',
  BY_ROLE = 'by_role',
  BY_USER_IDS = 'by_user_ids',
  BY_CONDITION = 'by_condition',
}

interface NotificationItem {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  senderId: string | null;
  senderName: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  content: string;
  imageUrl: string | null;
  linkUrl: string | null;
  isRead: boolean;
  isPinned: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

interface SendRecord {
  id: string;
  title: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetType: SendTargetType;
  targetCount: number;
  sentCount: number;
  readCount: number;
  status: 'sending' | 'sent' | 'failed' | 'scheduled';
  createdAt: string;
  scheduledAt: string | null;
}

const typeMap: Record<NotificationType, { text: string; color: string; icon: any }> = {
  [NotificationType.SYSTEM]: { text: '系统通知', color: 'blue', icon: <NotificationOutlined /> },
  [NotificationType.COMMENT]: { text: '评论通知', color: 'cyan', icon: <BellOutlined /> },
  [NotificationType.LIKE]: { text: '点赞通知', color: 'red', icon: <BellOutlined /> },
  [NotificationType.FOLLOW]: { text: '关注通知', color: 'purple', icon: <BellOutlined /> },
  [NotificationType.SUBSCRIPTION]: { text: '订阅通知', color: 'gold', icon: <BellOutlined /> },
  [NotificationType.REWARD]: { text: '打赏通知', color: 'orange', icon: <BellOutlined /> },
  [NotificationType.CHAPTER_UPDATE]: { text: '更新通知', color: 'green', icon: <BellOutlined /> },
  [NotificationType.MENTION]: { text: '提及通知', color: 'magenta', icon: <BellOutlined /> },
  [NotificationType.REPORT]: { text: '举报通知', color: 'volcano', icon: <WarningOutlined /> },
  [NotificationType.NEWS]: { text: '新闻公告', color: 'geekblue', icon: <NotificationOutlined /> },
};

const priorityMap: Record<NotificationPriority, { text: string; color: string }> = {
  [NotificationPriority.LOW]: { text: '低', color: 'default' },
  [NotificationPriority.NORMAL]: { text: '普通', color: 'blue' },
  [NotificationPriority.HIGH]: { text: '高', color: 'orange' },
  [NotificationPriority.URGENT]: { text: '紧急', color: 'red' },
};

const NotificationsPage: React.FC = () => {
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [sendForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
  const [dateRange, setDateRange] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      userId: '101',
      username: '书虫小明',
      avatar: '',
      senderId: null,
      senderName: null,
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.HIGH,
      title: '系统维护通知',
      content: '平台将于6月15日凌晨2:00-4:00进行系统维护,期间将暂停服务,敬请谅解。',
      imageUrl: null,
      linkUrl: null,
      isRead: true,
      isPinned: true,
      readAt: '2025-06-10 09:15:00',
      createdAt: '2025-06-09 18:00:00',
      expiresAt: '2025-06-16 00:00:00',
    },
    {
      id: '2',
      userId: '102',
      username: '路人甲',
      avatar: '',
      senderId: '201',
      senderName: '土豪读者',
      type: NotificationType.REWARD,
      priority: NotificationPriority.NORMAL,
      title: '收到新的打赏',
      content: '您的作品《星辰大海的冒险》收到来自土豪读者的火箭打赏!',
      imageUrl: null,
      linkUrl: '/works/1',
      isRead: false,
      isPinned: false,
      readAt: null,
      createdAt: '2025-06-10 10:30:45',
      expiresAt: null,
    },
    {
      id: '3',
      userId: '103',
      username: '张三',
      avatar: '',
      senderId: null,
      senderName: null,
      type: NotificationType.COMMENT,
      priority: NotificationPriority.NORMAL,
      title: '收到新评论',
      content: '书虫小明 评论了您的章节《第一章: 星空下的少年》: "这一章写得太好了!"',
      imageUrl: null,
      linkUrl: '/works/1/chapters/1',
      isRead: false,
      isPinned: false,
      readAt: null,
      createdAt: '2025-06-10 11:00:00',
      expiresAt: null,
    },
  ]);

  const [sendRecords] = useState<SendRecord[]>([
    {
      id: 'R001',
      title: '系统维护通知',
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.HIGH,
      targetType: SendTargetType.ALL,
      targetCount: 45678,
      sentCount: 45678,
      readCount: 32456,
      status: 'sent',
      createdAt: '2025-06-09 18:00:00',
      scheduledAt: null,
    },
    {
      id: 'R002',
      title: '618活动预告',
      type: NotificationType.NEWS,
      priority: NotificationPriority.NORMAL,
      targetType: SendTargetType.BY_ROLE,
      targetCount: 1289,
      sentCount: 856,
      readCount: 423,
      status: 'sending',
      createdAt: '2025-06-10 10:00:00',
      scheduledAt: null,
    },
    {
      id: 'R003',
      title: '作者专属福利',
      type: NotificationType.SYSTEM,
      priority: NotificationPriority.LOW,
      targetType: SendTargetType.BY_ROLE,
      targetCount: 568,
      sentCount: 568,
      readCount: 234,
      status: 'sent',
      createdAt: '2025-06-08 14:00:00',
      scheduledAt: null,
    },
    {
      id: 'R004',
      title: '周末更新提醒',
      type: NotificationType.CHAPTER_UPDATE,
      priority: NotificationPriority.NORMAL,
      targetType: SendTargetType.BY_CONDITION,
      targetCount: 8923,
      sentCount: 0,
      readCount: 0,
      status: 'scheduled',
      createdAt: '2025-06-10 09:00:00',
      scheduledAt: '2025-06-14 10:00:00',
    },
  ]);

  const notificationColumns: ColumnsType<NotificationItem> = [
    {
      title: '接收用户',
      dataIndex: 'username',
      key: 'username',
      width: 160,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={36} src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.username}</div>
            {record.isPinned && <Tag color="red" style={{ marginTop: 2 }}>置顶</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: NotificationType) => (
        <Tag color={typeMap[type].color} icon={typeMap[type].icon}>
          {typeMap[type].text}
        </Tag>
      ),
    },
    {
      title: '标题/内容',
      key: 'content',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {record.isRead ? record.title : (
              <span><span style={{ color: '#ff4d4f', marginRight: 4 }}>●</span>{record.title}</span>
            )}
            <Tag color={priorityMap[record.priority].color} style={{ marginLeft: 8 }}>
              {priorityMap[record.priority].text}
            </Tag>
          </div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
            {record.content.length > 80 ? record.content.slice(0, 80) + '...' : record.content}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (val) => val ? (
        <Tag color="default">已读</Tag>
      ) : (
        <Tag color="blue">未读</Tag>
      ),
    },
    {
      title: '发送时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
  ];

  const recordColumns: ColumnsType<SendRecord> = [
    {
      title: '记录ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (val) => <code>{val}</code>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <Tag color={typeMap[record.type].color} style={{ marginTop: 4 }}>
            {typeMap[record.type].text}
          </Tag>
          <Tag color={priorityMap[record.priority].color} style={{ marginTop: 4 }}>
            {priorityMap[record.priority].text}
          </Tag>
        </div>
      ),
    },
    {
      title: '目标范围',
      key: 'target',
      width: 160,
      render: (_, record) => {
        const targetLabels: Record<SendTargetType, string> = {
          [SendTargetType.ALL]: '全站用户',
          [SendTargetType.BY_ROLE]: '按角色',
          [SendTargetType.BY_USER_IDS]: '指定用户',
          [SendTargetType.BY_CONDITION]: '按条件筛选',
        };
        return (
          <div>
            <div>{targetLabels[record.targetType]}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              目标 {record.targetCount.toLocaleString()} 人
            </div>
          </div>
        );
      },
    },
    {
      title: '发送进度',
      key: 'progress',
      width: 180,
      render: (_, record) => {
        const progress = record.targetCount > 0 ? Math.round((record.sentCount / record.targetCount) * 100) : 0;
        return (
          <div>
            <div style={{
              height: 8,
              background: '#f0f0f0',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 4,
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100 ? '#52c41a' : '#1677ff',
                transition: 'width .3s',
              }} />
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.sentCount.toLocaleString()}/{record.targetCount.toLocaleString()} ({progress}%)
            </div>
            {record.readCount > 0 && (
              <div style={{ fontSize: 11, color: '#999' }}>
                已读: {record.readCount.toLocaleString()} ({Math.round((record.readCount / record.sentCount) * 100)}%)
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val) => {
        const statusLabels: Record<string, { text: string; color: string }> = {
          sending: { text: '发送中', color: 'blue' },
          sent: { text: '已完成', color: 'green' },
          failed: { text: '失败', color: 'red' },
          scheduled: { text: '定时中', color: 'orange' },
        };
        const info = statusLabels[val];
        return <Tag color={info.color} icon={val === 'scheduled' ? <CalendarOutlined /> : null}>{info.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '定时发送',
      dataIndex: 'scheduledAt',
      key: 'scheduledAt',
      width: 160,
      render: (val) => val || '-',
    },
  ];

  const handleSend = async () => {
    try {
      const values = await sendForm.validateFields();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success(values.scheduledAt ? '通知已加入发送队列' : '通知正在发送');
        setSendModalVisible(false);
        sendForm.resetFields();
      }, 1000);
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'done') {
        sendForm.setFieldsValue({ imageUrl: info.file.response?.url });
      }
    },
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'send',
      label: (
        <span>
          <SendOutlined /> 发送通知
        </span>
      ),
      children: (
        <Card>
          <Alert
            type="info"
            showIcon
            message="温馨提示"
            description="发送通知前请仔细核对内容和目标用户,高优先级通知将以弹窗形式展示。"
            style={{ marginBottom: 24 }}
          />

          <Form form={sendForm} layout="vertical" initialValues={{
            type: NotificationType.SYSTEM,
            priority: NotificationPriority.NORMAL,
            targetType: SendTargetType.ALL,
            isPinned: false,
          }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Form.Item
                label="通知类型"
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
                style={{ width: 200 }}
              >
                <Select>
                  {Object.entries(typeMap).map(([key, val]) => (
                    <Option key={key} value={key}>{val.text}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请选择优先级' }]}
                style={{ width: 200 }}
              >
                <Select>
                  {Object.entries(priorityMap).map(([key, val]) => (
                    <Option key={key} value={key}>{val.text}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="目标用户"
                name="targetType"
                rules={[{ required: true, message: '请选择目标' }]}
                style={{ width: 200 }}
              >
                <Select>
                  <Option value={SendTargetType.ALL}>
                    <Space><TeamOutlined /> 全站所有用户</Space>
                  </Option>
                  <Option value={SendTargetType.BY_ROLE}>
                    <Space><CrownOutlined /> 按用户角色</Space>
                  </Option>
                  <Option value={SendTargetType.BY_USER_IDS}>
                    <Space><UserOutlined /> 指定用户ID</Space>
                  </Option>
                  <Option value={SendTargetType.BY_CONDITION}>
                    <Space><SearchOutlined /> 按条件筛选</Space>
                  </Option>
                </Select>
              </Form.Item>
            </div>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.targetType !== cur.targetType}>
              {({ getFieldValue }) => {
                const targetType = getFieldValue('targetType');
                if (targetType === SendTargetType.BY_ROLE) {
                  return (
                    <Form.Item
                      label="选择角色"
                      name="roles"
                      rules={[{ required: true, message: '请至少选择一个角色' }]}
                    >
                      <Select mode="multiple" placeholder="选择用户角色">
                        <Option value="user">普通用户</Option>
                        <Option value="author">创作者</Option>
                        <Option value="admin">管理员</Option>
                      </Select>
                    </Form.Item>
                  );
                }
                if (targetType === SendTargetType.BY_USER_IDS) {
                  return (
                    <Form.Item
                      label="用户ID列表"
                      name="userIds"
                      rules={[{ required: true, message: '请输入用户ID' }]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="每行一个用户ID,或用逗号分隔"
                      />
                    </Form.Item>
                  );
                }
                if (targetType === SendTargetType.BY_CONDITION) {
                  return (
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item label="注册时间范围" name="registerRange">
                          <RangePicker style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="最小阅读数" name="minReads">
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item label="是否创作者" name="isAuthor">
                          <Select allowClear placeholder="是否为创作者">
                            <Option value={true}>是</Option>
                            <Option value={false}>否</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                }
                return null;
              }}
            </Form.Item>

            <Form.Item
              label="通知标题"
              name="title"
              rules={[
                { required: true, message: '请输入标题' },
                { max: 200, message: '标题不能超过200个字符' },
              ]}
            >
              <Input placeholder="请输入通知标题" showCount maxLength={200} />
            </Form.Item>

            <Form.Item
              label="通知内容"
              name="content"
              rules={[
                { required: true, message: '请输入内容' },
                { max: 1000, message: '内容不能超过1000个字符' },
              ]}
            >
              <TextArea rows={5} placeholder="请输入通知内容..." showCount maxLength={1000} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="图片(可选)" name="imageUrl">
                  <Upload {...uploadProps} listType="picture-card" maxCount={1}>
                    <UploadOutlined />
                    <div style={{ marginTop: 8, fontSize: 12 }}>上传图片</div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="跳转链接(可选)" name="linkUrl">
                  <Input placeholder="如: /works/123" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="有效期(可选)" name="expiresAt">
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="选择过期时间"
                    minDate={dayjs()}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="isPinned"
                  valuePropName="checked"
                  label="置顶通知"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Tooltip title="定时发送通知,适合活动预告等场景">
                  <Form.Item label="定时发送(可选)" name="scheduledAt">
                    <DatePicker
                      showTime
                      style={{ width: '100%' }}
                      placeholder="选择发送时间"
                      minDate={dayjs()}
                    />
                  </Form.Item>
                </Tooltip>
              </Col>
              <Col span={8}>
                <Form.Item label="发送速度(条/秒)" name="rateLimit" initialValue={100}>
                  <Select>
                    <Option value={50}>慢速 (50条/秒)</Option>
                    <Option value={100}>标准 (100条/秒)</Option>
                    <Option value={500}>快速 (500条/秒)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Space>
                <Button onClick={() => sendForm.resetFields()}>
                  重置
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={loading}
                  onClick={handleSend}
                >
                  立即发送
                </Button>
              </Space>
            </div>
          </Form>
        </Card>
      ),
    },
    {
      key: 'records',
      label: (
        <span>
          <NotificationOutlined /> 发送记录
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Search
              placeholder="搜索通知标题"
              allowClear
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="通知类型"
              allowClear
              style={{ width: 160 }}
              value={typeFilter || undefined}
              onChange={(val) => setTypeFilter(val || '')}
            >
              {Object.entries(typeMap).map(([key, val]) => (
                <Option key={key} value={key}>{val.text}</Option>
              ))}
            </Select>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder={['开始时间', '结束时间']}
            />
          </div>
          <Table<SendRecord>
            columns={recordColumns}
            dataSource={sendRecords}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1400 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </>
      ),
    },
    {
      key: 'user-notifications',
      label: (
        <span>
          <BellOutlined /> 用户通知列表
        </span>
      ),
      children: (
        <Table<NotificationItem>
          columns={notificationColumns}
          dataSource={notifications}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条通知`,
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <NotificationOutlined /> 通知管理
        </h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setSendModalVisible(true)}>
          快速发送
        </Button>
      </div>

      <Card bordered={false} bodyStyle={{ padding: 0 }}>
        <Tabs items={tabItems} defaultActiveKey="send" />
      </Card>

      <Modal
        title="快速发送系统通知"
        open={sendModalVisible}
        onCancel={() => {
          setSendModalVisible(false);
          sendForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form form={sendForm} layout="vertical" initialValues={{
          type: NotificationType.SYSTEM,
          priority: NotificationPriority.NORMAL,
          targetType: SendTargetType.ALL,
        }}>
          <Form.Item label="通知类型" name="type" rules={[{ required: true }]}>
            <Select>
              <Option value={NotificationType.SYSTEM}>系统通知</Option>
              <Option value={NotificationType.NEWS}>新闻公告</Option>
              <Option value={NotificationType.CHAPTER_UPDATE}>更新提醒</Option>
            </Select>
          </Form.Item>
          <Form.Item label="通知标题" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入通知标题" />
          </Form.Item>
          <Form.Item label="通知内容" name="content" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="请输入通知内容..." />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading}>
              发送
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
