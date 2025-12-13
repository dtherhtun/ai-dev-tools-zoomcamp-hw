import { ChevronDown, FileCode2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'go', label: 'Go', icon: '🔵' },
];

const LanguageSelector = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-44 bg-secondary/80 border-panel-border hover:bg-secondary transition-colors">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Select language" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-card border-panel-border">
        {languages.map((lang) => (
          <SelectItem
            key={lang.value}
            value={lang.value}
            className="focus:bg-secondary/80 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span>{lang.icon}</span>
              <span>{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
