'use strict';

import parse, { HTMLElement } from "node-html-parser";
import JSZip from 'jszip';

export interface SubtitleInfo {
  fileName?: string;
  language?: string;
};

export interface SubtitleFetchOptions {
  language?: LanguageID;
}

export type LanguageID =
  'an' | // Aragonese
  'ar' | // Arabic
  'at' | // Asturian (non standard?)
  'bg' | // Bulgarian
  'br' | // Breton
  'ca' | // Catalan
  'cs' | // Czech
  'da' | // Danish
  'de' | // German
  'el' | // Greek
  'en' | // English
  'eo' | // Esperanto
  'es' | // Spanish
  'et' | // Estonian
  'eu' | // Basque
  'fa' | // Persian
  'fi' | // Finnish
  'fr' | // French
  'gl' | // Galician
  'he' | // Hebrew
  'hi' | // Hindi
  'hr' | // Croatian
  'hu' | // Hungarian
  'hy' | // Armenian
  'id' | // Indonesian
  'is' | // Icelandic
  'it' | // Italian
  'ja' | // Japanese
  'ka' | // Georgian
  'km' | // Khmer
  'ko' | // Korean
  'mk' | // Macedonian
  'ms' | // Malay
  'nl' | // Dutch
  'no' | // Norwegian
  'oc' | // Occitan
  'pt-br' | // Portuguese, Brazilian
  'pl' | // Polish
  'pt' | // Portuguese
  'ro' | // Romanian
  'ru' | // Russian
  'si' | // Sinhala
  'sk' | // Slovak
  'sl' | // Slovenian
  'sq' | // Albanian
  'sr' | // Serbian
  'sv' | // Swedish
  'th' | // Thai
  'tl' | // Tagalog
  'tr' | // Turkish
  'tt' | // Tatar
  'uk' | // Ukrainian
  'uz' | // Uzbek
  'vi' | // Vietnamese
  'zh' | // Chinese
  'zh-tw' // Chinese Traditional
;

export const LanguageNameMap: Record<LanguageID, string> = {
  'an': 'Aragonese',
  'ar': 'Arabic',
  'at': 'Asturian',
  'bg': 'Bulgarian',
  'br': 'Breton',
  'ca': 'Catalan',
  'cs': 'Czech',
  'da': 'Danish',
  'de': 'German',
  'el': 'Greek',
  'en': 'English',
  'eo': 'Esperanto',
  'es': 'Spanish',
  'et': 'Estonian',
  'eu': 'Basque',
  'fa': 'Persian',
  'fi': 'Finnish',
  'fr': 'French',
  'gl': 'Galician',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'hr': 'Croatian',
  'hu': 'Hungarian',
  'hy': 'Armenian',
  'id': 'Indonesian',
  'is': 'Icelandic',
  'it': 'Italian',
  'ja': 'Japanese',
  'ka': 'Georgian',
  'km': 'Khmer',
  'ko': 'Korean',
  'mk': 'Macedonian',
  'ms': 'Malay',
  'nl': 'Dutch',
  'no': 'Norwegian',
  'oc': 'Occitan',
  'pt-br': 'Brazilian Portuguese',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ro': 'Romanian',
  'ru': 'Russian',
  'si': 'Sinhala',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'sq': 'Albanian',
  'sr': 'Serbian',
  'sv': 'Swedish',
  'th': 'Thai',
  'tl': 'Tagalog',
  'tr': 'Turkish',
  'tt': 'Tatar',
  'uk': 'Ukrainian',
  'uz': 'Uzbek',
  'vi': 'Vietnamese',
  'zh': 'Chinese',
  'zh-tw': 'Traditional Chinese',
}

interface FetchResponse {
  body: string,
  bodyUsed: true,
  headers: Headers;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  url: string;
}

export async function fetchResponse(input: RequestInfo | URL, init?: RequestInit): Promise<FetchResponse> {
  const response = await fetch(input, init);
  return {
    headers: response.headers,
    ok: response.ok,
    redirected: response.redirected,
    status: response.status,
    statusText: response.statusText,
    url: response.url,
    body: await response.text(),
    bodyUsed: true,
  };
}

export async function fetchHtml(input: RequestInfo | URL, init?: RequestInit, errorOnBadResponse: boolean = true): Promise<HTMLElement> {
  const response = await fetch(input, init);
  if (!response.ok && errorOnBadResponse) throw new Error(`HTTP Error! status: ${response.status}\nBody: ${await response.text()}`);
  const dom = parse(await response.text());
  return dom;
}

export class DownloadedFile {
  constructor(public data: string, public filename?: string) {}

  static async download(url: string, filename?: string): Promise<DownloadedFile> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition && !filename) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+?)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    let data: string;
    if (filename?.endsWith('.zip')) {
      return new DownloadedFile(await this.unpackzip(await response.arrayBuffer()), filename);
    } else {
      data = await response.text();
    }

    return new DownloadedFile(data, filename!);
  }

  private static async unpackzip(data: ArrayBuffer): Promise<string> {
    const zip = await JSZip.loadAsync(data);

    for (const relativePath in zip.files) {
      if (zip.files[relativePath].dir) continue; // Skip directories
      if (relativePath.endsWith('.srt')) return await zip.files[relativePath].async('text');
    }

    throw new Error(`Could not find subtitle file in ZIP\n${zip.files}`);
  }
}

