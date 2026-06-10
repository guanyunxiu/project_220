import { useState } from 'react';
import { Modal, Button, InputNumber, Avatar, List, Radio, message, Progress } from 'antd';
import { GiftOutlined, CrownOutlined, FireOutlined, CheckOutlined, RocketOutlined, TrophyOutlined, CoffeeOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export interface Reward {
  id: number;
  userId: number;
  username: string;
  nickname: string;
  avatar?: string;
  amount: number;
  message?: string;
  createdAt: string;
}

interface RewardModalProps {
  open: boolean;
  onCancel: () => void;
  workId: number;
  workTitle?: string;
  authorName?: string;
  rewards?: Reward[];
  rewardGoal?: {
    current: number;
    target: number;
    title: string;
  };
  onReward?: (amount: number, message?: string) => Promise<void>;
}

const quickAmounts = [
  { amount: 1, label: '小心意', icon: <CoffeeOutlined />, color: 'bg-gray-50 border-gray-200 text-gray-600' },
  { amount: 5, label: '奶茶钱', icon: <GiftOutlined />, color: 'bg-green-50 border-green-200 text-green-600' },
  { amount: 10, label: '打call', icon: <FireOutlined />, color: 'bg-orange-50 border-orange-200 text-orange-600' },
  { amount: 50, label: '大佬', icon: <CrownOutlined />, color: 'bg-purple-50 border-purple-200 text-purple-600' },
  { amount: 100, label: '盟主', icon: <TrophyOutlined />, color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
  { amount: 1000, label: '神豪', icon: <RocketOutlined />, color: 'bg-red-50 border-red-300 text-red-600' },
];

export default function RewardModal({
  open,
  onCancel,
  workTitle,
  authorName,
  rewards = [],
  rewardGoal,
  onReward,
}: RewardModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState<number>();
  const [rewardMsg, setRewardMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [payMethod, setPayMethod] = useState('balance');
  const { user, token } = useAuthStore();
  const navigate = useNavigate();

  const finalAmount = customAmount || selectedAmount || 0;

  const handleReward = async () => {
    if (!token || !user) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    if (finalAmount <= 0) {
      message.warning('请选择打赏金额');
      return;
    }
    if (payMethod === 'balance' && user.balance && user.balance < finalAmount) {
      message.warning('余额不足，请充值或选择其他支付方式');
      return;
    }
    try {
      setSubmitting(true);
      await onReward?.(finalAmount, rewardMsg.trim() || undefined);
      message.success(`打赏成功！感谢您的 ${finalAmount} 元支持`);
      setSelectedAmount(10);
      setCustomAmount(undefined);
      setRewardMsg('');
      onCancel();
    } catch {
      message.error('打赏失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (num: number) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toString();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose
      title={
        <div className="flex items-center gap-2">
          <GiftOutlined className="text-primary-500" />
          <span>打赏支持</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {workTitle && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">打赏作品</div>
              <div className="font-medium mt-1">{workTitle}</div>
              {authorName && (
                <div className="text-xs text-gray-400 mt-1">作者：{authorName}</div>
              )}
            </div>
          )}

          {rewardGoal && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{rewardGoal.title}</span>
                <span className="text-sm text-primary-600 font-medium">
                  {formatAmount(rewardGoal.current)} / {formatAmount(rewardGoal.target)}
                </span>
              </div>
              <Progress
                percent={Math.min(100, (rewardGoal.current / rewardGoal.target) * 100)}
                strokeColor={{ from: '#f97316', to: '#ea580c' }}
                showInfo={false}
                size="small"
              />
              <div className="mt-2 text-xs text-gray-500 text-right">
                距离目标还差 {formatAmount(Math.max(0, rewardGoal.target - rewardGoal.current))} 元
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-3">选择打赏金额</div>
            <div className="grid grid-cols-3 gap-3">
              {quickAmounts.map((item) => (
                <button
                  key={item.amount}
                  onClick={() => {
                    setSelectedAmount(item.amount);
                    setCustomAmount(undefined);
                  }}
                  className={`relative p-3 rounded-lg border-2 transition-all ${
                    selectedAmount === item.amount && !customAmount
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                      : item.color
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-lg font-bold">{item.amount}元</div>
                  <div className="text-xs opacity-75">{item.label}</div>
                  {selectedAmount === item.amount && !customAmount && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <CheckOutlined className="text-white text-xs" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">自定义金额</div>
            <div className="flex items-center gap-2">
              <InputNumber
                min={1}
                max={100000}
                placeholder="输入金额"
                value={customAmount}
                onChange={(val) => {
                  setCustomAmount(val as number | undefined);
                  setSelectedAmount(null);
                }}
                addonAfter="元"
                className="!w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">留言（可选）</div>
            <textarea
              value={rewardMsg}
              onChange={(e) => setRewardMsg(e.target.value)}
              placeholder="说点什么鼓励作者吧..."
              maxLength={100}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 resize-none"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-2">支付方式</div>
            <Radio.Group
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full"
            >
              <Radio.Button value="balance" className="!w-1/3 text-center">
                余额支付
                {user?.balance !== undefined && (
                  <div className="text-xs text-gray-400 mt-0.5">余额：¥{user.balance.toFixed(2)}</div>
                )}
              </Radio.Button>
              <Radio.Button value="wechat" className="!w-1/3 text-center">
                🟢 微信
              </Radio.Button>
              <Radio.Button value="alipay" className="!w-1/3 text-center">
                🔵 支付宝
              </Radio.Button>
            </Radio.Group>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-gray-500">合计打赏：</span>
              <span className="text-2xl font-bold text-primary-500 ml-2">¥{finalAmount.toFixed(2)}</span>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<GiftOutlined />}
              onClick={handleReward}
              loading={submitting}
              disabled={finalAmount <= 0}
              className="!px-8"
            >
              确认打赏
            </Button>
          </div>
        </div>

        <div className="border-l border-gray-100 md:pl-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">打赏榜</h4>
            <span className="text-xs text-gray-400">共 {rewards.length} 人打赏</span>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <GiftOutlined className="text-4xl mb-3 opacity-30" />
              <p>暂无打赏记录</p>
              <p className="text-xs mt-1">成为第一个支持者吧！</p>
            </div>
          ) : (
            <List
              dataSource={rewards.slice(0, 15)}
              className="!max-h-[500px] overflow-y-auto"
              renderItem={(item, index) => (
                <List.Item className="!px-0 !py-3 !border-b-0 border-b border-gray-50 last:border-b-0">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full">
                      {index < 3 ? (
                        <span
                          className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'
                          }`}
                        >
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">{index + 1}</span>
                      )}
                    </div>
                    <Avatar src={item.avatar} size={36} className="shrink-0">
                      {(item.nickname || item.username).charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.nickname || item.username}
                      </div>
                      {item.message && (
                        <div className="text-xs text-gray-500 truncate mt-0.5">{item.message}</div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-sm font-bold text-primary-500">¥{item.amount}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {dayjs(item.createdAt).format('MM-DD')}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
