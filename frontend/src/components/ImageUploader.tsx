import { useRef, useState, useCallback, useEffect } from 'react';
import Uppy from '@uppy/core';
import { DragDrop, Dashboard } from '@uppy/react';
import XHRUpload from '@uppy/xhr-upload';
import '@uppy/core/dist/style.min.css';
import '@uppy/drag-drop/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { Button, Upload, Image, message, Empty, Tooltip, Popconfirm, Modal } from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  PictureOutlined,
} from '@ant-design/icons';

export interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  thumbnailUrl?: string;
  uploadedAt: number;
}

interface ImageUploaderProps {
  value?: UploadedImage[];
  onChange?: (files: UploadedImage[]) => void;
  uploadUrl?: string;
  maxFiles?: number;
  maxFileSize?: number;
  accept?: string[];
  multiple?: boolean;
  mode?: 'drag-drop' | 'dashboard' | 'antd';
  listType?: 'picture-card' | 'text' | 'picture';
  showPreview?: boolean;
  onUploadSuccess?: (file: UploadedImage, response: any) => void;
  onUploadError?: (file: any, error: any) => void;
  token?: string;
}

export default function ImageUploader({
  value = [],
  onChange,
  uploadUrl = '/api/upload/images',
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024,
  accept = ['image/*'],
  multiple = true,
  mode = 'drag-drop',
  listType = 'picture-card',
  showPreview = true,
  onUploadSuccess,
  onUploadError,
  token,
}: ImageUploaderProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const dashboardOpen = useRef(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const uppy = useRef<Uppy | null>(null);

  useEffect(() => {
    uppy.current = new Uppy({
      restrictions: {
        maxFileSize,
        maxNumberOfFiles: maxFiles - value.length,
        allowedFileTypes: accept,
      },
      autoProceed: true,
      onBeforeFileAdded: (currentFile, files) => {
        const duplicate = Object.values(files).some(
          (f) => f.name === currentFile.name && f.size === currentFile.size
        );
        if (duplicate) {
          message.warning(`文件 ${currentFile.name} 已经添加过了`);
          return false;
        }
        return true;
      },
    });

    uppy.current.use(XHRUpload, {
      endpoint: uploadUrl,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      formData: true,
      fieldName: 'file',
      bundle: false,
    });

    uppy.current.on('upload-success', (file, response) => {
      if (!file) return;
      const uploaded: UploadedImage = {
        id: String(file.id),
        url: (response as any)?.body?.url || URL.createObjectURL(file.data as Blob),
        name: file.name || 'unknown',
        size: file.size || 0,
        type: file.type || 'image/*',
        thumbnailUrl: (response as any)?.body?.thumbnailUrl,
        uploadedAt: Date.now(),
      };
      const newValue = [...value, uploaded];
      onChange?.(newValue);
      onUploadSuccess?.(uploaded, (response as any)?.body);
      message.success(`${file.name} 上传成功`);
    });

    uppy.current.on('upload-error', (file, error) => {
      if (!file) return;
      message.error(`${file.name} 上传失败`);
      onUploadError?.(file, error);
    });

    return () => {
      uppy.current?.close();
    };
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      const newValue = value.filter((f) => f.id !== id);
      onChange?.(newValue);
      uppy.current?.removeFile(id);
    },
    [value, onChange]
  );

  const handlePreview = (url: string) => {
    setPreviewImage(url);
    setPreviewOpen(true);
  };

  const handleAntdUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      const uploaded: UploadedImage = {
        id: `${file.uid}`,
        url: result.url || URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        thumbnailUrl: result.thumbnailUrl,
        uploadedAt: Date.now(),
      };
      onChange?.([...value, uploaded]);
      onSuccess(result, file);
      onUploadSuccess?.(uploaded, result);
    } catch (error) {
      onError(error as Error);
      onUploadError?.(file, error);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const renderUploadedImages = () => {
    if (value.length === 0 && mode !== 'antd') {
      return (
        <Empty
          description="暂无图片"
          image={<PictureOutlined className="text-6xl text-gray-300" />}
          className="py-12"
        />
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
        {value.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
          >
            <img
              src={img.thumbnailUrl || img.url}
              alt={img.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {showPreview && (
                <Tooltip title="预览">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    className="!bg-white/90 !h-7 !w-7 !p-0"
                    onClick={() => handlePreview(img.url)}
                  />
                </Tooltip>
              )}
              <Tooltip title="删除">
                <Popconfirm
                  title="确定删除这张图片吗？"
                  onConfirm={() => handleRemove(img.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    className="!bg-white/90 !h-7 !w-7 !p-0"
                  />
                </Popconfirm>
              </Tooltip>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-white text-xs truncate">{img.name}</div>
              <div className="text-white/70 text-xs mt-0.5">{formatSize(img.size)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderUploadArea = () => {
    switch (mode) {
      case 'dashboard':
        return (
          <div>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => {
                setIsDashboardOpen(true);
                dashboardOpen.current = true;
              }}
              disabled={value.length >= maxFiles}
            >
              打开上传面板
            </Button>
            {isDashboardOpen && uppy.current && (
              <Modal
                open={isDashboardOpen}
                onCancel={() => {
                  setIsDashboardOpen(false);
                  dashboardOpen.current = false;
                }}
                footer={null}
                width={900}
                title="上传图片"
                destroyOnClose
              >
                {/* @ts-ignore */}
                <Dashboard
                  uppy={uppy.current}
                  plugins={['XHRUpload']}
                  inline
                  theme="light"
                  proudlyDisplayPoweredByUppy={false}
                  style={{ width: '100%', height: 480 }}
                />
              </Modal>
            )}
          </div>
        );

      case 'antd':
        return (
          <Upload
            name="file"
            listType={listType}
            multiple={multiple}
            accept={accept.join(',')}
            customRequest={handleAntdUpload}
            maxCount={maxFiles - value.length}
            onPreview={(file) => handlePreview(file.url || '')}
            showUploadList={listType !== 'picture-card'}
            beforeUpload={(file) => {
              const isImage = accept.some((a) => file.type.match(a.replace('/*', '/')) || a === 'image/*');
              if (!isImage) {
                message.error('只能上传图片文件!');
                return Upload.LIST_IGNORE;
              }
              const isLtMaxSize = file.size < maxFileSize;
              if (!isLtMaxSize) {
                message.error(`图片大小不能超过 ${formatSize(maxFileSize)}!`);
                return Upload.LIST_IGNORE;
              }
              return true;
            }}
          >
            {listType === 'picture-card' ? (
              value.length >= maxFiles ? null : (
                <div className="p-4">
                  <UploadOutlined className="text-xl" />
                  <div className="mt-2 text-xs text-gray-500">上传图片</div>
                </div>
              )
            ) : (
              <Button icon={<UploadOutlined />}>点击上传</Button>
            )}
          </Upload>
        );

      case 'drag-drop':
      default:
        return (
          <>
            {uppy.current && (
              <div className={value.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}>
                <DragDrop
                  uppy={uppy.current}
                  locale={{
                    strings: {
                      dropHereOr: '拖拽图片到这里或%{browse}',
                      browse: '点击选择',
                    },
                  }}
                />
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 text-center">
              支持 {accept.join('、')} 格式，单张不超过 {formatSize(maxFileSize)}，最多 {maxFiles} 张
            </p>
          </>
        );
    }
  };

  return (
    <div>
      {renderUploadArea()}
      {renderUploadedImages()}

      {previewOpen && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
            src: previewImage,
          }}
          src={previewImage}
        />
      )}
    </div>
  );
}
