import { fetchHtml, fetchResponse, type LanguageID, type SubtitleFetchOptions, type SubtitleInfo } from "../utils/download";

const SITE = 'https://www.opensubtitles.org';

const LangMap: Partial<Record<LanguageID, string>> = {
  'en': 'eng',
  'at': 'ast',
}
function getLanguageID(language: undefined | LanguageID | LanguageID[]): string | undefined {
  if (language === undefined) return undefined;
  if (typeof language === 'string') language = [language];
  return language.map(l => LangMap[l]).filter(l => l).join(',');
}

class OpenSubtitlesMovieLink {
  constructor(public title: string, public link: string) {}
  async toSubtitleLinks(): Promise<OpenSubtitlesSubtitleLink[]> {
    const root = await fetchHtml(this.link);
    return Array.from(root.querySelectorAll('a[class="bnone"]')).map(e => new OpenSubtitlesSubtitleLink(this, e.getAttribute('href')!, {
      fileName: e.textContent.split('\n')[0],
      language: e.parentNode.parentNode.nextElementSibling?.firstElementChild?.getAttribute('title'),
    })).filter(subtitle => subtitle._link != undefined);
  }
}

class OpenSubtitlesSubtitleLink {
  constructor(
    public page: OpenSubtitlesMovieLink,
    public _link: string,
    public info: SubtitleInfo
  ) {}

  async downloadLink(): Promise<string | undefined> {
    const id: never = undefined as never;
    const root = await fetchHtml(SITE + `/en/subtitles/legacy/${id}/download`);
    const nextLink = root.querySelector('div[class="col-sm-3"] > a[data-remote="true"]')?.getAttribute('href');
    if (!nextLink) return undefined;

    const {body} = await fetchResponse(SITE + nextLink);
    const final = body.match(/href=\\"([^"]+?)\\">/)?.[1];
    return final;
  }
}

interface OpenSubtitlesSuggestion {
  name: string;
  year: string;
  total: string;
  id: number;
  pic: string;
  kind: string;
  rating: string;
}

export default async function opensubtitlesFetch(query: string, options?: SubtitleFetchOptions): Promise<OpenSubtitlesMovieLink[]> {
  const languageID = getLanguageID(options?.language);
  const response = await fetch(SITE + `/libs/suggest.php?format=json3&MovieName=${query}` +
    (languageID ? `&SubLanguageID=${languageID}` : ''))
  ;
  if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}\nBody: ${await response.text()}`);

  const json = await response.json() as OpenSubtitlesSuggestion[];
  return Array.from(json).map(e => new OpenSubtitlesMovieLink(e.name, SITE + `/en${(languageID ? `/sublanguageid-${languageID}` : '')}/idmovie-${e.id}` ));
}

