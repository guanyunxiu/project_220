import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Upload,
  Row,
  Col,
  InputNumber,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

enum WorkStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  COMPLETED = 'completed',
  HIATUS = 'hiatus',
}

enum WorkType {
  NOVEL = 'novel',
  COMIC = 'comic',
}

enum WorkAudience {
  ALL = 'all',
  TEEN = 'teen',
  ADULT = 'adult',
}

interface Work {
  id?: string;
  title: string;
  slug: string;
  cover: string;
  banner: string;
  description: string;
  type: WorkType;
  status: WorkStatus;
  audience: WorkAudience;
  categories: string;
  tags: string;
  language: string;
  isOriginal: boolean;
  isPremium: boolean;
  allowComments: boolean;
}

interface WorkFormProps {
  visible: boolean;
  editingWork: Work | null;
  form: any;
  onOk: () => void;
  onCancel: () => void;
}

const WorkForm: React.FC<WorkFormProps> = ({
  visible,
  editingWork,
  form,
  onOk,
  onCancel,
}) => {
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ cover: info.file.response?.url });
      }
    },
  };

  const uploadBannerProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ banner: info.file.response?.url });
      }
    },
  };

  return (
    <Modal
      title={editingWork ? '编辑作品' : '新增作品'}
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: WorkStatus.DRAFT,
          type: WorkType.NOVEL,
          audience: WorkAudience.ALL,
          isOriginal: false,
          isPremium: false,
          allowComments: true,
          ...editingWork,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="作品标题"
              name="title"
              rules={[
                { required: true, message: '请输入作品标题' },
                { max: 200, message: '标题不能超过200个字符' },
              ]}
            >
              <Input placeholder="请输入作品标题" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="URL Slug"
              name="slug"
              rules={[
                { required: true, message: '请输入URL Slug' },
                { max: 200, message: 'Slug不能超过200个字符' },
              ]}
            >
              <Input placeholder="英文短标识,如: novel-title" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="作品类型"
              name="type"
              rules={[{ required: true, message: '请选择作品类型' }]}
            >
              <Select>
                <Option value={WorkType.NOVEL}>小说</Option>
                <Option value={WorkType.COMIC}>漫画</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="发布状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value={WorkStatus.DRAFT}>草稿</Option>
                <Option value={WorkStatus.PUBLISHED}>连载中</Option>
                <Option value={WorkStatus.COMPLETED}>已完结</Option>
                <Option value={WorkStatus.HIATUS}>暂停</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="受众分级" name="audience">
              <Select>
                <Option value={WorkAudience.ALL}>全年龄</Option>
                <Option value={WorkAudience.TEEN}>青少年</Option>
                <Option value={WorkAudience.ADULT}>成人</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="语言" name="language">
              <Select defaultValue="zh-CN">
                <Option value="zh-CN">简体中文</Option>
                <Option value="zh-TW">繁体中文</Option>
                <Option value="en-US">English</Option>
                <Option value="ja-JP">日本語</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="分类标签"
              name="categories"
              help="用英文逗号分隔"
            >
              <Input placeholder="如: 科幻,冒险,玄幻" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="关键词标签"
              name="tags"
              help="用英文逗号分隔"
            >
              <Input placeholder="如: 穿越,系统,重生" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="作品简介"
          name="description"
          rules={[{ max: 1000, message: '简介不能超过1000个字符' }]}
        >
          <TextArea rows={4} placeholder="请输入作品简介" showCount maxLength={1000} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="封面图" name="cover">
              <Upload {...uploadProps} listType="picture-card" maxCount={1}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传封面</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="横幅图" name="banner">
              <Upload {...uploadBannerProps} listType="picture-card" maxCount={1}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传横幅</div>
                </div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="isOriginal"
              valuePropName="checked"
              label="原创作品"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="isPremium"
              valuePropName="checked"
              label="付费内容"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="allowComments"
              valuePropName="checked"
              label="允许评论"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default WorkForm;
