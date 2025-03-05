'use strict';

import parse, { HTMLElement } from "node-html-parser";

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
  constructor(public filename: string, public data: string) {}

  static async download(url: string): Promise<DownloadedFile> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    let filename: string | undefined;
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+?)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    return new DownloadedFile(filename!, await response.text());
  }
}



