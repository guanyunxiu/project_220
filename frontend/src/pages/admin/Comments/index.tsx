import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  message,
  Popconfirm,
  Select,
  Input,
  Badge,
  Tooltip,
  Switch,
  Modal,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  WarningOutlined,
  MessageOutlined,
  BookOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;
const { Search } = Input;

enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
  DELETED = 'deleted',
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  workId: string;
  workTitle: string;
  chapterId: string | null;
  chapterTitle: string | null;
  parentId: string | null;
  replyToUserId: string | null;
  replyToUsername: string | null;
  content: string;
  status: CommentStatus;
  likes: number;
  dislikes: number;
  repliesCount: number;
  isPinned: boolean;
  isSpoiler: boolean;
  isEdited: boolean;
  hasSensitiveWord: boolean;
  sensitiveWords: string[];
  ipAddress: string;
  createdAt: string;
}

const statusMap: Record<CommentStatus, { text: string; color: string }> = {
  [CommentStatus.PENDING]: { text: '待审核', color: 'orange' },
  [CommentStatus.APPROVED]: { text: '已通过', color: 'green' },
  [CommentStatus.REJECTED]: { text: '已拒绝', color: 'red' },
  [CommentStatus.SPAM]: { text: '垃圾评论', color: 'default' },
  [CommentStatus.DELETED]: { text: '已删除', color: 'default' },
};

