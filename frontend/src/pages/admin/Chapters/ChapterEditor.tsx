import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Upload,
  Row,
  Col,
  Button,
  Space,
  message,
  Tag,
  Divider,
  Alert,
  Typography,
} from 'antd';
import {
  UploadOutlined,
  SaveOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { Dragger } = Upload;
const { TextArea } = Input;
const { Text } = Typography;

enum ChapterStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PUBLISHED = 'published',
}

enum ChapterAccess {
  FREE = 'free',
  LOCKED = 'locked',
  PREMIUM = 'premium',
}

interface Chapter {
  id?: string;
  workId: string;
  volumeId?: string;
  order: number;
  title: string;
  summary?: string;
  content?: string;
  contentHtml?: string;
  images?: any[];
  thumbnail?: string;
  status: ChapterStatus;
  access: ChapterAccess;
  price: number;
  wordCount: number;
  allowComments: boolean;
  isNsfw: boolean;
  translator?: string;
  editor?: string;
  sourceUrl?: string;
}

interface WorkItem {
  id: string;
  title: string;
}

interface VolumeItem {
  id: string;
  workId: string;
  title: string;
}

interface ChapterEditorProps {
  visible: boolean;
  editingChapter: Chapter | null;
  works: WorkItem[];
  volumes: VolumeItem[];
  onSave: (values: any) => void;
  onCancel: () => void;
}

const AUTO_SAVE_INTERVAL = 30000;
const DRAFT_STORAGE_KEY = 'chapter_draft';

