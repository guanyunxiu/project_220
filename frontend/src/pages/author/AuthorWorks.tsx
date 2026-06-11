import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Form,
  Upload,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Rate,
  Image,
  Popconfirm,
  Empty,
  Dropdown,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  EyeOutlined as ViewsIcon,
  GiftOutlined,
  DollarOutlined,
  UploadOutlined,
  SettingOutlined,
  MoreOutlined,
  FireOutlined,
  StarOutlined,
  ClockCircleOutlined,
  UpOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../../store/useAuthStore';
import { useWorksStore, SharedWork } from '../../store/works';
import ImageUploader from '../../components/ImageUploader';

const categories = [
  '玄幻奇幻', '武侠仙侠', '都市言情', '历史军事', '科幻游戏',
  '悬疑灵异', '二次元', '同人衍生',
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'ongoing', label: '连载中' },
  { value: 'completed', label: '已完结' },
  { value: 'draft', label: '草稿箱' },
  { value: 'pending', label: '待审核' },
  { value: 'rejected', label: '被驳回' },
];

export default function AuthorWorks() {
  const user = useAuthStore((s) => s.user);
  const addNotification = useAuthStore((s) => s.addNotification);
  const { works, addWork, updateWork, deleteWork } = useWorksStore();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<SharedWork | null>(null);
  const [form] = Form.useForm();
  const [coverUrl, setCoverUrl] = useState('');

  const authorId = user?.id ?? 1;
  const authorWorks = works.filter((w) => w.authorId === authorId);

  const filtered = authorWorks.filter(
    (item) =>
      (!searchText || item.title.includes(searchText)) &&
      (filterStatus === 'all' || item.status === filterStatus || item.auditStatus === filterStatus)
  );

  const totalIncome = authorWorks.reduce((s, i) => s + i.income, 0);
  const totalWords = authorWorks.reduce((s, i) => s + i.words, 0);
  const ongoingCount = authorWorks.filter((w) => w.status === 'ongoing').length;
  const totalViews = authorWorks.reduce((s, i) => s + i.views, 0);

  const openCreate = () => {
    setEditingWork(null);
    form.resetFields();
    setCoverUrl('');
    setCreateModalOpen(true);
  };

  const openEdit = (work: SharedWork) => {
    setEditingWork(work);
    form.setFieldsValue({
      title: work.title,
      category: work.category,
      tags: work.tags,
      status: work.status === 'draft' ? 'ongoing' : work.status,
      description: work.description,
    });
    setCoverUrl(work.cover);
    setCreateModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!coverUrl && !editingWork) {
        message.warning('请上传作品封面');
        return;
      }
      if (editingWork) {
        updateWork(editingWork.id, {
          ...values,
          tags: values.tags || [],
          cover: coverUrl || editingWork.cover,
        });
        message.success('修改成功');
      } else {
        const newWork = addWork({
          title: values.title,
          cover: coverUrl,
          category: values.category,
          tags: values.tags || [],
          status: values.status || 'draft',
          auditStatus: values.status === 'draft' ? 'pending' : 'pending',
          author: user?.nickname || user?.username || '作者',
          authorId: authorId,
          description: values.description,
          isFeatured: false,
          isRecommended: false,
        });
        addNotification({
          type: 'audit',
          title: '作品已提交审核',
          content: `作品《${newWork.title}》已成功提交审核，平台将在24小时内审核，请耐心等待。`,
          relatedId: newWork.id,
        });
        message.success('作品创建成功，已提交审核');
      }
      setCreateModalOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = (id: number) => {
    deleteWork(id);
    message.success('删除成功');
  };

  const columns = [
    {
      title: '作品',
      dataIndex: 'title',
      key: 'work',
      width: 280,
      render: (_: any, record: SharedWork) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-20 shrink-0 rounded overflow-hidden bg-gray-100">
            {record.cover ? (
              <img src={record.cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <BookOutlined />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Link to={`/work/${record.id}`} className="font-medium truncate max-w-[150px] block hover:text-primary-500">
              {record.title}
            </Link>
            <div className="text-xs text-gray-500 mt-0.5">
              ID: {record.id} · {record.chapters}章
            </div>
            <div className="mt-1.5">
              <Progress percent={record.progress} size="small" showInfo={false} className="!mb-0" />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c: string) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: '状态',
      key: 'status',
      width: 160,
      render: (_: any, r: SharedWork) => (
        <Space direction="vertical" size={2}>
          <Tag
            color={
              r.status === 'ongoing'
                ? 'processing'
                : r.status === 'completed'
                ? 'success'
                : 'default'
            }
          >
            {r.status === 'ongoing' ? '连载中' : r.status === 'completed' ? '已完结' : '草稿'}
          </Tag>
          <Badge
            status={
              r.auditStatus === 'approved'
                ? 'success'
                : r.auditStatus === 'pending'
                ? 'warning'
                : 'error'
            }
            text={
              <span className="text-xs">
                {r.auditStatus === 'approved' ? '已通过' : r.auditStatus === 'pending' ? '审核中' : '已驳回'}
              </span>
            }
          />
        </Space>
      ),
    },
    {
      title: '字数',
      dataIndex: 'words',
      key: 'words',
      width: 100,
      render: (w: number) => `${(w / 10000).toFixed(1)}万`,
    },
    {
      title: '数据',
      key: 'stats',
      width: 180,
      render: (_: any, r: SharedWork) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1">
            <ViewsIcon className="text-blue-500" />
            <span>阅读：{(r.views / 10000).toFixed(1)}万</span>
          </div>
          <div className="flex items-center gap-1">
            <StarOutlined className="text-yellow-500" />
            <span>收藏：{(r.favorites / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarOutlined className="text-green-500" />
            <span>收入：¥{r.income.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 100,
      render: (r: number) => (
        <div>
          <Rate value={(r || 0) / 2} disabled count={5} className="!text-xs" />
          <div className="text-xs text-gray-500 mt-0.5">{r ? r.toFixed(1) : '--'}分</div>
        </div>
      ),
    },
    {
      title: '最近更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 120,
      render: (t: string) => dayjs(t).format('MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 230,
      fixed: 'right' as const,
      render: (_: any, r: SharedWork) => (
        <Space size="small">
          <Link to={`/author/works/${r.id}/chapters`}>
            <Button type="primary" size="small" icon={<EditOutlined />}>
              编辑章节
            </Button>
          </Link>
          <Link to={`/work/${r.id}`}>
            <Button type="link" size="small" icon={<EyeOutlined />}>
              预览
            </Button>
          </Link>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  icon: <SettingOutlined />,
                  label: '修改信息',
                  onClick: () => openEdit(r),
                },
                r.auditStatus !== 'approved' && {
                  key: 'resubmit',
                  icon: <CheckCircleOutlined />,
                  label: '重新提交审核',
                  onClick: () => {
                    updateWork(r.id, { auditStatus: 'pending', status: 'draft' });
                    addNotification({
                      type: 'audit',
                      title: '重新提交审核',
                      content: `作品《${r.title}》已重新提交审核。`,
                      relatedId: r.id,
                    });
                    message.success('已重新提交审核');
                  },
                },
                r.auditStatus === 'pending' && {
                  key: 'withdraw',
                  icon: <CloseCircleOutlined />,
                  label: '撤回审核',
                  onClick: () => {
                    updateWork(r.id, { auditStatus: 'rejected', status: 'draft' });
                    message.success('已撤回审核');
                  },
                },
                { type: 'divider' as const },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: (
                    <Popconfirm
                      title="确定删除这个作品吗？"
                      onConfirm={() => handleDelete(r.id)}
                      okText="删除"
                      cancelText="取消"
                      okButtonProps={{ danger: true }}
                    >
                      <span className="text-red-500">删除作品</span>
                    </Popconfirm>
                  ),
                },
              ].filter(Boolean) as any[],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的作品</h1>
          <p className="text-gray-500 mt-1">管理你创作的所有作品</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={openCreate}
          className="!h-11 !px-6"
        >
          创建新作品
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="连载中"
              value={ongoingCount}
              prefix={<BookOutlined className="text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="累计字数"
              value={(totalWords / 10000).toFixed(1)}
              suffix="万字"
              prefix={<FireOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="总阅读量"
              value={(totalViews / 10000).toFixed(1)}
              suffix="万"
              prefix={<EyeOutlined className="text-purple-500" />}
              valueStyle={{ color: '#a855f7' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="!rounded-xl">
            <Statistic
              title="预计收入"
              value={totalIncome}
              prefix="¥"
              precision={2}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="!rounded-2xl">
        <div className="flex flex-wrap gap-3 mb-5 pb-5 border-b">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="搜索作品名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 130 }}
            options={statusOptions}
            prefix={<FilterOutlined className="text-gray-400" />}
          />
        </div>

        {filtered.length === 0 ? (
          <Empty
            description="还没有作品，点击右上角创建你的第一部作品吧！"
            className="py-16"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            scroll={{ x: 1300 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 部作品`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingWork ? '编辑作品信息' : '创建新作品'}
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        destroyOnHidden
        footer={
          <Space>
            <Button onClick={() => setCreateModalOpen(false)}>取消</Button>
            <Button
              onClick={() => {
                form.setFieldValue('status', 'draft');
                handleSubmit();
              }}
            >
              保存草稿
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {editingWork ? '保存修改' : '提交审核'}
            </Button>
          </Space>
        }
        width={760}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col xs={24} md={10}>
              <Form.Item
                label="作品封面"
                name="cover"
                rules={[{ required: !editingWork, message: '请上传封面' }]}
              >
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
                        <p className="text-sm text-gray-500">点击或拖拽上传封面</p>
                        <p className="text-xs text-gray-400 mt-1">建议 600×800px，不超过5MB</p>
                      </div>
                    </Upload.Dragger>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} md={14}>
              <Form.Item
                name="title"
                label="作品名称"
                rules={[
                  { required: true, message: '请输入作品名称' },
                  { min: 2, max: 50, message: '长度2-50字' },
                ]}
              >
                <Input placeholder="请输入作品名称" maxLength={50} showCount />
              </Form.Item>

              <Form.Item
                name="category"
                label="作品分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select
                  placeholder="请选择分类"
                  options={categories.map((c) => ({ value: c, label: c }))}
                />
              </Form.Item>

              <Form.Item name="tags" label="标签" tooltip="最多5个标签，便于读者搜索">
                <Select
                  mode="tags"
                  placeholder="输入后回车添加标签"
                  maxTagCount={5}
                  options={['爽文', '穿越', '系统', '重生', '甜宠', '升级', '无敌流'].map(
                    (t) => ({
                      value: t,
                      label: t,
                    })
                  )}
                />
              </Form.Item>

              <Form.Item name="status" label="发布状态" initialValue="ongoing">
                <Select
                  options={[
                    { value: 'ongoing', label: '连载中' },
                    { value: 'completed', label: '已完结' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="作品简介"
            rules={[
              { required: true, message: '请填写作品简介' },
              { min: 20, message: '简介至少20字' },
            ]}
            className="!mb-0"
          >
            <Input.TextArea
              rows={6}
              placeholder="请详细介绍你的作品，吸引读者阅读..."
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
