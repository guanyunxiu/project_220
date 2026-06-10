import { useState } from 'react';
import { Avatar, Button, Input, List, Empty, Tooltip, message, Popconfirm } from 'antd';
import {
  LikeOutlined,
  LikeFilled,
  DislikeOutlined,
  DislikeFilled,
  SendOutlined,
  DeleteOutlined,
  MessageOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAuthStore } from '../store/useAuthStore';

export interface Comment {
  id: number;
  userId: number;
  username: string;
  nickname: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  replies?: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
  replyTo?: string;
}

interface CommentListProps {
  comments: Comment[];
  total?: number;
  onSubmit?: (content: string, parentId?: number) => Promise<void>;
  onLike?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  placeholder?: string;
  showInput?: boolean;
  allowReply?: boolean;
}

export default function CommentList({
  comments,
  total,
  onSubmit,
  onLike,
  onDelete,
  placeholder = '写下你的评论...',
  showInput = true,
  allowReply = true,
}: CommentListProps) {
  const [inputValue, setInputValue] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore();

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    if (!user) {
      message.warning('请先登录');
      return;
    }
    try {
      setSubmitting(true);
      await onSubmit?.(inputValue, replyTo?.id);
      setInputValue('');
      setReplyTo(null);
      message.success('评论成功');
    } catch {
      message.error('评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo({ id: comment.id, name: comment.nickname || comment.username });
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <List.Item
      key={comment.id}
      className="!px-0 !py-4 border-b border-gray-50 last:border-b-0"
      style={{ marginLeft: depth > 0 ? 48 : 0 }}
    >
      <div className="flex gap-3 w-full">
        <Avatar src={comment.avatar} size={40} className="shrink-0">
          {(comment.nickname || comment.username).charAt(0).toUpperCase()}
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">
              {comment.nickname || comment.username}
            </span>
            {comment.replyTo && (
              <span className="text-sm text-gray-400">
                回复 <span className="text-primary-500">@{comment.replyTo}</span>
              </span>
            )}
            <span className="text-xs text-gray-400">
              {dayjs(comment.createdAt).fromNow()}
            </span>
          </div>
          <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-2 text-gray-500">
            <Tooltip title={comment.isLiked ? '取消点赞' : '点赞'}>
              <Button
                type="text"
                size="small"
                icon={comment.isLiked ? <LikeFilled className="text-primary-500" /> : <LikeOutlined />}
                onClick={() => onLike?.(comment.id)}
                className={`!px-2 !min-w-0 ${comment.isLiked ? '!text-primary-500' : ''}`}
              >
                <span className="text-xs ml-1">{comment.likes || ''}</span>
              </Button>
            </Tooltip>
            <Tooltip title={comment.isDisliked ? '取消点踩' : '点踩'}>
              <Button
                type="text"
                size="small"
                icon={comment.isDisliked ? <DislikeFilled className="text-gray-700" /> : <DislikeOutlined />}
                className="!px-2 !min-w-0"
              >
                <span className="text-xs ml-1">{comment.dislikes || ''}</span>
              </Button>
            </Tooltip>
            {allowReply && depth === 0 && (
              <Button
                type="text"
                size="small"
                icon={<MessageOutlined />}
                onClick={() => handleReply(comment)}
                className="!px-2 !min-w-0"
              >
                <span className="text-xs ml-1">回复</span>
              </Button>
            )}
            {user && (user.id === comment.userId || user.role === 'admin') && (
              <Popconfirm
                title="确定删除这条评论吗？"
                onConfirm={() => onDelete?.(comment.id)}
                okText="删除"
                cancelText="取消"
              >
                <Tooltip title="删除">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    className="!px-2 !min-w-0"
                  />
                </Tooltip>
              </Popconfirm>
            )}
            <Tooltip title="举报">
              <Button
                type="text"
                size="small"
                icon={<WarningOutlined />}
                className="!px-2 !min-w-0 !text-gray-400 hover:!text-red-500"
              />
            </Tooltip>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-0">
              {comment.replies.map((reply) => renderComment(reply, depth + 1))}
            </div>
          )}
        </div>
      </div>
    </List.Item>
  );

  return (
    <div className="bg-white rounded-xl p-6">
      {showInput && (
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex gap-3">
            <Avatar src={user?.avatar} size={40} className="shrink-0">
              {user ? (user.nickname || user.username).charAt(0).toUpperCase() : '?'}
            </Avatar>
            <div className="flex-1">
              {replyTo && (
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <span>回复 @{replyTo.name}</span>
                  <Button type="text" size="small" onClick={() => setReplyTo(null)} className="!h-auto !p-0">
                    取消
                  </Button>
                </div>
              )}
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={user ? placeholder : '请先登录后发表评论'}
                rows={3}
                maxLength={500}
                showCount
                disabled={!user}
              />
              <div className="flex justify-end mt-3">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!user || !inputValue.trim()}
                >
                  发表评论
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          全部评论 <span className="text-gray-400 text-sm font-normal">({total ?? comments.length})</span>
        </h3>
      </div>

      {comments.length === 0 ? (
        <Empty description="暂无评论，快来抢沙发吧～" className="py-12" />
      ) : (
        <List
          dataSource={comments}
          renderItem={(comment) => renderComment(comment)}
          className="!border-0"
        />
      )}
    </div>
  );
}
