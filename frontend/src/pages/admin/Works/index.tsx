import React, { useState, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Input,
  Select,
  Tag,
  Image,
  message,
  Popconfirm,
  Switch,
  Form,
  Upload,
  Card,
  Badge,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
  BookOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useWorksStore, SharedWork, WorkStatus } from '../../../store/works';
import { useAuthStore } from '../../../store/useAuthStore';

const { Option } = Select;
const { Search } = Input;

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  ongoing: { text: '连载中', color: 'green' },
  published: { text: '连载中', color: 'green' },
  completed: { text: '已完结', color: 'blue' },
  hiatus: { text: '暂停', color: 'orange' },
  banned: { text: '已封禁', color: 'red' },
  pending: { text: '待审核', color: 'gold' },
  rejected: { text: '被驳回', color: 'red' },
};

const auditStatusMap = {
  pending: { text: '待审核', status: 'warning' as const },
  approved: { text: '已通过', status: 'success' as const },
  rejected: { text: '已驳回', status: 'error' as const },
};

const typeMap: Record<string, { text: string; color: string }> = {
  novel: { text: '小说', color: 'cyan' },
  comic: { text: '漫画', color: 'purple' },
};

const WorksPage: React.FC = () => {
  const { works, addWork, updateWork, deleteWork, approveWork, rejectWork } = useWorksStore();
  const { addNotification } = useAuthStore();
  const [data, setData] = useState<SharedWork[]>(works);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWork, setEditingWork] = useState<SharedWork | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [auditFilter, setAuditFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [form] = Form.useForm();
  const [coverUrl, setCoverUrl] = useState('');

  React.useEffect(() => {
    setData(works);
  }, [works]);

  const pendingCount = useMemo(() => works.filter((w) => w.auditStatus === 'pending').length, [works]);
  const totalWorks = works.length;
  const approvedCount = works.filter((w) => w.auditStatus === 'approved').length;
  const totalViews = works.reduce((s, w) => s + w.views, 0);

  const columns: ColumnsType<SharedWork> = [
    {
      title: '作品信息',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      width: 300,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image
            width={60}
            height={80}
            src={record.cover}
            placeholder={
              <div
                style={{
                  width: 60,
                  height: 80,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                }}
              >
                <BookOutlined style={{ fontSize: 24, color: '#ccc' }} />
              </div>
            }
            style={{ borderRadius: 4, objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{text}</div>
            <div style={{ fontSize: 12, color: '#999' }}>作者: {record.author}</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {record.type && (
                <Tag color={typeMap[record.type]?.color || 'default'} style={{ margin: 0 }}>
                  {typeMap[record.type]?.text || record.type}
                </Tag>
              )}
              <Badge
                status={auditStatusMap[record.auditStatus]?.status}
                text={<span style={{ fontSize: 12 }}>{auditStatusMap[record.auditStatus]?.text}</span>}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (c: string) => (
        <Space size={4} wrap>
          {c?.split(',').map((c) => (
            <Tag key={c} color="blue">
              {c}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: WorkStatus) => <Tag color={statusMap[status]?.color || 'default'}>{statusMap[status]?.text || status}</Tag>,
    },
    {
      title: '章节数',
      dataIndex: 'chapters',
      key: 'chapters',
      width: 80,
      sorter: (a, b) => a.chapters - b.chapters,
      render: (v) => `${v}章`,
    },
    {
      title: '阅读量',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      sorter: (a, b) => a.views - b.views,
      render: (val) => (
        <span>
          <EyeOutlined style={{ marginRight: 4, color: '#1677ff' }} />
          {(val / 10000).toFixed(1)}万
        </span>
      ),
    },
    {
      title: '收藏',
      dataIndex: 'favorites',
      key: 'favorites',
      width: 80,
      sorter: (a, b) => a.favorites - b.favorites,
      render: (val) => (val / 1000).toFixed(1) + 'k',
    },
    {
      title: '推荐',
      dataIndex: 'isFeatured',
      key: 'isFeatured',
      width: 80,
      render: (val, record) => (
        <Switch
          size="small"
          checked={!!val}
          onChange={(checked) => {
            updateWork(record.id, { isFeatured: checked });
            message.success(checked ? '已设为推荐' : '已取消推荐');
          }}
        />
      ),
    },
    {
      title: '精选',
      dataIndex: 'isRecommended',
      key: 'isRecommended',
      width: 80,
      render: (val, record) => (
        <Switch
          size="small"
          checked={!!val}
          onChange={(checked) => {
            updateWork(record.id, { isRecommended: checked });
            message.success(checked ? '已设为精选' : '已取消精选');
          }}
        />
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) => new Date(v).toLocaleString('zh-CN', { hour12: false }).slice(0, 16).replace(/\//g, '-'),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (_, record) => (
        <Space size="small" wrap>
          {record.auditStatus === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                onClick={() => {
                  approveWork(record.id);
                  addNotification({
                    type: 'audit',
                    title: '作品审核通过',
                    content: `你的作品《${record.title}》已通过平台审核，现已上架！`,
                    relatedId: record.id,
                  });
                  message.success('审核通过');
                }}
                style={{ color: '#52c41a' }}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: `驳回作品《${record.title}》`,
                    content: (
                      <Input.TextArea
                        id={`reject-reason-${record.id}`}
                        rows={4}
                        placeholder="请输入驳回原因，将发送给作者查看..."
                        maxLength={200}
                        showCount
                        className="mt-3"
                      />
                    ),
                    okText: '确认驳回',
                    okButtonProps: { danger: true },
                    cancelText: '取消',
                    onOk: () => {
                      const el = document.getElementById(`reject-reason-${record.id}`) as HTMLTextAreaElement;
                      const reason = el?.value?.trim() || '不符合平台发布规范';
                      rejectWork(record.id);
                      addNotification({
                        type: 'audit',
                        title: '作品审核未通过',
                        content: `你的作品《${record.title}》审核未通过。原因：${reason}`,
                        relatedId: record.id,
                      });
                      message.success('已驳回，已通知作者');
                    },
                  });
                }}
              >
                驳回
              </Button>
            </>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 'ongoing' || record.status === 'published' || record.status === 'hiatus' ? (
            <Button
              type="link"
              danger
              size="small"
              icon={<DownCircleOutlined />}
              onClick={() => {
                updateWork(record.id, { status: 'draft' });
                message.success('已下架');
              }}
            >
              下架
            </Button>
          ) : record.status !== 'banned' ? (
            <Button
              type="link"
              size="small"
              icon={<UpCircleOutlined />}
              onClick={() => {
                updateWork(record.id, { status: 'ongoing', auditStatus: 'approved' });
                message.success('已上架');
              }}
            >
              上架
            </Button>
          ) : null}
          <Popconfirm
            title="确定要删除这个作品吗?"
            onConfirm={() => {
              deleteWork(record.id);
              message.success('删除成功');
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (work: SharedWork) => {
    setEditingWork(work);
    form.setFieldsValue({
      title: work.title,
      category: work.category,
      tags: work.tags?.join(','),
      type: work.type || 'novel',
      status: work.status,
      description: work.description,
    });
    setCoverUrl(work.cover);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingWork(null);
    form.resetFields();
    setCoverUrl('');
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingWork) {
        updateWork(editingWork.id, {
          ...values,
          tags: values.tags ? values.tags.split(',').filter(Boolean) : [],
          cover: coverUrl || editingWork.cover,
        });
        message.success('编辑成功');
      } else {
        addWork({
          title: values.title,
          cover: coverUrl,
          category: values.category,
          type: values.type,
          tags: values.tags ? values.tags.split(',').filter(Boolean) : [],
          status: values.status,
          auditStatus: values.status === 'draft' ? 'pending' : 'approved',
          author: '平台管理员',
          authorId: 0,
          description: values.description,
          isFeatured: false,
          isRecommended: false,
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingWork(null);
    form.resetFields();
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.author.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = !statusFilter || item.status === statusFilter;
    const matchAudit = !auditFilter || item.auditStatus === auditFilter;
    const matchType = !typeFilter || item.type === typeFilter;
    return matchSearch && matchStatus && matchAudit && matchType;
  });

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="作品总数"
              value={totalWorks}
              prefix={<FileTextOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="待审核"
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="已通过"
              value={approvedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="总阅读量"
              value={(totalViews / 10000).toFixed(1)}
              suffix="万"
              valueStyle={{ color: '#722ed1' }}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>作品管理</h2>
        <Space>
          {pendingCount > 0 && (
            <Badge count={pendingCount} offset={[-2, 4]}>
              <Button onClick={() => setAuditFilter('pending')} icon={<ClockCircleOutlined />}>
                审核队列
              </Button>
            </Badge>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增作品
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索作品名或作者"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="作品类型"
          allowClear
          style={{ width: 120 }}
          value={typeFilter || undefined}
          onChange={(val) => setTypeFilter(val || '')}
        >
          <Option value="novel">小说</Option>
          <Option value="comic">漫画</Option>
        </Select>
        <Select
          placeholder="审核状态"
          allowClear
          style={{ width: 140 }}
          value={auditFilter || undefined}
          onChange={(val) => setAuditFilter(val || '')}
        >
          {Object.entries(auditStatusMap).map(([key, val]) => (
            <Option key={key} value={key}>
              {val.text}
            </Option>
          ))}
        </Select>
        <Select
          placeholder="作品状态"
          allowClear
          style={{ width: 140 }}
          value={statusFilter || undefined}
          onChange={(val) => setStatusFilter(val || '')}
        >
          {Object.entries(statusMap).map(([key, val]) => (
            <Option key={key} value={key}>
              {val.text}
            </Option>
          ))}
        </Select>
      </div>

      {filteredData.length === 0 ? (
        <Empty description="暂无作品数据" />
      ) : (
        <Table<SharedWork>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSize: 10,
          }}
        />
      )}

      <Modal
        title={editingWork ? '编辑作品' : '新增作品'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="确定"
        cancelText="取消"
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item label="作品封面" name="cover">
                <div className="w-full aspect-[3/4] border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 relative">
                  {coverUrl ? (
                    <>
                      <img src={coverUrl} alt="" className="w-full h-full object-cover" />
                      <Button
                        type="primary"
                        size="small"
                        danger
                        className="absolute top-2 right-2"
                        onClick={() => setCoverUrl('')}
                      >
                        移除
                      </Button>
                    </>
                  ) : (
                    <Upload.Dragger
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const reader = new FileReader();
                        reader.onload = (e) => setCoverUrl(e.target?.result as string);
                        reader.readAsDataURL(file);
                        return false;
                      }}
                      className="!border-0 !h-full flex items-center justify-center !bg-transparent"
                    >
                      <div className="text-center p-4">
                        <UploadOutlined className="text-4xl text-gray-300 mb-2 block" />
                        <p className="text-sm text-gray-500">点击或拖拽上传</p>
                      </div>
                    </Upload.Dragger>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Form.Item
                name="title"
                label="作品标题"
                rules={[
                  { required: true, message: '请输入作品标题' },
                  { max: 100, message: '标题不能超过100字符' },
                ]}
              >
                <Input placeholder="请输入作品标题" />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="作品类型"
                    rules={[{ required: true, message: '请选择类型' }]}
                    initialValue="novel"
                  >
                    <Select>
                      <Option value="novel">小说</Option>
                      <Option value="comic">漫画</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="发布状态"
                    rules={[{ required: true, message: '请选择状态' }]}
                    initialValue="ongoing"
                  >
                    <Select>
                      <Option value="draft">草稿</Option>
                      <Option value="ongoing">连载中</Option>
                      <Option value="completed">已完结</Option>
                      <Option value="hiatus">暂停</Option>
                      <Option value="banned">封禁</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="category"
                label="分类标签"
                rules={[{ required: true, message: '请输入分类' }]}
                help="用逗号分隔"
              >
                <Input placeholder="如: 科幻,冒险,玄幻" />
              </Form.Item>
              <Form.Item name="tags" label="关键词标签" help="用逗号分隔">
                <Input placeholder="如: 穿越,系统,重生" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="作品简介"
            rules={[{ max: 1000, message: '简介不能超过1000字符' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入作品简介" showCount maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorksPage;
