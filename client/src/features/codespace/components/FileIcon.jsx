import { FileCode2, FileJson, FileText } from 'lucide-react';

const ICONS = { js: FileCode2, json: FileJson };

export default function FileIcon({ path, className = 'size-3.5' }) {
  const Icon = ICONS[path.split('.').pop()] ?? FileText;
  return <Icon className={`shrink-0 ${className}`} aria-hidden />;
}
