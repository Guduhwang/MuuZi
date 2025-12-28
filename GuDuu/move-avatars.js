import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 源文件夹和目标文件夹路径
const sourceDir = path.join(__dirname, 'src/modules/work/workbench/static/avatar');
const targetDir = path.join(__dirname, 'public/avatars');

// 创建目标文件夹
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('创建文件夹:', targetDir);
}

// 复制文件函数
function copyAvatarFiles() {
  try {
    // 读取源文件夹中的所有文件
    const files = fs.readdirSync(sourceDir);

    // 过滤出 .png 文件
    const pngFiles = files.filter((file) => file.toLowerCase().endsWith('.png'));

    console.log(`找到 ${pngFiles.length} 个 PNG 文件`);

    // 复制文件
    pngFiles.forEach((fileName) => {
      const sourcePath = path.join(sourceDir, fileName);
      const targetPath = path.join(targetDir, fileName);

      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`复制: ${fileName}`);
      } catch (error) {
        console.error(`复制失败 ${fileName}:`, error.message);
      }
    });

    console.log('复制完成！');
    console.log(`文件已复制到: ${targetDir}`);
  } catch (error) {
    console.error('复制过程中出现错误:', error.message);
  }
}

// 执行复制
copyAvatarFiles();
