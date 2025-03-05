import parse from "node-html-parser";
import { DownloadedFile, fetchResponse, type SubtitleFetchOptions, type SubtitleInfo } from "../utils/download";

const SITE = 'https://www.opensubtitles.com';

class OpenSubtitlesMovieLink {
  constructor(public title: string, public link: string) {}
  async toSubtitleLinks(): Promise<OpenSubtitlesSubtitleLink[]> {
    const {body} = await fetchResponse(this.link);
    const {data} = JSON.parse(body) as {data: string[][]};

    return data.map(s => new OpenSubtitlesSubtitleLink(this, parse(s.at(-1)!).querySelector('a[data-remote="true"]')?.getAttribute('href')!, {
      fileName: parse(s[2]).textContent?.split('\n', 2)?.[0],
      language: parse(s[1]).firstElementChild?.getAttribute('title'),
    })).filter(subtitle => subtitle._link != undefined);
  }
}

class OpenSubtitlesSubtitleLink {
  constructor(
    public page: OpenSubtitlesMovieLink,
    public _link: string,
    public info: SubtitleInfo
  ) {}

  async download(): Promise<DownloadedFile> {
    const { body } = await fetchResponse(SITE + this._link, {
      headers: {
        'x-csrf-token': 'SZHfvYUiNV3uhpKkRPfQPcfhqtrdJVw9hCwxAc+XknB5Wsct+7gZOHlrwJqWElrevrWoZlReTBeJmSPPIVWmzw==',
        'x-requested-with': 'XMLHttpRequest',
      }
    });

    const match = body.match(/file_download\('([^']*?)','([^']*?)'/);
    const filename = match?.[1];
    const downloadLink = match?.[2];
    if (!filename || !downloadLink) throw new Error('Failed to parse: ' + body)
    const result = await DownloadedFile.download(downloadLink);
    result.filename = filename;
    return result;
  }
}

interface OpenSubtitlesSuggestion {
  title: string;
  year: string;
  id: string;
  poster: string;
  rating: number;
  subtitles_count: number;
  type: string;
  path: string;
}

export default async function opensubtitlesFetch(query: string, options?: SubtitleFetchOptions): Promise<OpenSubtitlesMovieLink[]> {
  const languageID = options?.language ?? 'en';
  const response = await fetch(SITE + `/en/en/search/autocomplete/${query}.json`);
  if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}\nBody: ${await response.text()}`);

  const json = await response.json() as OpenSubtitlesSuggestion[];
  return Array.from(json).map(e => new OpenSubtitlesMovieLink(
    e.title,
    SITE + '/' + languageID + e.path.replace('current_locale', languageID).replace('movies', 'features') + '/subtitles.json'
  ));
}

async function test() {
  const movies = await opensubtitlesFetch('Independence Day');
  console.log(movies);
  const movie = movies[0];
  console.log(movie.title);

  const subtitles = await movie.toSubtitleLinks();
  //console.log(subtitles.map(s => ({link: s._link, info: s.info})));

  const subtitle = subtitles[0]
  console.log(subtitle)

  const final = await subtitle.download()
  console.log(final)
}

test();

