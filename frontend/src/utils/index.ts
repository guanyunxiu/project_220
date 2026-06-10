import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export { dayjs };

export const formatDate = (
  date: Date | string | number | undefined,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatRelativeTime = (
  date: Date | string | number | undefined
): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿';
  if (num >= 10000) return (num / 10000).toFixed(1) + '万';
  return num.toLocaleString();
};

export const formatMoney = (
  amount: number | undefined,
  currency: string = '¥'
): string => {
  if (amount === undefined || amount === null) return `${currency}0.00`;
  return `${currency}${Number(amount).toFixed(2)}`;
};

export const truncateText = (
  text: string | undefined,
  maxLength: number,
  suffix: string = '...'
): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastTime = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn(...args);
    }
  };
};

export const downloadFile = (url: string, filename?: string): void => {
  const link = document.createElement('a');
  link.href = url;
  if (filename) link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getFileExtension = (filename: string): string => {
  const index = filename.lastIndexOf('.');
  return index > 0 ? filename.slice(index + 1).toLowerCase() : '';
};

export const formatFileSize = (bytes: number | undefined): string => {
  if (bytes === undefined || bytes === null) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

export const getInitials = (name: string | undefined): string => {
  if (!name) return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  const first = trimmed[0];
  if (/[\u4e00-\u9fa5]/.test(first)) {
    return first;
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return first.toUpperCase();
};

export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
};

export const isVideoFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['mp4', 'webm', 'avi', 'mov', 'mkv'].includes(ext);
};

export const isAudioFile = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ['mp3', 'wav', 'ogg', 'flac', 'aac'].includes(ext);
};
