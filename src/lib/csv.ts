import { RadarProfile } from './types';

export function exportToCSV(profiles: RadarProfile[]): string {
  if (profiles.length === 0) {
    return '';
  }

  const dimensionNames = profiles[0].dimensions.map(d => d.name);
  const headers = ['档案名称', ...dimensionNames, '创建时间', '更新时间'].join(',');
  
  const rows = profiles.map(profile => {
    const dimensionValues = profile.dimensions.map(d => d.value.toString());
    const createdAt = new Date(profile.createdAt).toISOString();
    const updatedAt = new Date(profile.updatedAt).toISOString();
    
    return [
      `"${profile.name.replace(/"/g, '""')}"`,
      ...dimensionValues,
      createdAt,
      updatedAt
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string = '六边形雷达图数据.csv'): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function importFromCSV(csvContent: string): { profiles: RadarProfile[], error?: string } {
  try {
    const lines = csvContent.trim().split('\n');
    
    if (lines.length < 2) {
      return { profiles: [], error: 'CSV 文件为空或格式不正确' };
    }

    const headers = parseCSVLine(lines[0]);
    
    if (headers.length < 3 || headers[0] !== '档案名称') {
      return { profiles: [], error: 'CSV 文件格式不正确，缺少必要的列' };
    }

    const dimensionNames = headers.slice(1, -2);
    
    if (dimensionNames.length === 0) {
      return { profiles: [], error: 'CSV 文件中没有维度数据' };
    }

    const profiles: RadarProfile[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        return { profiles: [], error: `第 ${i + 1} 行数据列数不匹配` };
      }

      const name = values[0];
      const dimensionValues = values.slice(1, -2).map(v => {
        const num = parseInt(v);
        if (isNaN(num) || num < 1 || num > 5) {
          throw new Error(`第 ${i + 1} 行包含无效的维度值: ${v}`);
        }
        return num;
      });

      const dimensions = dimensionNames.map((name, idx) => ({
        name,
        value: dimensionValues[idx]
      }));

      profiles.push({
        id: Date.now().toString() + '-' + i,
        name,
        dimensions,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    if (profiles.length === 0) {
      return { profiles: [], error: 'CSV 文件中没有有效的数据行' };
    }

    return { profiles };
  } catch (error) {
    return { 
      profiles: [], 
      error: error instanceof Error ? error.message : '导入失败：未知错误' 
    };
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}
