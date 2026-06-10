import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { useEffect, useCallback, useRef } from 'react';
import { Button, Tooltip, message } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  BlockOutlined,
  PictureOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  ClearOutlined,
} from '@ant-design/icons';

interface TipTapEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: number;
  draftKey?: string;
  onImageUpload?: (file: File) => Promise<string>;
  showToolbar?: boolean;
  autoSaveInterval?: number;
}

export default function TipTapEditor({
  value,
  onChange,
  placeholder = '开始写作...',
  editable = true,
  minHeight = 300,
  draftKey,
  onImageUpload,
  showToolbar = true,
  autoSaveInterval = 30000,
}: TipTapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSavedRef = useRef<number>(Date.now());

  const saveDraft = useCallback(() => {
    if (!draftKey || !editor) return;
    const content = editor.getHTML();
    if (content && content !== '<p></p>') {
      try {
        localStorage.setItem(
          `draft_${draftKey}`,
          JSON.stringify({
            content,
            savedAt: Date.now(),
          })
        );
        lastSavedRef.current = Date.now();
      } catch (e) {
        console.error('保存草稿失败:', e);
      }
    }
  }, [draftKey]);

  const loadDraft = useCallback(() => {
    if (!draftKey || !editor) return;
    try {
      const saved = localStorage.getItem(`draft_${draftKey}`);
      if (saved) {
        const { content, savedAt } = JSON.parse(saved);
        const hours = (Date.now() - savedAt) / (1000 * 60 * 60);
        if (hours < 72) {
          editor.commands.setContent(content);
          message.info('已恢复最近的草稿');
        } else {
          localStorage.removeItem(`draft_${draftKey}`);
        }
      }
    } catch (e) {
      console.error('加载草稿失败:', e);
    }
  }, [draftKey]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: value || '',
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      if (draftKey && Date.now() - lastSavedRef.current > 5000) {
        saveDraft();
      }
    },
  });

  useEffect(() => {
    if (editor && value !== undefined) {
      const isSame = editor.getHTML() === value;
      if (!isSame) {
        editor.commands.setContent(value || '', false);
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor && draftKey) {
      loadDraft();
    }
  }, [editor, draftKey, loadDraft]);

  useEffect(() => {
    if (!draftKey || autoSaveInterval <= 0) return;
    const interval = setInterval(saveDraft, autoSaveInterval);
    return () => clearInterval(interval);
  }, [draftKey, autoSaveInterval, saveDraft]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        message.warning('请上传图片文件');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.warning('图片大小不能超过5MB');
        continue;
      }

      try {
        if (onImageUpload) {
          const url = await onImageUpload(file);
          editor?.chain().focus().setImage({ src: url }).run();
        } else {
          const reader = new FileReader();
          reader.onload = () => {
            editor?.chain().focus().setImage({ src: reader.result as string }).run();
          };
          reader.readAsDataURL(file);
        }
      } catch {
        message.error('图片上传失败');
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <Tooltip title={title}>
      <Button
        type="text"
        size="small"
        onClick={onClick}
        disabled={disabled}
        className={active ? '!bg-primary-50 !text-primary-500' : ''}
      >
        {children}
      </Button>
    </Tooltip>
  );

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {showToolbar && editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 bg-gray-50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="加粗"
          >
            <BoldOutlined />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="斜体"
          >
            <ItalicOutlined />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="删除线"
          >
            <StrikethroughOutlined />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="一级标题"
          >
            <span className="font-bold text-sm">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="二级标题"
          >
            <span className="font-bold text-sm">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="三级标题"
          >
            <span className="font-bold text-sm">H3</span>
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
            title="正文"
          >
            <BlockOutlined />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="无序列表"
          >
            <UnorderedListOutlined />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="有序列表"
          >
            <OrderedListOutlined />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => fileInputRef.current?.click()}
            title="插入图片"
          >
            <PictureOutlined />
          </ToolbarButton>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销"
          >
            <UndoOutlined />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <RedoOutlined />
          </ToolbarButton>

          <div className="flex-1" />

          {draftKey && (
            <Tooltip title="保存草稿">
              <Button
                type="text"
                size="small"
                onClick={() => {
                  saveDraft();
                  message.success('草稿已保存');
                }}
                className="!text-green-600"
              >
                <SaveOutlined />
                <span className="ml-1">保存草稿</span>
              </Button>
            </Tooltip>
          )}

          <Tooltip title="清空内容">
            <Button
              type="text"
              size="small"
              danger
              onClick={() => {
                editor.chain().focus().clearContent().run();
                if (draftKey) {
                  localStorage.removeItem(`draft_${draftKey}`);
                }
              }}
            >
              <ClearOutlined />
            </Button>
          </Tooltip>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />

      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="prose max-w-none"
      />
    </div>
  );
}
