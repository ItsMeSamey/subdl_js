'use strict';
import { parse } from 'node-html-parser';
import type { SubtitleInfo } from '../utils/download';

const SITE = 'https://www.moviesubtitles.org';

class MoviesSubtitlesMovieLink {
  constructor(public title: string, public link: string) {}
  async toSubtitleLinks(): Promise<MoviesSubtitlesSubtitleLink[]> {
    const response = await fetch(SITE + this.link);
    if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}\nBody: ${await response.text()}`);

    const html = await response.text();
    const root = parse(html);
    const subtitleElements = root.querySelectorAll('div[style="margin-bottom:0.5em; padding:3px;"]');
    return Array.from(subtitleElements)
      .map(e => new MoviesSubtitlesSubtitleLink(this, e.querySelector('a')?.getAttribute('href')!, {
        fileName: e.textContent.split('\n')[0],
        language: e.firstElementChild?.getAttribute('titls')?.match(/Download\s+?([^\s]+?)/i)?.[1],
      }))
      .filter(subtitle => subtitle._downloadLink != undefined)
      .map(lnk => (lnk._downloadLink = lnk._downloadLink.replace('subtitle', 'download'), lnk))
    ;
  }
}

class MoviesSubtitlesSubtitleLink {
  constructor(
    public page: MoviesSubtitlesMovieLink,
    public _downloadLink: string,
    public info: SubtitleInfo
  ) {}

  async downloadLink(): Promise<string | undefined> {
    return this._downloadLink;
  }
}

export default async function moviesubtitlesFetch(query: string): Promise<MoviesSubtitlesMovieLink[]> {
  const formData = new URLSearchParams();
  formData.append('q', query);

  const response = await fetch(SITE + '/search.php', {
    method: 'POST',
    body: formData,
  });

  // Always gives 500
  //if (!response.ok) throw new Error(`HTTP Error! status: ${response.status}\nBody: ${await response.text()}`);

  const html = await response.text();

  const root = parse(html);
  const movieElements = root.querySelectorAll('div[style="width:500px"] > a');
  return Array.from(movieElements)
    .map(e => new MoviesSubtitlesMovieLink(e.textContent, e.getAttribute('href')!))
    .filter(movie => movie.title != undefined)
  ;
}

async function test() {
  const list = await moviesubtitlesFetch('Independence Day');
  console.log(list);
  for (const movie of list) {
    console.log(movie.title);
    const subtitles = await movie.toSubtitleLinks();
    for (const subtitle of subtitles) {
      console.log(subtitle.info);
      const link = await subtitle.downloadLink();
      if (link != undefined) {
        console.log(link);
      }
    }
  }
}

test();

