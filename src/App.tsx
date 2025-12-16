import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Export, Upload } from '@phosphor-icons/react';
import { RadarChart } from '@/components/RadarChart';
import { DimensionEditor } from '@/components/DimensionEditor';
import { ProfileList } from '@/components/ProfileList';
import { RadarProfile, DEFAULT_DIMENSIONS } from '@/lib/types';
import { exportToCSV, downloadCSV, importFromCSV } from '@/lib/csv';
import { toast } from 'sonner';

function App() {
  const [profiles, setProfiles] = useLocalStorage<RadarProfile[]>('radar-profiles', []);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profilesList = profiles || [];
  const selectedProfile = profilesList.find((p) => p.id === selectedProfileId);

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

  const createNewProfile = () => {
    if (!profileName.trim()) {
      toast.error('请输入档案名称');
      return;
    }

    const newProfile: RadarProfile = {
      id: Date.now().toString(),
      name: profileName.trim(),
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
    setIsCreating(false);
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
  };

  const deleteProfile = (id: string) => {
    const remaining = profilesList.filter((p) => p.id !== id);
    
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
      toast.success('档案已删除，已自动创建新档案');
    } else {
      setProfiles(remaining);
      if (selectedProfileId === id) {
        setSelectedProfileId(remaining[0].id);
      }
      toast.success('档案已删除');
    }
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
    toast.success('档案已复制');
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setProfileName('');
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

      setProfiles((current) => [...(current || []), ...importedProfiles]);
      toast.success(`成功导入 ${importedProfiles.length} 个档案`);
    };

    reader.onerror = () => {
      toast.error('文件读取失败');
    };

    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                      placeholder="输入档案名称"
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
                  <Button onClick={() => setIsCreating(true)} className="w-full">
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
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedProfile ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{selectedProfile.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadarChart dimensions={selectedProfile.dimensions} size={500} />
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
    </div>
  );
}

export default App;
