// 使用 require 的 TypeScript 语法
import hmacsha1 from 'hmacsha1';
import randomString from 'string-random';

// 签名结果接口
export interface SignatureResult {
  signature: string;
  timestamp: number;
  signatureNonce: string;
}

// 生成签名
const urlSignature = (url: string, secretKey: string): SignatureResult | undefined => {
  if (!url) return;

  const timestamp = Date.now(); // 当前时间戳
  const signatureNonce = randomString(16); // 随机字符串，你可以任意设置，这个没有要求

  // 原文 = URl地址 + "&" + 毫秒时间戳 + "&" + 随机字符串
  const str = `${url}&${timestamp}&${signatureNonce}`;
  const hash = hmacsha1(secretKey, str);

  // 最后一步： encodeBase64URLSafeString(密文)
  // 这一步很重要，生成安全字符串。java、Python 以外的语言，可以参考这个 JS 的处理
  const signature = hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return {
    signature,
    timestamp,
    signatureNonce,
  };
};

// 例子：原本查询生图进度接口是 https://openapi.liblibai.cloud/api/generate/webui/status
// 加密后，url 就变更为 https://openapi.liblibai.cloud/api/generate/webui/status?AccessKey={YOUR_ACCESS_KEY}&Signature={签名}&Timestamp={时间戳}&SignatureNonce={随机字符串}
// const getUrl = (): string => {
//   const url = '/api/generate/webui/status';
//   const { signature, timestamp, signatureNonce } = urlSignature(url);
//   const accessKey = '替换自己的 AccessKey'; // '下单后在官网中，找到自己的 AccessKey'
//   return `${url}?AccessKey=${accessKey}&Signature=${signature}&Timestamp=${timestamp}&SignatureNonce=${signatureNonce}`;
// };

export { urlSignature };