const CommentsPage: React.FC = () => {
  const [data, setData] = useState<Comment[]>([
    {
      id: '1',
      userId: '101',
      username: '书虫小明',
      avatar: '',
      workId: '1',
      workTitle: '星辰大海的冒险',
      chapterId: '1',
      chapterTitle: '第一章: 星空下的少年',
      parentId: null,
      replyToUserId: null,
      replyToUsername: null,
      content: '这一章写得太好了!主角的形象非常鲜明,期待后续的发展!',
      status: CommentStatus.APPROVED,
      likes: 156,
      dislikes: 2,
      repliesCount: 8,
      isPinned: true,
      isSpoiler: false,
      isEdited: false,
      hasSensitiveWord: false,
      sensitiveWords: [],
      ipAddress: '192.168.1.10',
      createdAt: '2025-06-10 10:30:45',
    },
    {
      id: '2',
      userId: '102',
      username: '路人甲',
      avatar: '',
      workId: '1',
      workTitle: '星辰大海的冒险',
      chapterId: '1',
      chapterTitle: '第一章: 星空下的少年',
      parentId: '1',
      replyToUserId: '101',
      replyToUsername: '书虫小明',
      content: '同意!特别是那段描写星空的文字,太有画面感了',
      status: CommentStatus.APPROVED,
      likes: 34,
      dislikes: 0,
      repliesCount: 1,
      isPinned: false,
      isSpoiler: false,
      isEdited: false,
      hasSensitiveWord: false,
      sensitiveWords: [],
      ipAddress: '10.0.0.5',
      createdAt: '2025-06-10 11:15:22',
    },
    {
      id: '3',
      userId: '103',
      username: '可疑用户',
      avatar: '',
      workId: '2',
      workTitle: '都市修仙传说',
      chapterId: '3',
      chapterTitle: '第三章: 初露锋芒',
      parentId: null,
      replyToUserId: null,
      replyToUsername: null,
      content: '想要看更多内容?加微信 xxx-xxxx 获取资源,还有违禁词哦',
      status: CommentStatus.PENDING,
      likes: 0,
      dislikes: 0,
      repliesCount: 0,
      isPinned: false,
      isSpoiler: false,
      isEdited: false,
      hasSensitiveWord: true,
      sensitiveWords: ['违禁词', '微信'],
      ipAddress: '10.0.0.99',
      createdAt: '2025-06-10 09:45:10',
    },
    {
      id: '4',
      userId: '104',
      username: '剧透党',
      avatar: '',
      workId: '4',
      workTitle: '重生之巅峰',
      chapterId: '15',
      chapterTitle: '第十五章: 意外',
      parentId: null,
      replyToUserId: null,
      replyToUsername: null,
      content: '剧透警告:后面主角会获得一个神器,然后开启开挂模式!',
      status: CommentStatus.APPROVED,
      likes: 12,
      dislikes: 45,
      repliesCount: 15,
      isPinned: false,
      isSpoiler: true,
      isEdited: false,
      hasSensitiveWord: false,
      sensitiveWords: [],
      ipAddress: '172.16.0.20',
      createdAt: '2025-06-09 20:30:00',
    },
    {
      id: '5',
      userId: '105',
      username: '广告账号',
      avatar: '',
      workId: '3',
      workTitle: '异世界召唤',
      chapterId: '5',
      chapterTitle: '第五话: 勇者的觉醒',
      parentId: null,
      replyToUserId: null,
      replyToUsername: null,
      content: '免费看片网站 http://spam.example.com 快来点击',
      status: CommentStatus.SPAM,
      likes: 0,
      dislikes: 23,
      repliesCount: 0,
      isPinned: false,
      isSpoiler: false,
      isEdited: false,
      hasSensitiveWord: true,
      sensitiveWords: ['spam'],
      ipAddress: '10.0.0.88',
      createdAt: '2025-06-10 08:00:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<CommentStatus | ''>('');
  const [workFilter, setWorkFilter] = useState<string>('');
  const [sensitiveOnly, setSensitiveOnly] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [viewingComment, setViewingComment] = useState<Comment | null>(null);

  const worksList = [
    { id: '1', title: '星辰大海的冒险' },
    { id: '2', title: '都市修仙传说' },
    { id: '3', title: '异世界召唤' },
    { id: '4', title: '重生之巅峰' },
  ];

  const pendingCount = data.filter((c) => c.status === CommentStatus.PENDING).length;
  const sensitiveCount = data.filter((c) => c.hasSensitiveWord).length;

  const handleApprove = (id: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status: CommentStatus.APPROVED } : item
      )
    );
    message.success('已通过审核');
  };

  const handleReject = (id: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status: CommentStatus.REJECTED } : item
      )
    );
    message.success('已拒绝');
  };

  const handleMarkSpam = (id: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status: CommentStatus.SPAM } : item
      )
    );
    message.success('已标记为垃圾评论');
  };

  const handleDelete = (id: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, status: CommentStatus.DELETED } : item
      )
    );
    message.success('已删除');
  };

  const handleBatchApprove = () => {
    setData(
      data.map((item) =>
        selectedKeys.includes(item.id)
          ? { ...item, status: CommentStatus.APPROVED }
          : item
      )
    );
    message.success(`已批量通过 ${selectedKeys.length} 条评论`);
    setSelectedKeys([]);
  };

  const handleViewDetail = (comment: Comment) => {
    setViewingComment(comment);
    setDetailModalVisible(true);
  };

  const highlightSensitiveWords = (content: string, words: string[]) => {
    let result = content;
    words.forEach((word) => {
      const regex = new RegExp(`(${word})`, 'gi');
      result = result.replace(regex, '<mark style="background:#ffccc7;padding:0 2px;border-radius:2px">$1</mark>');
    });
    return result;
  };

  const columns: ColumnsType<Comment> = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 160,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={36} src={record.avatar} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.username}</div>
            <div style={{ fontSize: 11, color: '#999' }}>IP: {record.ipAddress}</div>
          </div>
        </div>
      ),
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      render: (text, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            {record.parentId && (
              <Tag color="blue" style={{ marginRight: 8 }}>
                回复 @{record.replyToUsername}
              </Tag>
            )}
            {record.isSpoiler && (
              <Tag color="warning" style={{ marginRight: 8 }}>剧透</Tag>
            )}
            {record.isPinned && (
              <Tag color="red" style={{ marginRight: 8 }}>置顶</Tag>
            )}
            {record.hasSensitiveWord && (
              <Tooltip title={`包含敏感词: ${record.sensitiveWords.join(', ')}`}>
                <Badge status="error" text="敏感词" style={{ marginRight: 8 }} />
              </Tooltip>
            )}
          </div>
          <div
            style={{
              lineHeight: 1.6,
              maxHeight: 72,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
            dangerouslySetInnerHTML={{
              __html: record.hasSensitiveWord
                ? highlightSensitiveWords(text, record.sensitiveWords)
                : text,
            }}
          />
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            style={{ padding: 0, marginTop: 4 }}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </div>
      ),
    },
    {
      title: '所属作品/章节',
      key: 'target',
      width: 200,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <BookOutlined style={{ color: '#1677ff' }} />
            <span style={{ fontWeight: 500 }}>{record.workTitle}</span>
          </div>
          {record.chapterTitle && (
            <div style={{ color: '#666', paddingLeft: 20 }}>
              <MessageOutlined style={{ color: '#999', marginRight: 4 }} />
              {record.chapterTitle}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CommentStatus) => (
        <Tag color={statusMap[status].color}>
          {statusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '互动',
      key: 'stats',
      width: 120,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div style={{ color: '#52c41a' }}>👍 {record.likes}</div>
          <div style={{ color: '#ff4d4f' }}>👎 {record.dislikes}</div>
          {record.repliesCount > 0 && (
            <div style={{ color: '#1677ff' }}>💬 {record.repliesCount} 回复</div>
          )}
        </div>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 260,
      render: (_, record) => {
        const isPending = record.status === CommentStatus.PENDING;
        return (
          <Space size="small" wrap>
            {isPending && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleApprove(record.id)}
                >
                  通过
                </Button>
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record.id)}
                >
                  拒绝
                </Button>
              </>
            )}
            {!isPending && record.status !== CommentStatus.SPAM && (
              <Button
                type="link"
                size="small"
                icon={<WarningOutlined />}
                onClick={() => handleMarkSpam(record.id)}
              >
                标记垃圾
              </Button>
            )}
            <Popconfirm
              title="确定要删除这条评论吗?"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.content.toLowerCase().includes(searchText.toLowerCase()) ||
      item.username.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchWork = !workFilter || item.workId === workFilter;
    const matchSensitive = !sensitiveOnly || item.hasSensitiveWord;
    return matchSearch && matchStatus && matchWork && matchSensitive;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <MessageOutlined /> 评论管理
          <Space>
            <Badge count={pendingCount} overflowCount={999} offset={[4, -2]}>
              <Tag color="orange">待审核</Tag>
            </Badge>
            <Badge count={sensitiveCount} overflowCount={999} offset={[4, -2]}>
              <Tag color="red">含敏感词</Tag>
            </Badge>
          </Space>
        </h2>
        {selectedKeys.length > 0 && (
          <Button type="primary" onClick={handleBatchApprove}>
            批量通过 ({selectedKeys.length})
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索评论内容或用户名"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="按作品筛选"
          allowClear
          style={{ width: 200 }}
          value={workFilter || undefined}
          onChange={(val) => setWorkFilter(val || '')}
        >
          {worksList.map((w) => (
            <Option key={w.id} value={w.id}>{w.title}</Option>
          ))}
        </Select>
        <Select
          placeholder="评论状态"
          allowClear
          style={{ width: 140 }}
          value={statusFilter || undefined}
          onChange={(val) => setStatusFilter(val || '')}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.text}</Option>
          ))}
        </Select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch
            size="small"
            checked={sensitiveOnly}
            onChange={setSensitiveOnly}
          />
          <span style={{ fontSize: 13 }}>仅显示含敏感词</span>
        </div>
      </div>

      <Table<Comment>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: setSelectedKeys,
          getCheckboxProps: (record) => ({
            disabled: record.status !== CommentStatus.PENDING,
          }),
        }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条评论`,
        }}
      />

      <Modal
        title="评论详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setViewingComment(null);
        }}
        footer={null}
        width={700}
      >
        {viewingComment && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="用户" span={1}>
                <Avatar size={24} src={viewingComment.avatar} style={{ marginRight: 8 }} icon={<UserOutlined />} />
                {viewingComment.username}
              </Descriptions.Item>
              <Descriptions.Item label="IP地址">
                {viewingComment.ipAddress}
              </Descriptions.Item>
              <Descriptions.Item label="作品" span={2}>
                <BookOutlined style={{ marginRight: 4 }} />
                {viewingComment.workTitle}
                {viewingComment.chapterTitle && (
                  <span style={{ marginLeft: 16, color: '#666' }}>
                    <MessageOutlined style={{ marginRight: 4 }} />
                    {viewingComment.chapterTitle}
                  </span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[viewingComment.status].color}>
                  {statusMap[viewingComment.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {viewingComment.createdAt}
              </Descriptions.Item>
              <Descriptions.Item label="互动数据" span={2}>
                👍 {viewingComment.likes} | 👎 {viewingComment.dislikes} | 💬 {viewingComment.repliesCount}回复
              </Descriptions.Item>
            </Descriptions>
            <div style={{
              padding: 16,
              background: '#fafafa',
              borderRadius: 8,
              lineHeight: 1.8,
            }}
              dangerouslySetInnerHTML={{
                __html: viewingComment.hasSensitiveWord
                  ? highlightSensitiveWords(viewingComment.content, viewingComment.sensitiveWords)
                  : viewingComment.content,
              }}
            />
            {viewingComment.hasSensitiveWord && (
              <div style={{ marginTop: 16 }}>
                <Tag color="red">命中敏感词:</Tag>
                {viewingComment.sensitiveWords.map((w, i) => (
                  <Tag key={i} color="volcano">{w}</Tag>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Space>
                {viewingComment.status === CommentStatus.PENDING && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        handleApprove(viewingComment.id);
                        setDetailModalVisible(false);
                      }}
                    >
                      通过
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => {
                        handleReject(viewingComment.id);
                        setDetailModalVisible(false);
                      }}
                    >
                      拒绝
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CommentsPage;
