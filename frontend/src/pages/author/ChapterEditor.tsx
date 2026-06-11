import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  List,
  Button,
  Input,
  Tag,
  Modal,
  Form,
  Select,
  InputNumber,
  Tabs,
  Empty,
  Space,
  Dropdown,
  message,
  Tooltip,
  Divider,
  Radio,
  Segmented,
  Progress,
  Badge,
  Avatar,
  Row,
  Col,
  Statistic,
  Switch,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SaveOutlined,
  SendOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  FileTextOutlined,
  MoreOutlined,
  WarningOutlined,
  LockOutlined,
  UnlockOutlined,
  UndoOutlined,
  RedoOutlined,
  PictureOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TipTapEditor from '../../components/TipTapEditor';
import ImageUploader, { UploadedImage } from '../../components/ImageUploader';

interface Volume {
  id: number;
  title: string;
  chapters: Chapter[];
  words: number;
  order: number;
}

interface Chapter {
  id: number;
  volumeId: number;
  title: string;
  content: string;
  words: number;
  order: number;
  isFree: boolean;
  price?: number;
  status: 'draft' | 'published' | 'scheduled';
  auditStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const mockWork = {
  id: 1,
  title: '诸天万界：开局签到混沌体',
  cover: 'https://picsum.photos/seed/editwork1/200/280',
  status: 'ongoing',
  category: '玄幻奇幻',
  words: 1580000,
};

const generateMockData = (): Volume[] => [
  {
    id: 1,
    title: '第一卷：初入异界',
    order: 1,
    words: 180000,
    chapters: Array.from({ length: 60 }, (_, i) => ({
      id: i + 1,
      volumeId: 1,
      title: `第${i + 1}章 ${['穿越异界，签到系统激活', '混沌体成，震惊全城', '初试牛刀，碾压天骄', '获得传承，实力暴涨', '风云际会，秘境开启'][i % 5]}`,
      content: '',
      words: 2500 + Math.floor(Math.random() * 2000),
      order: i + 1,
      isFree: i < 20,
      price: i >= 20 ? 9 : undefined,
      status: (['published', 'published', 'draft'] as const)[i % 3],
      auditStatus: 'approved',
      createdAt: new Date(Date.now() - (60 - i) * 3600 * 1000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      publishedAt: i < 58 ? new Date(Date.now() - i * 3600 * 1000 * 6).toISOString() : undefined,
    })),
  },
  {
    id: 2,
    title: '第二卷：风云际会',
    order: 2,
    words: 320000,
    chapters: Array.from({ length: 90 }, (_, i) => ({
      id: 60 + i + 1,
      volumeId: 2,
      title: `第${60 + i + 1}章 精彩章节 ${i + 1}`,
      content: '',
      words: 3000 + Math.floor(Math.random() * 2500),
      order: i + 1,
      isFree: false,
      price: 9,
      status: (['published', 'published', 'published', 'scheduled'] as const)[i % 4],
      auditStatus: (['approved', 'approved', 'pending'] as const)[i % 3],
      createdAt: new Date(Date.now() - (90 - i) * 3600 * 1000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - i * 1800 * 1000).toISOString(),
      publishedAt: i < 85 ? new Date(Date.now() - i * 3600 * 1000 * 3).toISOString() : undefined,
    })),
  },
  {
    id: 3,
    title: '第三卷：横推诸天',
    order: 3,
    words: 1200000,
    chapters: Array.from({ length: 328 }, (_, i) => ({
      id: 150 + i + 1,
      volumeId: 3,
      title: `第${150 + i + 1}章 ${i === 327 ? '混沌神雷，万法皆空（最新章）' : '精彩章节 ' + (i + 1)}`,
      content: '',
      words: 3500 + Math.floor(Math.random() * 3000),
      order: i + 1,
      isFree: false,
      price: 9,
      status: (['published', 'published', 'published', 'published', 'draft'] as const)[i % 5],
      auditStatus: i > 320 ? 'pending' : 'approved',
      createdAt: new Date(Date.now() - (328 - i) * 1800 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 900 * 1000).toISOString(),
      publishedAt: i < 320 ? new Date(Date.now() - i * 1800 * 1000).toISOString() : undefined,
    })),
  },
];

export default function ChapterEditor() {
  const { id: workId } = useParams();
  const navigate = useNavigate();
  const [volumes, setVolumes] = useState<Volume[]>(generateMockData());
  const [activeTab, setActiveTab] = useState('list');
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterContent, setChapterContent] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterFree, setChapterFree] = useState(false);
  const [chapterPrice, setChapterPrice] = useState(9);
  const [volumeModalOpen, setVolumeModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [editVolumeId, setEditVolumeId] = useState<number | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const totalChapters = volumes.reduce((sum, v) => sum + v.chapters.length, 0);
  const totalWords = volumes.reduce((sum, v) => sum + v.words, 0);
  const draftCount = volumes.reduce(
    (sum, v) => sum + v.chapters.filter((c) => c.status === 'draft').length,
    0
  );

  const autoSave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setLastSavedAt(new Date());
      message.success('草稿已自动保存');
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const openNewChapter = () => {
    setEditingChapter(null);
    setChapterTitle('');
    setChapterContent('');
    setChapterFree(false);
    setChapterPrice(9);
    setImages([]);
    setLastSavedAt(null);
    setActiveTab('editor');
  };

  const openEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterTitle(chapter.title);
    setChapterContent(
      chapter.content ||
        `<h2>${chapter.title}</h2>
<p>这里是章节正文内容。</p>
<p>你可以使用富文本编辑器来编写你的章节内容。支持文字排版、图片插入、标题设置等功能。</p>
<p>记得定期保存，系统也会自动为你保存草稿哦～</p>`
    );
    setChapterFree(chapter.isFree);
    setChapterPrice(chapter.price || 9);
    setImages([]);
    setLastSavedAt(null);
    setActiveTab('editor');
  };

