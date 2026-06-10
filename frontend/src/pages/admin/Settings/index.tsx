import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Tabs,
  Upload,
  message,
  Space,
  Row,
  Col,
  Alert,
  Slider,
  DatePicker,
} from 'antd';
import {
  SettingOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  DollarOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { TabsProps, UploadProps } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const initialValues = {
    siteName: '创作平台',
    siteDescription: '专业的小说/漫画连载平台',
    siteKeywords: '小说,漫画,连载,阅读,创作',
    siteLogo: '',
    siteIcon: '',
    icpNumber: '京ICP备00000000号-1',
    copyright: '© 2025 创作平台. All rights reserved.',
    contactEmail: 'support@example.com',
    defaultLanguage: 'zh-CN',
    defaultTimezone: 'Asia/Shanghai',
    enableRegistration: true,
    enableEmailVerification: true,
    enablePhoneVerification: false,
    defaultUserRole: 'user',
    requireReviewForNewWorks: false,
    maxDailyWorkCreations: 10,
    minRewardAmount: 1,
    maxRewardAmount: 10000,
    rewardCommissionRate: 30,
    withdrawThreshold: 100,
    enableWithdraw: true,
    uploadMaxImageSize: 10,
    uploadMaxFileSize: 100,
    allowedImageTypes: ['jpeg', 'png', 'gif', 'webp'],
    imageQuality: 85,
    enableWatermark: false,
    watermarkText: '@创作平台',
    smtpHost: 'smtp.example.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'noreply@example.com',
    senderName: '创作平台',
    enableCommentReview: true,
    enableSensitiveWordFilter: true,
    autoBanThreshold: 5,
    reportAutoReview: true,
    maintenanceMode: false,
    maintenanceNotice: '系统维护中,请稍后访问。',
    siteStatus: 'online',
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        message.success('系统设置已保存');
      }, 800);
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('已重置为当前保存的设置');
  };

  const logoUploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload',
    headers: { authorization: `Bearer ${localStorage.getItem('token') || ''}` },
    maxCount: 1,
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ siteLogo: info.file.response?.url });
        message.success('Logo上传成功');
      }
    },
  };

  const iconUploadProps: UploadProps = {
    ...logoUploadProps,
    onChange(info) {
      if (info.file.status === 'done') {
        form.setFieldsValue({ siteIcon: info.file.response?.url });
        message.success('图标上传成功');
      }
    },
  };

  const tabItems: TabsProps['items'] = [
    {
      key: 'basic',
      label: <span><SettingOutlined /> 基础设置</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="站点信息" size="small" style={{ marginBottom: 24 }}>
            <Form.Item label="站点名称" name="siteName" rules={[{ required: true, message: '请输入站点名称' }]}>
              <Input placeholder="站点名称" />
            </Form.Item>
            <Form.Item label="站点描述" name="siteDescription">
              <TextArea rows={2} placeholder="站点SEO描述" showCount maxLength={200} />
            </Form.Item>
            <Form.Item label="站点关键词" name="siteKeywords">
              <Input placeholder="逗号分隔,用于SEO" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="站点Logo" name="siteLogo">
                  <Upload {...logoUploadProps} listType="picture-card" maxCount={1}>
                    <UploadOutlined /><div style={{ marginTop: 8, fontSize: 12 }}>上传Logo</div>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="站点图标(Favicon)" name="siteIcon">
                  <Upload {...iconUploadProps} listType="picture-card" maxCount={1}>
                    <UploadOutlined /><div style={{ marginTop: 8, fontSize: 12 }}>上传图标</div>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title="法律信息" size="small" style={{ marginBottom: 24 }}>
            <Form.Item label="ICP备案号" name="icpNumber">
              <Input placeholder="如: 京ICP备00000000号" />
            </Form.Item>
            <Form.Item label="版权声明" name="copyright">
              <Input placeholder="如: © 2025 ..." />
            </Form.Item>
          </Card>
          <Card title="联系方式" size="small" style={{ marginBottom: 24 }}>
            <Form.Item label="联系邮箱" name="contactEmail" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
              <Input placeholder="support@example.com" prefix={<MailOutlined />} />
            </Form.Item>
          </Card>
          <Card title="本地化" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="默认语言" name="defaultLanguage">
                  <Select>
                    <Option value="zh-CN">简体中文</Option>
                    <Option value="zh-TW">繁體中文</Option>
                    <Option value="en-US">English</Option>
                    <Option value="ja-JP">日本語</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="默认时区" name="defaultTimezone">
                  <Select>
                    <Option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</Option>
                    <Option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</Option>
                    <Option value="America/New_York">America/New_York (UTC-5)</Option>
                    <Option value="Europe/London">Europe/London (UTC+0)</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form.Item>
      ),
    },
    {
      key: 'user',
      label: <span><SafetyCertificateOutlined /> 用户设置</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="注册与验证" size="small" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="enableRegistration" valuePropName="checked" label="允许用户注册">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="requireReviewForNewWorks" valuePropName="checked" label="新作品需审核">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="enableEmailVerification" valuePropName="checked" label="邮箱验证">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="enablePhoneVerification" valuePropName="checked" label="手机号验证">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="默认用户角色" name="defaultUserRole">
                  <Select>
                    <Option value="user">普通用户</Option>
                    <Option value="author">创作者</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="每日创建作品上限" name="maxDailyWorkCreations">
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form.Item>
      ),
    },
    {
      key: 'reward',
      label: <span><DollarOutlined /> 打赏与财务</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="打赏设置" size="small" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="最低打赏金额(元)" name="minRewardAmount">
                  <InputNumber min={0.01} max={100} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="最高打赏金额(元)" name="maxRewardAmount">
                  <InputNumber min={1} step={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="平台抽成比例(%)" name="rewardCommissionRate" extra="创作者获得剩余部分">
              <Slider min={0} max={80} />
            </Form.Item>
          </Card>
          <Card title="提现设置" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="enableWithdraw" valuePropName="checked" label="允许提现">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="最低提现金额(元)" name="withdrawThreshold">
                  <InputNumber min={10} step={10} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form.Item>
      ),
    },
    {
      key: 'upload',
      label: <span><PictureOutlined /> 上传设置</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="文件大小限制" size="small" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="图片大小限制(MB)" name="uploadMaxImageSize">
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="文件大小限制(MB)" name="uploadMaxFileSize">
                  <InputNumber min={10} max={500} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card title="图片格式与质量" size="small" style={{ marginBottom: 24 }}>
            <Form.Item label="允许的图片格式" name="allowedImageTypes">
              <Select mode="multiple" allowClear>
                <Option value="jpeg">JPEG</Option>
                <Option value="png">PNG</Option>
                <Option value="gif">GIF</Option>
                <Option value="webp">WebP</Option>
                <Option value="bmp">BMP</Option>
              </Select>
            </Form.Item>
            <Form.Item label="图片压缩质量" name="imageQuality" extra="100为无损,数值越小质量越低">
              <Slider min={30} max={100} />
            </Form.Item>
          </Card>
          <Card title="水印设置" size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="enableWatermark" valuePropName="checked" label="启用图片水印">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="水印文字" name="watermarkText">
                  <Input placeholder="如: @创作平台" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Form.Item>
      ),
    },
    {
      key: 'smtp',
      label: <span><MailOutlined /> 邮件服务</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="SMTP配置" size="small">
            <Form.Item label="SMTP服务器地址" name="smtpHost">
              <Input placeholder="如: smtp.example.com" />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="端口" name="smtpPort">
                  <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="smtpSecure" valuePropName="checked" label="启用SSL/TLS" extra="通常465端口为开启">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="SMTP用户名" name="smtpUser">
              <Input placeholder="通常是邮箱地址" />
            </Form.Item>
            <Form.Item label="SMTP密码" name="smtpPass">
              <Input.Password placeholder="授权码或密码" />
            </Form.Item>
            <Form.Item label="发件人名称" name="senderName">
              <Input placeholder="邮件显示的发件人名称" />
            </Form.Item>
            <div>
              <Button type="dashed">发送测试邮件</Button>
            </div>
          </Card>
        </Form.Item>
      ),
    },
    {
      key: 'security',
      label: <span><SafetyCertificateOutlined /> 安全与审核</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="内容审核" size="small" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="enableCommentReview" valuePropName="checked" label="评论需审核">
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="enableSensitiveWordFilter" valuePropName="checked" label="敏感词过滤">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="违规自动封禁阈值(次)" name="autoBanThreshold">
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="reportAutoReview" valuePropName="checked" label="举报自动审核">
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Alert
            type="info"
            showIcon
            message="安全提示"
            description="敏感词库可在「敏感词管理」页面配置。建议启用评论审核和敏感词过滤以保证社区内容质量。"
          />
        </Form.Item>
      ),
    },
    {
      key: 'maintenance',
      label: <span><SettingOutlined /> 系统维护</span>,
      children: (
        <Form.Item wrapperCol={{ span: 16, offset: 4 }}>
          <Card title="站点状态" size="small" style={{ marginBottom: 24 }}>
            <Form.Item label="站点运行状态" name="siteStatus">
              <Select>
                <Option value="online">正常运行</Option>
                <Option value="limited">限制模式(仅管理员可访问)</Option>
                <Option value="maintenance">维护模式(全站不可访问)</Option>
              </Select>
            </Form.Item>
            <Form.Item name="maintenanceMode" valuePropName="checked" label="启用维护模式">
              <Switch />
            </Form.Item>
            <Form.Item label="维护公告" name="maintenanceNotice">
              <TextArea rows={3} placeholder="显示给用户的维护提示信息" />
            </Form.Item>
            <Form.Item label="预计维护结束时间" name="maintenanceEndTime">
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </Card>
          <Alert
            type="warning"
            showIcon
            message="危险操作"
            description="维护模式将导致普通用户无法访问站点,请谨慎操作。"
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined /> 系统设置
        </h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={loading} onClick={handleSave}>
            保存设置
          </Button>
        </Space>
      </div>
      <Card bordered={false} bodyStyle={{ paddingTop: 0 }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          labelCol={{ span: 4 }}
        >
          <Tabs items={tabItems} />
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;
