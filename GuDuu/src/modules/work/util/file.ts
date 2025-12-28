export function downloadFileFromUrl(url: string, filename: string) {
  /**
   *  @description 接受url，下载文件
   *  */
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.setAttribute('download', decodeURIComponent(filename));
  document.body.appendChild(link);
  link.click();
  // 释放URL 对象
  window.URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
}

export function downloadFileFromBlob(data: Blob, disposition: string, extension: string) {
  /**
   *  @description 接受二进制文件，下载文件
   *  */
  let filename;
  if (disposition) {
    const dispositionAy = disposition.split(';');
    filename = dispositionAy.find((name: string) => /^filename=/i.test(name));
    if (filename) {
      filename = filename?.replace(/filename=/i, '');
    } else {
      filename = disposition;
    }
  }
  if (!filename) {
    filename = `file${new Date().getTime()}`;
  }
  if (extension && !filename.split('.')[1]) {
    filename += `.${extension}`;
  }
  const url = window.URL.createObjectURL(new Blob([data]));
  downloadFileFromUrl(url, filename);
}

export function base64ToFile(base64: string, fileName: string, mimeType: string) {
  /**
   * base64转成文件下载
   */
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // 转成 Blob
  const blob = new Blob([byteArray], { type: mimeType });

  // 触发下载
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
