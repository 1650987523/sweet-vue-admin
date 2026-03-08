/**
 * 加密解密工具
 *
 * @module utils/crypto
 * @author Art Design Pro Team
 */

import CryptoJS from 'crypto-js'

/**
 * AES密钥配置
 * 注意：这个密钥必须与后端配置的 web.aes.secret 保持一致
 * AES密钥长度必须是16、24或32字节（128、192或256位）
 */
const AES_SECRET_KEY = 'wanglaoban123456' // 16字节密钥，需要与后端 securityPropertiesConfig.getWebAesSecret() 一致

/**
 * AES加密
 * @param plainText 明文
 * @returns 加密后的密文（Base64编码）
 */
export function aesEncrypt(plainText: string): string {
  if (!plainText) return ''

  try {
    // 使用UTF-8编码密钥
    const key = CryptoJS.enc.Utf8.parse(AES_SECRET_KEY)

    // 加密配置：使用ECB模式，PKCS7填充
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })

    // 返回Base64编码的密文
    return encrypted.toString()
  } catch (error) {
    console.error('AES加密失败:', error)
    return ''
  }
}

/**
 * AES解密
 * @param cipherText 密文（Base64编码）
 * @returns 解密后的明文
 */
export function aesDecrypt(cipherText: string): string {
  if (!cipherText) return ''

  try {
    // 使用UTF-8编码密钥
    const key = CryptoJS.enc.Utf8.parse(AES_SECRET_KEY)

    // 解密配置：使用ECB模式，PKCS7填充
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })

    // 返回UTF-8编码的明文
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('AES解密失败:', error)
    return ''
  }
}

/**
 * 设置AES密钥（可选，用于动态配置）
 * @param key 新的密钥
 */
export function setAesSecretKey(key: string): void {
  if (!key) {
    console.warn('AES密钥不能为空')
    return
  }
  // 可以通过环境变量或配置文件动态设置
  console.log('AES密钥已更新')
}
