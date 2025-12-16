import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Export, Upload, Image, PencilSimple, Check, X } from '@phosphor-icons/react';
import { RadarChart } from '@/components/RadarChart';
import { DimensionEditor } from '@/components/DimensionEditor';
import { ProfileList } from '@/components/ProfileList';
import { RadarProfile, DEFAULT_DIMENSIONS } from '@/lib/types';
import { exportToCSV, downloadCSV, importFromCSV } from '@/lib/csv';
import { toast } from 'sonner';
import { toPng } from 'html-to-image';

function App() {
  const [profiles, setProfiles] = useLocalStorage<RadarProfile[]>('radar-profiles', []);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState<RadarProfile[]>([]);
  const [placeholderName, setPlaceholderName] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const profilesList = profiles || [];
  const selectedProfile = profilesList.find((p) => p.id === selectedProfileId);

  // 生成不重复的随机档案名
  const generateUniqueName = () => {
    const randomNames = [
      '李明 - 产品经理',
      '王芳 - UI设计师',
      '陈伟 - 数据分析师',
      '刘洋 - 运营专员',
      '张静 - 测试工程师',
      '赵强 - 架构师',
      '孙丽 - 项目经理',
      '周杰 - 算法工程师',
      '吴娜 - 市场专员',
      '郑磊 - 全栈工程师',
      '马超 - 技术总监',
      '朱琳 - 交互设计师',
      '黄勇 - DevOps工程师',
      '林雪 - 用户研究员',
      '何鹏 - 销售经理',
    ];

    const existingNames = new Set(profilesList.map((p) => p.name));
    
    // 先尝试从列表中找一个未使用的
    const availableName = randomNames.find((name) => !existingNames.has(name));
    if (availableName) {
      return availableName;
    }

    // 如果都用过了，随机选一个并添加数字后缀
    const baseName = randomNames[Math.floor(Math.random() * randomNames.length)];
    let counter = 2;
    let newName = `${baseName} (${counter})`;
    
    while (existingNames.has(newName)) {
      counter++;
      newName = `${baseName} (${counter})`;
    }
    
    return newName;
  };

  // 初始化示例数据
  useEffect(() => {
    if (profilesList.length === 0) {
      const now = Date.now();
      const sampleProfiles: RadarProfile[] = [
        {
          id: (now + 1).toString(),
          name: '张三 - 前端工程师',
          dimensions: [
            { name: '业务分析能力', value: 3 },
            { name: '工程能力', value: 4 },
            { name: '模型能力', value: 3 },
            { name: '学习能力', value: 4 },
            { name: '主动性', value: 5 },
            { name: '沟通能力', value: 4 },
          ],
          createdAt: now + 1,
          updatedAt: now + 1,
        },
        {
          id: (now + 2).toString(),
          name: '李四 - 后端工程师',
          dimensions: [
            { name: '业务分析能力', value: 4 },
            { name: '工程能力', value: 5 },
            { name: '模型能力', value: 4 },
            { name: '学习能力', value: 4 },
            { name: '主动性', value: 4 },
            { name: '沟通能力', value: 3 },
          ],
          createdAt: now + 2,
          updatedAt: now + 2,
        },
        {
          id: (now + 3).toString(),
          name: '王五 - 产品经理',
          dimensions: [
            { name: '业务分析能力', value: 5 },
            { name: '工程能力', value: 2 },
            { name: '模型能力', value: 3 },
            { name: '学习能力', value: 3 },
            { name: '主动性', value: 4 },
            { name: '沟通能力', value: 5 },
          ],
          createdAt: now + 3,
          updatedAt: now + 3,
        },
      ];
      setProfiles(sampleProfiles);
      setSelectedProfileId(sampleProfiles[0].id);
    } else if (profilesList.length > 0 && !selectedProfileId) {
      setSelectedProfileId(profilesList[0].id);
    }
  }, [profilesList.length, selectedProfileId]);

  // 键盘快捷键监听（Cmd+Z / Ctrl+Z）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在输入框中
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // Cmd+Z (Mac) 或 Ctrl+Z (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (deletedHistory.length > 0) {
          undoDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedHistory]);

  const createNewProfile = () => {
    const finalName = profileName.trim() || placeholderName;
    
    if (!finalName) {
      toast.error('请输入档案名称');
      return;
    }

    const newProfile: RadarProfile = {
      id: Date.now().toString(),
      name: finalName,
      dimensions: DEFAULT_DIMENSIONS.map((name) => ({
        name,
        value: 3,
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProfiles((current) => [...(current || []), newProfile]);
    setSelectedProfileId(newProfile.id);
    setProfileName('');
    setPlaceholderName('');
    setIsCreating(false);
    clearUndoHistory(); // 清空撤销历史
    toast.success('档案创建成功');
  };

  const updateCurrentProfile = (dimensions: RadarProfile['dimensions']) => {
    if (!selectedProfile) return;

    setProfiles((current) =>
      (current || []).map((p) =>
        p.id === selectedProfile.id
          ? { ...p, dimensions, updatedAt: Date.now() }
          : p
      )
    );
    clearUndoHistory(); // 清空撤销历史
  };

  const deleteProfile = (id: string) => {
    const deletedProfile = profilesList.find((p) => p.id === id);
    if (!deletedProfile) return;

    // 如果只剩一个档案且名字是「新档案」，不允许删除
    if (profilesList.length === 1 && deletedProfile.name === '新档案') {
      toast.error('这已经是最后一个档案了', {
        description: '请先创建其他档案，或修改此档案名称后再删除',
      });
      return;
    }

    const remaining = profilesList.filter((p) => p.id !== id);
    
    // 添加到删除历史（最多保留100个）
    setDeletedHistory((prev) => {
      const newHistory = [deletedProfile, ...prev];
      return newHistory.slice(0, 100);
    });

    // 如果删除后只剩 0 个档案，创建一个随机档案
    if (remaining.length === 0) {
      const now = Date.now();
      const randomProfile: RadarProfile = {
        id: now.toString(),
        name: '新档案',
        dimensions: DEFAULT_DIMENSIONS.map((name) => ({
          name,
          value: Math.floor(Math.random() * 3) + 2, // 随机值 2-4
        })),
        createdAt: now,
        updatedAt: now,
      };
      setProfiles([randomProfile]);
      setSelectedProfileId(randomProfile.id);
      toast.success(`已删除「${deletedProfile.name}」`, {
        description: '已自动创建新档案',
        action: {
          label: '撤销',
          onClick: () => undoDelete(deletedProfile),
        },
      });
    } else {
      setProfiles(remaining);
      if (selectedProfileId === id) {
        setSelectedProfileId(remaining[0].id);
      }
      toast.success(`已删除「${deletedProfile.name}」`, {
        description: '点击撤销可恢复，或按 Cmd/Ctrl+Z',
        action: {
          label: '撤销',
          onClick: () => undoDelete(deletedProfile),
        },
      });
    }
  };

  const undoDelete = (profile?: RadarProfile) => {
    const profileToRestore = profile || deletedHistory[0];
    if (!profileToRestore) {
      toast.error('没有可撤销的操作');
      return;
    }

    // 使用函数式更新来检查和添加档案
    setProfiles((current) => {
      const currentProfiles = current || [];
      
      // 检查是否已存在同ID的档案
      if (currentProfiles.some((p) => p.id === profileToRestore.id)) {
        toast.error('该档案已存在，无法恢复');
        return current;
      }

      toast.success(`已恢复「${profileToRestore.name}」`);
      return [...currentProfiles, profileToRestore];
    });

    setDeletedHistory((prev) => prev.filter((p) => p.id !== profileToRestore.id));
    setSelectedProfileId(profileToRestore.id);
  };

  const clearUndoHistory = () => {
    setDeletedHistory([]);
  };

  const duplicateProfile = (id: string) => {
    const profile = profilesList.find((p) => p.id === id);
    if (!profile) return;

    const newProfile: RadarProfile = {
      ...profile,
      id: Date.now().toString(),
      name: `${profile.name} (副本)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setProfiles((current) => [...(current || []), newProfile]);
    setSelectedProfileId(newProfile.id);
    clearUndoHistory(); // 清空撤销历史
    toast.success('档案已复制');
  };

  const renameProfile = (id: string, newName: string) => {
    setProfiles((current) =>
      (current || []).map((p) =>
        p.id === id
          ? { ...p, name: newName, updatedAt: Date.now() }
          : p
      )
    );
    clearUndoHistory(); // 清空撤销历史
    toast.success('档案名称已更新');
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setProfileName('');
    setPlaceholderName('');
  };

  const handleCopyChart = async () => {
    if (!chartRef.current) {
      toast.error('图表未加载');
      return;
    }

    try {
      // 获取SVG元素的实际尺寸
      const svg = chartRef.current.querySelector('svg');
      if (!svg) {
        toast.error('未找到图表');
        return;
      }

      const dataUrl = await toPng(chartRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: 'white',
        width: 500,
        height: 500,
        style: {
          margin: '0',
          padding: '0',
        },
      });

      // 将base64转换为blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);

      toast.success('图片已复制到剪贴板');
    } catch (error) {
      console.error('复制图片失败:', error);
      toast.error('复制图片失败，请重试');
    }
  };

  const handleExport = () => {
    if (profilesList.length === 0) {
      toast.error('没有可导出的档案');
      return;
    }

    const csvContent = exportToCSV(profilesList);
    downloadCSV(csvContent);
    toast.success(`已导出 ${profilesList.length} 个档案`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { profiles: importedProfiles, error } = importFromCSV(content);

      if (error) {
        toast.error(error);
        return;
      }

      if (importedProfiles.length === 0) {
        toast.error('没有找到有效的数据');
        return;
      }

      // 更新现有档案的维度名称
      const newDimensionNames = importedProfiles[0].dimensions.map(d => d.name);
      
      setProfiles((current) => {
        const updated = (current || []).map(profile => ({
          ...profile,
          dimensions: profile.dimensions.map((dim, idx) => ({
            ...dim,
            name: newDimensionNames[idx] || dim.name,
          })),
        }));
        return [...updated, ...importedProfiles];
      });
      
      toast.success(`成功导入 ${importedProfiles.length} 个档案，并更新了维度名称`);
    };

    reader.onerror = () => {
      toast.error('文件读取失败');
    };

    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetAll = () => {
    setProfiles([]);
    setSelectedProfileId(null);
    setDeletedHistory([]);
    setShowResetDialog(false);
    toast.success('已重置所有数据');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-background to-cyan-50/30">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            六边形雷达图
          </h1>
          <p className="text-muted-foreground">
            可视化多维能力评估工具
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Button onClick={handleExport} variant="outline" size="sm">
              <Export size={16} />
              <span className="ml-2">导出 CSV</span>
            </Button>
            <Button onClick={handleImportClick} variant="outline" size="sm">
              <Upload size={16} />
              <span className="ml-2">导入 CSV</span>
            </Button>
            <Button 
              onClick={() => setShowResetDialog(true)} 
              variant="outline" 
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              <span>全部重置</span>
            </Button>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">CSV 格式示例：</p>
            <div className="inline-block overflow-hidden rounded border">
              <table className="text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-3 py-1.5 border-r font-medium text-left">档案名称</th>
                    <th className="px-3 py-1.5 border-r font-medium text-left">业务分析能力</th>
                    <th className="px-3 py-1.5 border-r font-medium text-left">工程能力</th>
                    <th className="px-3 py-1.5 border-r font-medium text-left">模型能力</th>
                    <th className="px-3 py-1.5 border-r font-medium text-left">学习能力</th>
                    <th className="px-3 py-1.5 border-r font-medium text-left">主动性</th>
                    <th className="px-3 py-1.5 font-medium text-left">沟通能力</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-background">
                    <td className="px-3 py-1.5 border-r border-t">张三 - 前端工程师</td>
                    <td className="px-3 py-1.5 border-r border-t text-center">3</td>
                    <td className="px-3 py-1.5 border-r border-t text-center">4</td>
                    <td className="px-3 py-1.5 border-r border-t text-center">3</td>
                    <td className="px-3 py-1.5 border-r border-t text-center">4</td>
                    <td className="px-3 py-1.5 border-r border-t text-center">5</td>
                    <td className="px-3 py-1.5 border-t text-center">4</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              注：创建时间和更新时间为可选列，导入时可以省略
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">档案管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCreating ? (
                  <div className="space-y-3">
                    <Input
                      placeholder={placeholderName}
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') createNewProfile();
                        if (e.key === 'Escape') cancelCreating();
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button onClick={createNewProfile} className="flex-1">
                        确认创建
                      </Button>
                      <Button onClick={cancelCreating} variant="outline" className="flex-1">
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => {
                    setIsCreating(true);
                    setPlaceholderName(generateUniqueName());
                  }} className="w-full">
                    <Plus size={18} weight="bold" />
                    <span className="ml-2">新建档案</span>
                  </Button>
                )}

                <Separator />

                <ProfileList
                  profiles={profilesList}
                  selectedProfileId={selectedProfileId}
                  onSelectProfile={setSelectedProfileId}
                  onDeleteProfile={deleteProfile}
                  onDuplicateProfile={duplicateProfile}
                  onRenameProfile={renameProfile}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedProfile ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingTitle.trim()) {
                                  renameProfile(selectedProfile.id, editingTitle.trim());
                                  setIsEditingTitle(false);
                                }
                              }
                              if (e.key === 'Escape') {
                                setIsEditingTitle(false);
                                setEditingTitle('');
                              }
                            }}
                            className="text-xl font-semibold"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (editingTitle.trim()) {
                                renameProfile(selectedProfile.id, editingTitle.trim());
                                setIsEditingTitle(false);
                              }
                            }}
                          >
                            <Check size={18} className="text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingTitle(false);
                              setEditingTitle('');
                            }}
                          >
                            <X size={18} className="text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <CardTitle className="text-xl">{selectedProfile.name}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setIsEditingTitle(true);
                              setEditingTitle(selectedProfile.name);
                            }}
                          >
                            <PencilSimple size={16} />
                          </Button>
                        </div>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCopyChart}
                              disabled={!selectedProfile}
                            >
                              <Image size={16} />
                              <span className="ml-2">复制雷达图</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>复制雷达图到剪贴板</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div ref={chartRef}>
                      <RadarChart dimensions={selectedProfile.dimensions} size={500} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">维度设置</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DimensionEditor
                      dimensions={selectedProfile.dimensions}
                      onDimensionsChange={updateCurrentProfile}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-6xl opacity-20">📊</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">欢迎使用六边形雷达图</h3>
                    <p className="text-muted-foreground">
                      点击左侧"新建档案"开始创建您的第一个能力评估档案
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置所有数据？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除所有档案和维度设置，且不可恢复。请确认您要继续。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll} className="bg-destructive hover:bg-destructive/90">
              确认重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default App;
