/**
 * 電話番号の種別を分類するモジュール
 */
import type { ParsedPhoneNumberFull } from 'awesome-phonenumber';
import type { NumberType } from './types';

/**
 * awesome-phonenumber の番号種別を独自のNumberTypeにマッピングする
 * 日本固有のヒューリスティックも考慮する
 * 
 * @param phoneNumber - awesome-phonenumber のPhoneNumberオブジェクト
 * @returns NumberType
 */
export function classifyNumber(phoneNumber: ParsedPhoneNumberFull): NumberType {
  const nationalNumber = phoneNumber.number?.national?.replace(/\D/g, '') ?? '';
  
  // 日本固有のヒューリスティック（優先適用）
  if (nationalNumber.startsWith('050')) {
    return 'ip_phone';
  }
  if (nationalNumber.startsWith('0120') || nationalNumber.startsWith('0800')) {
    return 'toll_free';
  }
  if (
    nationalNumber.startsWith('070') ||
    nationalNumber.startsWith('080') ||
    nationalNumber.startsWith('090')
  ) {
    return 'mobile';
  }

  // awesome-phonenumber の型情報にマッピング
  const type = phoneNumber.type;
  switch (type) {
    case 'fixed-line':
    case 'fixed-line-or-mobile':
      return 'fixed';
    case 'mobile':
      return 'mobile';
    case 'voip':
      return 'ip_phone';
    case 'toll-free':
      return 'toll_free';
    case 'premium-rate':
      return 'premium';
    case 'pager':
      return 'pager';
    default:
      return 'unknown';
  }
}

/**
 * NumberType を日本語ラベルに変換する
 * 
 * @param type - NumberType
 * @returns 日本語ラベル
 */
export function getNumberTypeLabel(type: NumberType): string {
  const labels: Record<NumberType, string> = {
    fixed: '固定電話',
    mobile: '携帯電話',
    ip_phone: 'IP電話',
    toll_free: 'フリーダイヤル',
    premium: '有料通話',
    pager: 'ポケベル',
    unknown: '不明',
  };
  return labels[type];
}
