import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Tabs,
  Divider,
  message,
  Space,
  Alert,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  SafetyOutlined,
  GithubOutlined,
  QqOutlined,
  WechatOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';

type TabKey = 'login' | 'register';

interface LoginForm {
  account: string;
  password: string;
  remember: boolean;
}

interface RegisterForm {
  username: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  code?: string;
  agree: boolean;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabKey>('login');
  const [loading, setLoading] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      const user = {
        id: 1,
        username: values.account.includes('@') ? values.account.split('@')[0] : values.account,
        nickname: values.account.includes('admin') ? '管理员' : '爱读书的小明',
        avatar: `https://picsum.photos/seed/${values.account}/200/200`,
        email: values.account.includes('@') ? values.account : 'user@example.com',
        role: (values.account.includes('admin') ? 'admin' : values.account.includes('author') ? 'author' : 'user') as any,
        balance: 1288.5,
      };
      const token = 'mock-jwt-token-' + Date.now();
      setUser(user);
      setToken(token);
      message.success('登录成功！欢迎回来，' + user.nickname);
      setTimeout(() => navigate(from, { replace: true }), 500);
    } catch (e) {
      message.error('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterForm) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    if (!values.agree) {
      message.warning('请先阅读并同意用户协议');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const user = {
        id: Date.now(),
        username: values.username,
        nickname: values.nickname || values.username,
        avatar: `https://picsum.photos/seed/${values.username}/200/200`,
        email: values.email,
        role: 'user' as const,
        balance: 100,
      };
      const token = 'mock-jwt-token-' + Date.now();
      setUser(user);
      setToken(token);
      message.success('注册成功！赠送100墨币新人礼包');
      setTimeout(() => navigate('/', { replace: true }), 500);
    } catch (e) {
      message.error('注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const sendCode = () => {
    if (codeCountdown > 0) return;
    message.success('验证码已发送');
    setCodeCountdown(60);
    const timer = setInterval(() => {
      setCodeCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative min-h-screen flex flex-col">
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors"
          >
            <ArrowLeftOutlined />
            <span>返回首页</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <Link to="/" className="flex items-center justify-center gap-2 mb-8">
              <span className="text-4xl">📖</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-orange-500 bg-clip-text text-transparent">
                墨染
              </span>
            </Link>

            <Card className="!rounded-3xl shadow-2xl border-0" styles={{ body: { padding: 0 } }}>
              <Tabs
                activeKey={activeTab}
                onChange={(k) => setActiveTab(k as TabKey)}
                className="!mb-0"
                items={[
                  {
                    key: 'login',
                    label: (
                      <span className="text-base font-medium px-4 py-2">
                        登录
                      </span>
                    ),
                    children: (
                      <div className="px-8 pb-8">
                        {from !== '/' && (
                          <Alert
                            type="info"
                            showIcon
                            message="请先登录后继续访问"
                            className="mb-6 !rounded-lg"
                          />
                        )}

                        <Form<LoginForm>
                          layout="vertical"
                          onFinish={handleLogin}
                          initialValues={{ remember: true }}
                          size="large"
                        >
                          <Form.Item
                            name="account"
                            label="账号"
                            rules={[
                              { required: true, message: '请输入用户名/邮箱' },
                            ]}
                          >
                            <Input
                              prefix={<UserOutlined className="text-gray-400" />}
                              placeholder="用户名或邮箱"
                            />
                          </Form.Item>

                          <Form.Item
                            name="password"
                            label="密码"
                            rules={[{ required: true, message: '请输入密码' }]}
                          >
                            <Input.Password
                              prefix={<LockOutlined className="text-gray-400" />}
                              placeholder="请输入密码"
                              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                          </Form.Item>

                          <div className="flex items-center justify-between mb-6">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                              <Checkbox>记住我</Checkbox>
                            </Form.Item>
                            <Link to="#" className="text-sm text-primary-500 hover:text-primary-600">
                              忘记密码？
                            </Link>
                          </div>

                          <Form.Item>
                            <Button
                              type="primary"
                              htmlType="submit"
                              block
                              size="large"
                              loading={loading}
                              className="!h-12 !text-base !font-semibold bg-gradient-to-r from-primary-500 to-orange-500 border-0 hover:shadow-lg transition-shadow"
                            >
                              登 录
                            </Button>
                          </Form.Item>
                        </Form>

                        <div className="bg-blue-50 rounded-lg p-3 mb-6 text-xs text-blue-700">
                          <div className="font-medium mb-1">💡 体验账号</div>
                          <div>管理员：<span className="font-mono">admin / 123456</span></div>
                          <div>作者：<span className="font-mono">author / 123456</span></div>
                          <div>普通用户：<span className="font-mono">user / 123456</span></div>
                        </div>

                        <Divider plain className="!text-gray-400 !text-xs my-6">
                          其他登录方式
                        </Divider>

                        <div className="flex justify-center gap-6">
                          <Tooltip title="微信登录">
                            <Button
                              shape="circle"
                              size="large"
                              icon={<WechatOutlined className="!text-xl !text-green-500" />}
                              className="!w-12 !h-12"
                              onClick={() => message.info('微信登录开发中')}
                            />
                          </Tooltip>
                          <Tooltip title="QQ登录">
                            <Button
                              shape="circle"
                              size="large"
                              icon={<QqOutlined className="!text-xl !text-blue-500" />}
                              className="!w-12 !h-12"
                              onClick={() => message.info('QQ登录开发中')}
                            />
                          </Tooltip>
                          <Tooltip title="GitHub登录">
                            <Button
                              shape="circle"
                              size="large"
                              icon={<GithubOutlined className="!text-xl" />}
                              className="!w-12 !h-12"
                              onClick={() => message.info('GitHub登录开发中')}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'register',
                    label: (
                      <span className="text-base font-medium px-4 py-2">
                        注册
                      </span>
                    ),
                    children: (
                      <div className="px-8 pb-8">
                        <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-4 mb-6 border border-primary-100">
                          <div className="flex items-start gap-3">
                            <CheckCircleOutlined className="text-primary-500 text-xl mt-0.5" />
                            <div>
                              <div className="font-medium text-primary-700">新人专享福利</div>
                              <div className="text-sm text-primary-600 mt-0.5">
                                注册即送7天VIP + 1000墨币 + 免费阅读券
                              </div>
                            </div>
                          </div>
                        </div>

                        <Form<RegisterForm>
                          layout="vertical"
                          onFinish={handleRegister}
                          initialValues={{ agree: true }}
                          size="large"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                              name="username"
                              label="用户名"
                              rules={[
                                { required: true, message: '请输入用户名' },
                                { min: 3, max: 20, message: '用户名长度3-20位' },
                                { pattern: /^[a-zA-Z0-9_]+$/, message: '只能包含字母、数字、下划线' },
                              ]}
                            >
                              <Input
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="请输入用户名"
                              />
                            </Form.Item>
                            <Form.Item
                              name="nickname"
                              label="昵称"
                              rules={[{ max: 20, message: '昵称最多20字' }]}
                            >
                              <Input placeholder="请输入昵称（选填）" />
                            </Form.Item>
                          </div>

                          <Form.Item
                            name="email"
                            label="邮箱"
                            rules={[
                              { required: true, message: '请输入邮箱' },
                              { type: 'email', message: '邮箱格式不正确' },
                            ]}
                          >
                            <Input
                              prefix={<MailOutlined className="text-gray-400" />}
                              placeholder="请输入邮箱地址"
                            />
                          </Form.Item>

                          <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                              name="phone"
                              label="手机号"
                              rules={[
                                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                              ]}
                            >
                              <Input
                                prefix={<MobileOutlined className="text-gray-400" />}
                                placeholder="手机号（选填）"
                              />
                            </Form.Item>
                            <Form.Item name="code" label="验证码">
                              <Input
                                prefix={<SafetyOutlined className="text-gray-400" />}
                                placeholder="请输入验证码"
                                addonAfter={
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={sendCode}
                                    disabled={codeCountdown > 0}
                                  >
                                    {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                                  </Button>
                                }
                              />
                            </Form.Item>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                              name="password"
                              label="密码"
                              rules={[
                                { required: true, message: '请输入密码' },
                                { min: 6, max: 20, message: '密码长度6-20位' },
                              ]}
                            >
                              <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="6-20位字母数字组合"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                              />
                            </Form.Item>
                            <Form.Item
                              name="confirmPassword"
                              label="确认密码"
                              rules={[{ required: true, message: '请再次输入密码' }]}
                            >
                              <Input.Password
                                prefix={<LockOutlined className="text-gray-400" />}
                                placeholder="请再次输入密码"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                              />
                            </Form.Item>
                          </div>

                          <Form.Item
                            name="agree"
                            valuePropName="checked"
                            rules={[
                              {
                                validator: (_, v) =>
                                  v ? Promise.resolve() : Promise.reject(new Error('请先阅读并同意协议')),
                              },
                            ]}
                          >
                            <Checkbox className="text-sm">
                              我已阅读并同意
                              <a href="#" className="text-primary-500 hover:text-primary-600 mx-1">
                                《用户协议》
                              </a>
                              和
                              <a href="#" className="text-primary-500 hover:text-primary-600 mx-1">
                                《隐私政策》
                              </a>
                            </Checkbox>
                          </Form.Item>

                          <Form.Item className="!mb-0">
                            <Button
                              type="primary"
                              htmlType="submit"
                              block
                              size="large"
                              loading={loading}
                              className="!h-12 !text-base !font-semibold bg-gradient-to-r from-primary-500 to-orange-500 border-0 hover:shadow-lg transition-shadow"
                            >
                              立即注册
                            </Button>
                          </Form.Item>
                        </Form>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            <div className="text-center mt-8 text-sm text-gray-500">
              {activeTab === 'login' ? (
                <span>
                  还没有账号？
                  <button
                    className="text-primary-500 hover:text-primary-600 font-medium ml-1"
                    onClick={() => setActiveTab('register')}
                  >
                    立即注册
                  </button>
                </span>
              ) : (
                <span>
                  已有账号？
                  <button
                    className="text-primary-500 hover:text-primary-600 font-medium ml-1"
                    onClick={() => setActiveTab('login')}
                  >
                    去登录
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 text-center text-xs text-gray-400">
          © 2024 墨染文学 · 用心创作每一个故事
          <Space className="ml-4">
            <a href="#" className="hover:text-gray-600">用户协议</a>
            <a href="#" className="hover:text-gray-600">隐私政策</a>
            <a href="#" className="hover:text-gray-600">联系客服</a>
          </Space>
        </div>
      </div>
    </div>
  );
}