  const handleSave = (publish: boolean = false) => {
    if (!chapterTitle.trim()) {
      message.warning('请输入章节标题');
      return;
    }
    const wordCount = chapterContent.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;

    if (editingChapter) {
      setVolumes(
        volumes.map((v) => ({
          ...v,
          chapters: v.chapters.map((c) =>
            c.id === editingChapter.id
              ? {
                  ...c,
                  title: chapterTitle,
                  content: chapterContent,
                  words: wordCount || c.words,
                  isFree: chapterFree,
                  price: chapterFree ? undefined : chapterPrice,
                  status: publish ? 'published' : c.status,
                  auditStatus: publish ? 'pending' : c.auditStatus,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
      );
      message.success(publish ? '章节已发布，等待审核' : '已保存为草稿');
    } else {
      const newChapter: Chapter = {
        id: Date.now(),
        volumeId: volumes[0].id,
        title: chapterTitle,
        content: chapterContent,
        words: wordCount,
        order: volumes[0].chapters.length + 1,
        isFree: chapterFree,
        price: chapterFree ? undefined : chapterPrice,
        status: publish ? 'published' : 'draft',
        auditStatus: publish ? 'pending' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setVolumes(
        volumes.map((v, idx) =>
          idx === 0 ? { ...v, chapters: [...v.chapters, newChapter] } : v
        )
      );
      message.success(publish ? '章节已创建并发布' : '章节已创建为草稿');
    }

    setLastSavedAt(new Date());
    if (publish) {
      setActiveTab('list');
    }
  };

  const handleDeleteChapter = (id: number) => {
    Modal.confirm({
      title: '确定删除这个章节吗？',
      content: '删除后无法恢复，请谨慎操作',
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        setVolumes(
          volumes.map((v) => ({
            ...v,
            chapters: v.chapters.filter((c) => c.id !== id),
          }))
        );
        message.success('删除成功');
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/author/works">
          <Button icon={<ArrowLeftOutlined />}>返回作品列表</Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 rounded overflow-hidden">
            <img src={mockWork.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{mockWork.title}</h1>
            <div className="text-xs text-gray-500">
              共 {totalChapters} 章 · {totalWords.toLocaleString()} 字 · 草稿 {draftCount} 章
            </div>
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          <Button icon={<EyeOutlined />} type="link">
            预览作品
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openNewChapter}>
            新建章节
          </Button>
        </div>
      </div>

      <Card className="!rounded-2xl" styles={{ body: { padding: 0 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'list',
              label: (
                <span className="flex items-center gap-1 px-2 py-1">
                  <FolderOutlined />
                  章节列表
                </span>
              ),
              children: (
                <div className="p-4 md:p-6 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
                    <div className="flex gap-2">
                      <Input
                        prefix={<span className="text-gray-400">🔍</span>}
                        placeholder="搜索章节标题"
                        style={{ width: 240 }}
                        allowClear
                      />
                      <Segmented
                        options={[
                          { label: '全部', value: 'all' },
                          { label: '草稿', value: 'draft' },
                          { label: '已发布', value: 'published' },
                          { label: '待审核', value: 'pending' },
                        ]}
                      />
                    </div>
                    <Space>
                      <Button onClick={() => setVolumeModalOpen(true)}>
                        <FolderOutlined />
                        新建分卷
                      </Button>
                      <Button onClick={() => setChapterModalOpen(true)}>
                        <PlusOutlined />
                        添加章节
                      </Button>
                    </Space>
                  </div>

                  {volumes.map((volume) => (
                    <div key={volume.id}>
                      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-3">
                        <div className="flex items-center gap-3">
                          <FileTextOutlined className="text-primary-500 text-lg" />
                          <span className="font-semibold text-base">{volume.title}</span>
                          <Tag color="blue">{volume.chapters.length}章</Tag>
                          <span className="text-xs text-gray-500">
                            {(volume.words / 10000).toFixed(1)}万字
                          </span>
                        </div>
                        <Dropdown
                          menu={{
                            items: [
                              { key: 'edit', icon: <EditOutlined />, label: '编辑分卷' },
                              { key: 'sort', icon: <ArrowLeftOutlined />, label: '调整排序' },
                              { type: 'divider' as const },
                              {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: <span className="text-red-500">删除分卷</span>,
                                danger: true,
                              },
                            ],
                          }}
                          trigger={['click']}
                        >
                          <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                      </div>

                      <div className="space-y-1">
                        {volume.chapters.length === 0 ? (
                          <Empty description="本卷暂无章节" className="py-8" />
                        ) : (
                          volume.chapters.map((chapter) => (
                            <div
                              key={chapter.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-10 text-center text-gray-400 text-sm shrink-0">
                                #{chapter.order}
                              </div>

                              <div
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => openEditChapter(chapter)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {chapter.title}
                                  </span>
                                  {chapter.isFree ? (
                                    <Tag color="green" className="!text-xs !py-0 !px-1.5">
                                      <UnlockOutlined /> 免费
                                    </Tag>
                                  ) : (
                                    <Tag color="gold" className="!text-xs !py-0 !px-1.5">
                                      <LockOutlined /> VIP
                                    </Tag>
                                  )}
                                  {chapter.status === 'draft' && (
                                    <Tag color="default" className="!text-xs !py-0 !px-1.5">
                                      草稿
                                    </Tag>
                                  )}
                                  {chapter.status === 'scheduled' && (
                                    <Tag color="purple" className="!text-xs !py-0 !px-1.5">
                                      <ClockCircleOutlined /> 定时
                                    </Tag>
                                  )}
                                  {chapter.auditStatus === 'pending' && chapter.status === 'published' && (
                                    <Badge status="warning" text={<span className="text-xs">审核中</span>} />
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                  {chapter.words.toLocaleString()}字 · 更新于 {dayjs(chapter.updatedAt).format('MM-DD HH:mm')}
                                </div>
                              </div>

                              <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex gap-1">
                                <Tooltip title="预览">
                                  <Button type="text" size="small" icon={<EyeOutlined />} />
                                </Tooltip>
                                <Tooltip title="编辑">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => openEditChapter(chapter)}
                                  />
                                </Tooltip>
                                <Popconfirm
                                  title="确定删除？"
                                  onConfirm={() => handleDeleteChapter(chapter.id)}
                                  okText="删除"
                                  cancelText="取消"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Tooltip title="删除">
                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                  </Tooltip>
                                </Popconfirm>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              key: 'editor',
              label: (
                <span className="flex items-center gap-1 px-2 py-1">
                  <EditOutlined />
                  {editingChapter ? `编辑：${chapterTitle || '未命名'}` : '新建章节'}
                  {lastSavedAt && (
                    <span className="text-xs text-green-500 ml-2 flex items-center gap-0.5">
                      <CheckCircleOutlined />
                      {dayjs(lastSavedAt).format('HH:mm:ss')}已保存
                    </span>
                  )}
                </span>
              ),
              children: (
                <div className="p-4 md:p-6">
                  <Row gutter={16}>
                    <Col xs={24} lg={18}>
                      <div className="mb-5 flex flex-wrap gap-3 items-center">
                        <span className="text-sm text-gray-500 shrink-0">分卷：</span>
                        <Select
                          value={editingChapter?.volumeId || volumes[0].id}
                          style={{ width: 200 }}
                          options={volumes.map((v) => ({ value: v.id, label: v.title }))}
                        />
                        <span className="text-sm text-gray-500 shrink-0 ml-4">章节标题：</span>
                        <Input
                          value={chapterTitle}
                          onChange={(e) => {
                            setChapterTitle(e.target.value);
                            autoSave();
                          }}
                          placeholder="请输入章节标题，例如：第1章 穿越异界"
                          className="!w-64"
                          size="large"
                        />
                      </div>

                      <div className="mb-4 flex flex-wrap gap-3 items-center pb-4 border-b">
                        <Radio.Group
                          value={chapterFree ? 'free' : 'vip'}
                          onChange={(e) => {
                            setChapterFree(e.target.value === 'free');
                            autoSave();
                          }}
                        >
                          <Radio.Button value="free">
                            <UnlockOutlined /> 免费章节
                          </Radio.Button>
                          <Radio.Button value="vip">
                            <LockOutlined /> VIP章节
                          </Radio.Button>
                        </Radio.Group>

                        {!chapterFree && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">定价：</span>
                            <InputNumber
                              min={1}
                              max={100}
                              value={chapterPrice}
                              onChange={(v) => {
                                setChapterPrice(Number(v));
                                autoSave();
                              }}
                              addonAfter="墨币/章"
                            />
                          </div>
                        )}

                        <div className="ml-auto flex items-center gap-4 text-sm text-gray-500">
                          <span>当前字数：
                            <span className="font-bold text-gray-800">
                              {chapterContent.replace(/<[^>]*>/g, '').replace(/\s/g, '').length.toLocaleString()}
                            </span>
                          </span>
                          <span>建议：2000-5000字</span>
                        </div>
                      </div>

                      <TipTapEditor
                        value={chapterContent}
                        onChange={(html) => {
                          setChapterContent(html);
                          autoSave();
                        }}
                        placeholder="开始你的创作吧..."
                        minHeight={500}
                        draftKey={`chapter_${editingChapter?.id || 'new'}`}
                        onImageUpload={async (file) => {
                          return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.readAsDataURL(file);
                          });
                        }}
                      />

                      <div className="mt-6 p-4 bg-gray-50 rounded-xl flex flex-wrap gap-3 items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <Tooltip title="系统每5秒自动保存一次">
                            <span className="flex items-center gap-1">
                              <SaveOutlined className="text-green-500" />
                              自动保存已启用
                            </span>
                          </Tooltip>
                          {lastSavedAt && (
                            <span>
                              上次保存：{dayjs(lastSavedAt).format('HH:mm:ss')}
                            </span>
                          )}
                        </div>
                        <Space size="middle">
                          <Button size="large" icon={<UndoOutlined />}>
                            撤销
                          </Button>
                          <Button size="large" icon={<RedoOutlined />}>
                            重做
                          </Button>
                          <Button
                            size="large"
                            icon={<SaveOutlined />}
                            onClick={() => handleSave(false)}
                          >
                            保存草稿
                          </Button>
                          <Button
                            type="primary"
                            size="large"
                            icon={<SendOutlined />}
                            onClick={() => handleSave(true)}
                          >
                            {editingChapter?.status === 'published' ? '更新章节' : '发布章节'}
                          </Button>
                        </Space>
                      </div>
                    </Col>

                    <Col xs={24} lg={6}>
                      <div className="space-y-4 lg:sticky lg:top-24">
                        <Card title="章节设置" size="small" className="!rounded-xl">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-gray-600 mb-1.5">章节排序</label>
                              <InputNumber
                                className="!w-full"
                                min={1}
                                value={editingChapter?.order || 1}
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-600 mb-1.5">章节备注（仅作者可见）</label>
                              <Input.TextArea
                                rows={3}
                                placeholder="备注，如：本章需要修改XXX..."
                                maxLength={200}
                                showCount
                              />
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex items-center justify-between text-sm py-1.5">
                                <span className="text-gray-600">定时发布</span>
                                <Switch size="small" />
                              </div>
                              <div className="flex items-center justify-between text-sm py-1.5">
                                <span className="text-gray-600">允许评论</span>
                                <Switch defaultChecked size="small" />
                              </div>
                              <div className="flex items-center justify-between text-sm py-1.5">
                                <span className="text-gray-600">本章打赏</span>
                                <Switch defaultChecked size="small" />
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card
                          title={
                            <span className="flex items-center gap-1.5">
                              <PictureOutlined />
                              章节插图
                            </span>
                          }
                          size="small"
                          className="!rounded-xl"
                        >
                          <ImageUploader
                            value={images}
                            onChange={setImages}
                            maxFiles={20}
                            maxFileSize={5 * 1024 * 1024}
                            mode="drag-drop"
                          />
                        </Card>

                        <Card
                          title={<span className="flex items-center gap-1.5"><WarningOutlined /> 写作提示</span>}
                          size="small"
                          className="!rounded-xl"
                        >
                          <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4">
                            <li>章节字数建议2000-5000字为佳</li>
                            <li>标题要吸引人，但不要标题党</li>
                            <li>记得在章末预告下章内容，增加追读</li>
                            <li>定时发布可以帮助读者养成阅读习惯</li>
                            <li>敏感词系统会自动检测，请文明创作</li>
                          </ul>
                        </Card>
                      </div>
                    </Col>
                  </Row>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editVolumeId ? '编辑分卷' : '新建分卷'}
        open={volumeModalOpen}
        onCancel={() => setVolumeModalOpen(false)}
        onOk={() => {
          setVolumeModalOpen(false);
          message.success(editVolumeId ? '修改成功' : '创建成功');
        }}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="分卷名称" rules={[{ required: true, message: '请输入分卷名称' }]}>
            <Input placeholder="例如：第一卷：初入异界" />
          </Form.Item>
          <Form.Item label="分卷简介">
            <Input.TextArea rows={3} placeholder="选填，本卷的简介" maxLength={200} showCount />
          </Form.Item>
          <Form.Item label="排序号">
            <InputNumber min={1} defaultValue={volumes.length + 1} className="!w-full" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加章节"
        open={chapterModalOpen}
        onCancel={() => setChapterModalOpen(false)}
        onOk={() => {
          setChapterModalOpen(false);
          openNewChapter();
        }}
        okText="去编辑"
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="所属分卷" rules={[{ required: true }]} initialValue={volumes[0].id}>
            <Select options={volumes.map((v) => ({ value: v.id, label: v.title }))} />
          </Form.Item>
          <Form.Item label="章节标题" rules={[{ required: true, message: '请输入章节标题' }]}>
            <Input placeholder="例如：第1章 穿越异界" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function Popconfirm(props: any) {
  return <span onClick={props.onConfirm}>{props.children}</span>;
}
