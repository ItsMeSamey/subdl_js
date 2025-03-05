'use strict';

import parse, { HTMLElement } from "node-html-parser";

export interface SubtitleInfo {
  fileName?: string;
  language?: string;
};

export interface SubtitleFetchOptions {
  language?: LanguageID | LanguageID[];
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

export class Downloadable {
  public download(): void {}
}

interface FetchResponse {
  body: string,
  bodyUsed: true,

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/headers) */
  readonly headers: Headers;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/ok) */
  readonly ok: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/redirected) */
  readonly redirected: boolean;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/status) */
  readonly status: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/statusText) */
  readonly statusText: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/type) */
  readonly type: ResponseType;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/url) */
  readonly url: string;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/clone) */
  clone(): Response;
}

export async function fetchResponse(input: RequestInfo | URL, init?: RequestInit): Promise<FetchResponse> {
  const response = await fetch(input, init);
  (response as any).body = await response.text();
  delete (response as any).bodyUsed;
  delete (response as any).arrayBuffer;
  delete (response as any).blob;
  delete (response as any).bytes;
  delete (response as any).formData;
  delete (response as any).json;
  delete (response as any).text;

  (response as any).bodyUsed = true;
  return response as unknown as FetchResponse;
}

export async function fetchHtml(input: RequestInfo | URL, init?: RequestInit, errorOnBadResponse: boolean = true): Promise<HTMLElement> {
  const response = await fetch(input, init);
  if (!response.ok && errorOnBadResponse) throw new Error(`HTTP Error! status: ${response.status}\nBody: ${await response.text()}`);
  return parse(await response.text());
}