const ChapterEditor: React.FC<ChapterEditorProps> = ({
  visible,
  editingChapter,
  works,
  volumes,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [autoSaveTime, setAutoSaveTime] = useState<string | null>(null);
  const [showVolumes, setShowVolumes] = useState<VolumeItem[]>([]);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      if (editingChapter) {
        form.setFieldsValue(editingChapter);
        setContent(editingChapter.content || '');
        setWordCount(editingChapter.wordCount || 0);
        setShowVolumes(volumes.filter((v) => v.workId === editingChapter.workId));
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: ChapterStatus.DRAFT,
          access: ChapterAccess.FREE,
          order: 1,
          price: 0,
          allowComments: true,
          isNsfw: false,
        });
        setContent('');
        setWordCount(0);
        setShowVolumes([]);
      }
      loadDraft();
      startAutoSave();
    } else {
      stopAutoSave();
    }
    return () => stopAutoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editingChapter]);

  const startAutoSave = () => {
    stopAutoSave();
    autoSaveTimerRef.current = setInterval(() => {
      saveDraft();
    }, AUTO_SAVE_INTERVAL);
  };

  const stopAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
  };

  const saveDraft = () => {
    try {
      const values = form.getFieldsValue();
      const draft = {
        ...values,
        content,
        wordCount,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setAutoSaveTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Auto save failed:', e);
    }
  };

  const loadDraft = () => {
    try {
      const draftStr = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (draftStr && !editingChapter) {
        const draft = JSON.parse(draftStr);
        const isRecent =
          Date.now() - new Date(draft.savedAt).getTime() < 24 * 60 * 60 * 1000;
        if (isRecent) {
          Modal.confirm({
            title: '发现未完成的草稿',
            content: `检测到 ${new Date(draft.savedAt).toLocaleString()} 保存的草稿,是否恢复?`,
            okText: '恢复草稿',
            cancelText: '忽略',
            onOk: () => {
              form.setFieldsValue(draft);
              setContent(draft.content || '');
              setWordCount(draft.wordCount || 0);
            },
          });
        }
      }
    } catch (e) {
      console.error('Load draft failed:', e);
    }
  };

  const handleWorkChange = (workId: string) => {
    form.setFieldsValue({ volumeId: undefined });
    setShowVolumes(volumes.filter((v) => v.workId === workId));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setWordCount(val.replace(/\s/g, '').length);
  };

  const handleManualSave = () => {
    saveDraft();
    message.success('草稿已保存');
  };

  const handleSubmit = async (asDraft = false) => {
    try {
      const values = await form.validateFields();
      const submitData: any = {
        ...values,
        content,
        contentHtml: content,
        wordCount,
      };
      if (asDraft) {
        submitData.status = ChapterStatus.DRAFT;
      }
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      onSave(submitData);
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
    multiple: true,
    accept: 'image/*',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`图片上传成功: ${info.file.name}`);
      } else if (info.file.status === 'error') {
        message.error(`图片上传失败: ${info.file.name}`);
      }
    },
  };

  const thumbnailUploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ thumbnail: info.file.response?.url });
        message.success('缩略图上传成功');
      }
    },
  };

  return (
    <Modal
      title={editingChapter ? '编辑章节' : '新增章节'}
      open={visible}
      onCancel={onCancel}
      width={1000}
      destroyOnClose
      footer={null}
      maskClosable={false}
    >
      {autoSaveTime && (
        <Alert
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          message={`已自动保存于 ${autoSaveTime}`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="所属作品"
              name="workId"
              rules={[{ required: true, message: '请选择作品' }]}
            >
              <Select placeholder="选择作品" onChange={handleWorkChange}>
                {works.map((w) => (
                  <Option key={w.id} value={w.id}>{w.title}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="所属卷(可选)" name="volumeId">
              <Select
                placeholder="选择卷"
                allowClear
                disabled={showVolumes.length === 0}
              >
                {showVolumes.map((v) => (
                  <Option key={v.id} value={v.id}>{v.title}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="章节序号"
              name="order"
              rules={[{ required: true, message: '请输入章节序号' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label="章节标题"
              name="title"
              rules={[
                { required: true, message: '请输入章节标题' },
                { max: 200, message: '标题不能超过200个字符' },
              ]}
            >
              <Input placeholder="如: 第一章 初入江湖" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="发布状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value={ChapterStatus.DRAFT}>草稿</Option>
                <Option value={ChapterStatus.PENDING}>待审核</Option>
                <Option value={ChapterStatus.PUBLISHED}>已发布</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="访问权限"
              name="access"
              rules={[{ required: true, message: '请选择权限' }]}
            >
              <Select>
                <Option value={ChapterAccess.FREE}>免费阅读</Option>
                <Option value={ChapterAccess.LOCKED}>锁定章节</Option>
                <Option value={ChapterAccess.PREMIUM}>付费解锁</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="价格(金币)"
              name="price"
              dependencies={['access']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (getFieldValue('access') !== ChapterAccess.FREE && (!value || value < 0)) {
                      return Promise.reject(new Error('请设置价格'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                formatter={(value) => `¥ ${value}`}
                parser={(value) => value?.replace(/¥\s?/g, '') as any}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="章节摘要" name="summary">
          <TextArea
            rows={2}
            placeholder="章节简介(可选)"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Divider orientation="left">
          <Tag color="blue">富文本内容区</Tag>
        </Divider>

        <div style={{
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          background: '#fafafa',
        }}>
          <Space wrap>
            <Button size="small" type="text"><b>B</b></Button>
            <Button size="small" type="text"><i>I</i></Button>
            <Button size="small" type="text"><u>U</u></Button>
            <Button size="small" type="text"><s>S</s></Button>
            <span style={{ borderRight: '1px solid #e8e8e8', height: 20 }} />
            <Button size="small" type="text">H1</Button>
            <Button size="small" type="text">H2</Button>
            <Button size="small" type="text">H3</Button>
            <span style={{ borderRight: '1px solid #e8e8e8', height: 20 }} />
            <Button size="small" type="text">• 列表</Button>
            <Button size="small" type="text">1. 列表</Button>
            <Button size="small" type="text">❝ 引用</Button>
            <Button size="small" type="text">⟩⟨ 代码</Button>
            <span style={{ borderRight: '1px solid #e8e8e8', height: 20 }} />
            <Button size="small" type="text" icon={<UploadOutlined />}>图片</Button>
            <Button size="small" type="text">🔗 链接</Button>
          </Space>
        </div>

        <Form.Item label={
          <Space>
            <span>章节正文</span>
            <Text type="secondary" style={{ fontSize: 12 }}>
              当前字数: <b style={{ color: '#1677ff' }}>{wordCount.toLocaleString()}</b> 字
            </Text>
          </Space>
        }>
          <TextArea
            value={content}
            onChange={handleContentChange}
            rows={15}
            placeholder="在此输入章节正文内容...&#10;&#10;(支持TipTap富文本编辑器,此处为预览占位,实际项目中请替换为 @tiptap/react 编辑器)"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              lineHeight: 1.8,
              fontSize: 16,
              padding: 16,
            }}
          />
        </Form.Item>

        <Divider orientation="left">
          <Tag color="purple">多媒体资源</Tag>
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="章节缩略图(可选)" name="thumbnail">
              <Upload {...thumbnailUploadProps} listType="picture-card" maxCount={1}>
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传缩略图</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="漫画图片/插图(多选)">
              <Dragger {...uploadProps} height={150}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
                <p className="ant-upload-hint">支持批量上传漫画图片,按顺序排列</p>
              </Dragger>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">
          <Tag color="green">其他设置</Tag>
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="翻译者" name="translator">
              <Input placeholder="翻译者/汉化组" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="校对/编辑" name="editor">
              <Input placeholder="编辑者" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="原文链接" name="sourceUrl">
              <Input placeholder="原作品URL" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="allowComments"
              valuePropName="checked"
              label="允许评论"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isNsfw"
              valuePropName="checked"
              label="NSFW内容"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Button
              type="dashed"
              icon={<SaveOutlined />}
              onClick={handleManualSave}
              block
            >
              手动保存草稿
            </Button>
          </Col>
        </Row>
      </Form>

      <Divider style={{ marginBottom: 16 }} />

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSubmit(true)}
          >
            保存为草稿
          </Button>
          <Button
            type="primary"
            onClick={() => handleSubmit(false)}
          >
            {editingChapter ? '保存修改' : '创建章节'}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default ChapterEditor;
