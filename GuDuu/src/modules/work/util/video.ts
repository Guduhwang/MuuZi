// todo 这个接口以后应该去掉，由接口返回
export interface TVideoContent {
  path: string;
  type?: string;
  thumbnail?: string;
}

// Function to generate video thumbnail from the first frame
export function generateVideoThumbnail(path: string): Promise<string> {
  return new Promise((resolve) => {
    if (path) {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous'; // Enable CORS for the video element
      video.src = path;

      // When video metadata is loaded, seek to the first frame
      video.onloadedmetadata = () => {
        // Set current time to 0.1 seconds to ensure we get a frame
        video.currentTime = 0.1;
      };

      // When the frame is available, capture it
      video.onseeked = () => {
        // Create canvas and draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to data URL
          const dataUrl = canvas.toDataURL('image/jpeg');

          // Set the thumbnail
          resolve(dataUrl);
        }

        // Clean up
        video.remove();
      };

      // Handle errors
      video.onerror = () => {
        console.error('Error loading video for thumbnail generation');
      };

      // Load the video
      video.load();
    }
    resolve('');
  });
}

/**
 * 从本地视频文件获取第一帧图片
 * @param videoFile 本地视频文件对象
 * @param quality 可选，图片质量 0-1之间，默认0.8
 * @returns Promise，解析为图片的dataURL
 */
export function getFirstFrameFromLocalVideo(videoFile: File, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // 检查是否为视频文件
    if (!videoFile.type.startsWith('video/')) {
      reject(new Error('提供的文件不是视频文件'));
      return;
    }

    // 创建文件的临时URL
    const videoUrl = URL.createObjectURL(videoFile);

    // 创建视频元素
    const video = document.createElement('video');

    // 视频元素加载完成事件
    video.onloadedmetadata = () => {
      // 设置当前时间为0.1秒，以确保获取到第一帧
      video.currentTime = 0.1;
    };

    // 当seeking完成（当前帧可用）时
    video.onseeked = () => {
      // 创建canvas
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 获取上下文并绘制当前视频帧
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('无法创建canvas上下文'));
        return;
      }

      // 绘制视频帧到canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 将canvas内容转换为dataURL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      // 清理
      video.remove();
      URL.revokeObjectURL(videoUrl);

      // 返回结果
      resolve(dataUrl);
    };

    // 处理错误
    video.onerror = () => {
      URL.revokeObjectURL(videoUrl);
      reject(new Error('视频加载失败'));
    };

    // 设置视频源并加载
    video.src = videoUrl;
    video.load();
  });
}
