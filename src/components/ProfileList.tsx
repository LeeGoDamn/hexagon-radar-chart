import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Trash, Copy, PencilSimple, Check, X } from '@phosphor-icons/react';
import { RadarProfile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface ProfileListProps {
  profiles: RadarProfile[];
  selectedProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onDeleteProfile: (id: string) => void;
  onDuplicateProfile: (id: string) => void;
  onRenameProfile: (id: string, newName: string) => void;
}

export function ProfileList({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onDeleteProfile,
  onDuplicateProfile,
  onRenameProfile,
}: ProfileListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getAverageValue = (profile: RadarProfile) => {
    const sum = profile.dimensions.reduce((acc, dim) => acc + dim.value, 0);
    return (sum / profile.dimensions.length).toFixed(1);
  };

  const startEditing = (profile: RadarProfile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(profile.id);
    setEditingName(profile.name);
  };

  const confirmEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingName.trim()) {
      onRenameProfile(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  if (profiles.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">暂无数据</p>
        <p className="text-sm text-muted-foreground mt-2">点击下方按钮创建第一个档案</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)] pr-4">
      <div className="space-y-3 pr-2">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedProfileId === profile.id
                ? 'ring-2 ring-primary bg-accent/5'
                : ''
            }`}
            onClick={() => onSelectProfile(profile.id)}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {editingId === profile.id ? (
                    <div className="flex gap-1 items-center mb-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') confirmEdit(profile.id, e as any);
                          if (e.key === 'Escape') cancelEdit(e as any);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-7 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={(e) => confirmEdit(profile.id, e)}
                      >
                        <Check size={14} className="text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={(e) => cancelEdit(e)}
                      >
                        <X size={14} className="text-red-600" />
                      </Button>
                    </div>
                  ) : (
                    <h3 className="font-semibold text-base truncate">{profile.name}</h3>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(profile.updatedAt)}
                  </p>
                </div>
                <Badge variant="secondary" className="mono shrink-0">
                  {getAverageValue(profile)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-1 text-xs">
                {profile.dimensions.slice(0, 6).map((dim, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted/50 rounded px-2 py-1"
                  >
                    <span className="truncate text-[10px]">{dim.name}</span>
                    <span className="mono ml-1">{dim.value}</span>
                  </div>
                ))}
              </div>

              {editingId === profile.id ? null : (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8"
                    onClick={(e) => startEditing(profile, e)}
                  >
                    <PencilSimple size={14} />
                    <span className="ml-1">编辑</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateProfile(profile.id);
                    }}
                  >
                    <Copy size={14} />
                    <span className="ml-1">复制</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProfile(profile.id);
                    }}
                  >
                    <Trash size={14} />
                    <span className="ml-1">删除</span>
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
