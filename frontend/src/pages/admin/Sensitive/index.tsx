import React, { useState, useRef } from 'react';
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
  Popconfirm,
  Upload,
  Card,
  Alert,
  Statistic,
  Row,
  Col,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  AlertOutlined,
  DownloadOutlined,
  SearchOutlined,
  WarningOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { Title, Paragraph } = Typography;

enum SensitiveCategory {
  POLITICS = 'politics',
  PORN = 'porn',
  VIOLENCE = 'violence',
  AD = 'ad',
  INSULT = 'insult',
  OTHER = 'other',
}

enum SensitiveLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

interface SensitiveWord {
  id: string;
  word: string;
  category: SensitiveCategory;
  level: SensitiveLevel;
  matchCount: number;
  replaceWith: string;
  isRegex: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const categoryMap: Record<SensitiveCategory, { text: string; color: string }> = {
  [SensitiveCategory.POLITICS]: { text: '政治敏感', color: 'red' },
  [SensitiveCategory.PORN]: { text: '色情内容', color: 'magenta' },
  [SensitiveCategory.VIOLENCE]: { text: '暴力血腥', color: 'volcano' },
  [SensitiveCategory.AD]: { text: '垃圾广告', color: 'orange' },
  [SensitiveCategory.INSULT]: { text: '辱骂攻击', color: 'gold' },
  [SensitiveCategory.OTHER]: { text: '其他', color: 'default' },
};

const levelMap: Record<SensitiveLevel, { text: string; color: string }> = {
  [SensitiveLevel.LOW]: { text: '低', color: 'blue' },
  [SensitiveLevel.MEDIUM]: { text: '中', color: 'orange' },
  [SensitiveLevel.HIGH]: { text: '高', color: 'red' },
};

const SensitivePage: React.FC = () => {
  const [data, setData] = useState<SensitiveWord[]>([
    {
      id: '1',
      word: '违禁词示例1',
      category: SensitiveCategory.POLITICS,
      level: SensitiveLevel.HIGH,
      matchCount: 128,
      replaceWith: '***',
      isRegex: false,
      enabled: true,
      createdAt: '2025-01-01 00:00:00',
      updatedAt: '2025-01-01 00:00:00',
    },
    {
      id: '2',
      word: '违规词测试',
      category: SensitiveCategory.PORN,
      level: SensitiveLevel.HIGH,
      matchCount: 56,
      replaceWith: '***',
      isRegex: false,
      enabled: true,
      createdAt: '2025-01-02 10:00:00',
      updatedAt: '2025-01-02 10:00:00',
    },
    {
      id: '3',
      word: '暴力词汇',
      category: SensitiveCategory.VIOLENCE,
      level: SensitiveLevel.MEDIUM,
      matchCount: 23,
      replaceWith: '**',
      isRegex: false,
      enabled: true,
      createdAt: '2025-01-03 14:00:00',
      updatedAt: '2025-01-03 14:00:00',
    },
    {
      id: '4',
      word: '(广告|营销|推广).{0,10}(微信|qq|群)',
      category: SensitiveCategory.AD,
      level: SensitiveLevel.MEDIUM,
      matchCount: 345,
      replaceWith: '[广告已屏蔽]',
      isRegex: true,
      enabled: true,
      createdAt: '2025-01-04 09:00:00',
      updatedAt: '2025-01-04 09:00:00',
    },
    {
      id: '5',
      word: 'sb',
      category: SensitiveCategory.INSULT,
      level: SensitiveLevel.LOW,
      matchCount: 89,
      replaceWith: '**',
      isRegex: false,
      enabled: true,
      createdAt: '2025-01-05 16:00:00',
      updatedAt: '2025-01-05 16:00:00',
    },
    {
      id: '6',
      word: 'test_disabled',
      category: SensitiveCategory.OTHER,
      level: SensitiveLevel.LOW,
      matchCount: 0,
      replaceWith: '*',
      isRegex: false,
      enabled: false,
      createdAt: '2025-01-06 12:00:00',
      updatedAt: '2025-01-06 12:00:00',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWord, setEditingWord] = useState<SensitiveWord | null>(null);
  const [form] = Form.useForm();
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [batchForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SensitiveCategory | ''>('');
  const [levelFilter, setLevelFilter] = useState<SensitiveLevel | ''>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalWords = data.length;
  const totalMatches = data.reduce((sum, w) => sum + w.matchCount, 0);
  const enabledCount = data.filter((w) => w.enabled).length;
  const highRiskCount = data.filter((w) => w.level === SensitiveLevel.HIGH).length;

  const columns: ColumnsType<SensitiveWord> = [
    {
      title: '敏感词',
      dataIndex: 'word',
      key: 'word',
      width: 260,
      render: (text, record) => (
        <div>
          <div style={{
            fontFamily: record.isRegex ? 'Consolas, Monaco, monospace' : 'inherit',
            fontWeight: 500,
            padding: '4px 8px',
            background: '#fff1f0',
            borderRadius: 4,
            display: 'inline-block',
            color: '#cf1322',
          }}>
            {text}
          </div>
          {record.isRegex && <Tag color="purple" style={{ marginLeft: 8 }}>正则</Tag>}
          {record.enabled ? (
            <Tag color="green" style={{ marginLeft: 4 }}>启用</Tag>
          ) : (
            <Tag color="default" style={{ marginLeft: 4 }}>禁用</Tag>
          )}
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 110,
      render: (category: SensitiveCategory) => (
        <Tag color={categoryMap[category].color}>
          {categoryMap[category].text}
        </Tag>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level: SensitiveLevel) => (
        <Tag color={levelMap[level].color}>
          {levelMap[level].text}
        </Tag>
      ),
    },
    {
      title: '替换为',
      dataIndex: 'replaceWith',
      key: 'replaceWith',
      width: 140,
      render: (text) => (
        <code style={{
          background: '#f5f5f5',
          padding: '2px 8px',
          borderRadius: 4,
        }}>
          {text || '不替换'}
        </code>
      ),
    },
    {
      title: '匹配次数',
      dataIndex: 'matchCount',
      key: 'matchCount',
      width: 100,
      sorter: (a, b) => a.matchCount - b.matchCount,
      render: (val) => (
        <span style={{ color: val > 100 ? '#cf1322' : val > 50 ? '#fa8c16' : 'inherit', fontWeight: 500 }}>
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => handleToggleEnabled(record.id)}
          >
            {record.enabled ? '禁用' : '启用'}
          </Button>
          <Popconfirm
            title="确定要删除这个敏感词吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (word: SensitiveWord) => {
    setEditingWord(word);
    form.setFieldsValue(word);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingWord(null);
    form.resetFields();
    form.setFieldsValue({
      category: SensitiveCategory.OTHER,
      level: SensitiveLevel.MEDIUM,
      replaceWith: '***',
      isRegex: false,
      enabled: true,
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  const handleToggleEnabled = (id: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    message.success('操作成功');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingWord) {
        setData(
          data.map((item) =>
            item.id === editingWord.id ? {
              ...item,
              ...values,
              updatedAt: new Date().toLocaleString(),
            } : item
          )
        );
        message.success('编辑成功');
      } else {
        const newWord: SensitiveWord = {
          ...values,
          id: Date.now().toString(),
          matchCount: 0,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        };
        setData([newWord, ...data]);
        message.success('添加成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleBatchImport = async () => {
    try {
      const values = await batchForm.validateFields();
      const lines = values.words.split(/[\n,，]/).filter((line: string) => line.trim());
      const newWords: SensitiveWord[] = lines.map((word: string, idx: number) => ({
        id: Date.now().toString() + idx,
        word: word.trim(),
        category: values.category || SensitiveCategory.OTHER,
        level: values.level || SensitiveLevel.MEDIUM,
        matchCount: 0,
        replaceWith: values.replaceWith || '***',
        isRegex: false,
        enabled: true,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      }));
      setData([...newWords, ...data]);
      message.success(`成功导入 ${newWords.length} 个敏感词`);
      setBatchModalVisible(false);
      batchForm.resetFields();
    } catch (error) {
      console.log('验证失败:', error);
    }
  };

  const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        batchForm.setFieldsValue({ words: text });
        message.success('文件内容已加载,请确认后导入');
      } catch (err) {
        message.error('文件解析失败');
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleExport = () => {
    const content = data.map((w) => w.word).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensitive_words_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const filteredData = data.filter((item) => {
    const matchSearch =
      !searchText ||
      item.word.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = !categoryFilter || item.category === categoryFilter;
    const matchLevel = !levelFilter || item.level === levelFilter;
    return matchSearch && matchCategory && matchLevel;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertOutlined style={{ color: '#fa541c' }} /> 敏感词管理
        </h2>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出词库
          </Button>
          <Button icon={<UploadOutlined />} onClick={() => setBatchModalVisible(true)}>
            批量导入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增敏感词
          </Button>
        </Space>
      </div>

      <Alert
        type="warning"
        showIcon
        icon={<SafetyCertificateOutlined />}
        message="内容安全提醒"
        description="敏感词库将自动应用于评论、章节内容、用户资料等所有用户生成内容。高风险词汇命中后将自动进入审核队列。"
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="词库总量"
              value={totalWords}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>个</span>}
              prefix={<AlertOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已启用"
              value={enabledCount}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>个</span>}
              prefix={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="高风险词"
              value={highRiskCount}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>个</span>}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="累计拦截"
              value={totalMatches}
              suffix={<span style={{ fontSize: 14, color: '#999' }}>次</span>}
              prefix={<AlertOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Search
          placeholder="搜索敏感词"
          allowClear
          prefix={<SearchOutlined />}
          style={{ width: 280 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          placeholder="分类筛选"
          allowClear
          style={{ width: 160 }}
          value={categoryFilter || undefined}
          onChange={(val) => setCategoryFilter(val || '')}
        >
          {Object.entries(categoryMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.text}</Option>
          ))}
        </Select>
        <Select
          placeholder="风险等级"
          allowClear
          style={{ width: 140 }}
          value={levelFilter || undefined}
          onChange={(val) => setLevelFilter(val || '')}
        >
          {Object.entries(levelMap).map(([key, val]) => (
            <Option key={key} value={key}>{val.text}</Option>
          ))}
        </Select>
      </div>

      <Table<SensitiveWord>
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个敏感词`,
        }}
      />

      <Modal
        title={editingWord ? '编辑敏感词' : '新增敏感词'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          setEditingWord(null);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="敏感词/正则表达式"
            name="word"
            rules={[
              { required: true, message: '请输入敏感词' },
              { max: 500, message: '不能超过500个字符' },
            ]}
          >
            <Input placeholder="输入敏感词或正则表达式,如: (微信|QQ).{0,5}号码" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="分类"
                name="category"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select>
                  {Object.entries(categoryMap).map(([key, val]) => (
                    <Option key={key} value={key}>{val.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="风险等级"
                name="level"
                rules={[{ required: true, message: '请选择等级' }]}
              >
                <Select>
                  {Object.entries(levelMap).map(([key, val]) => (
                    <Option key={key} value={key}>{val.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isRegex"
                valuePropName="checked"
                label="正则匹配"
              >
                <Input type="checkbox" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="替换内容(留空则直接删除)" name="replaceWith">
            <Input placeholder="如: *** 或 [已屏蔽]" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="enabled"
            valuePropName="checked"
            label="是否启用"
          >
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="批量导入敏感词"
        open={batchModalVisible}
        onOk={handleBatchImport}
        onCancel={() => {
          setBatchModalVisible(false);
          batchForm.resetFields();
        }}
        okText="确认导入"
        cancelText="取消"
        width={700}
        destroyOnClose
      >
        <Form form={batchForm} layout="vertical">
          <Alert
            type="info"
            showIcon
            message="支持格式"
            description="每行一个词,或用逗号分隔。也可上传 .txt 文件。"
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16} style={{ marginBottom: 8 }}>
            <Col span={8}>
              <Form.Item label="默认分类" name="category" initialValue={SensitiveCategory.OTHER}>
                <Select>
                  {Object.entries(categoryMap).map(([key, val]) => (
                    <Option key={key} value={key}>{val.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="默认风险等级" name="level" initialValue={SensitiveLevel.MEDIUM}>
                <Select>
                  {Object.entries(levelMap).map(([key, val]) => (
                    <Option key={key} value={key}>{val.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="默认替换为" name="replaceWith" initialValue="***">
                <Input placeholder="替换内容" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="敏感词列表" name="words" rules={[{ required: true, message: '请输入或上传敏感词' }]}>
            <TextArea
              rows={8}
              placeholder={'违禁词1\n违规词2\n广告1,广告2\n...'}
              showCount
            />
          </Form.Item>

          <Upload beforeUpload={handleFileUpload} accept=".txt" showUploadList={false}>
            <Button icon={<UploadOutlined />} block>
              选择 .txt 文件导入
            </Button>
          </Upload>
          <input type="file" ref={fileInputRef} accept=".txt" style={{ display: 'none' }} />

          <Divider />
          <Title level={5}>示例格式:</Title>
          <Paragraph>
            <Tag>违禁词1</Tag>
            <Tag>违禁词2</Tag>
            <Tag>微信</Tag>
            <Tag>广告</Tag>
          </Paragraph>
        </Form>
      </Modal>
    </div>
  );
};

export default SensitivePage;
