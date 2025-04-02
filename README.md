# SubDL - Subtitle Downloader Library

SubDL is a TypeScript library designed to fetch and download subtitles for movies from various subtitle websites. It supports multiple subtitle sources and provides a unified interface to search and download subtitles.

## Features

- Fetch subtitles from multiple sources:
  - OpenSubtitles.com
  - MovieSubtitles.org
  - MovieSubtitlesRT.com
  - Podnapisi.net
  - SubDL.com
  - YifySubtitles.ch
- Filter subtitles by language
- Downloads subtitles and handles ZIP files automatically

## Installation

TODO: Publish to NPM

## Usage

### Importing the Library

First, import the necessary functions and types from the library:

```typescript
import { SubtitleOptions, MovieList, DownloadedFile, Fetcher, Download, ErrNoMovies, ErrNoSubtitles } from 'subdl';
import { FetchOpenSubtitlesCom, FetchMovieSubtitlesOrg, FetchMoviesubtitlesrtCom, FetchPodnapisiNet, FetchSubdlCom, FetchYifySubtitlesCh } from 'subdl';
```

### Using the Unified Download Function

To fetch subtitles for a movie, you can use one of the fetch functions provided by the library. Each `Fetch` function corresponds to a different subtitle source.

```typescript
async function downloadSubtitles() {
  const options: SubtitleOptions = { language: 'en' };
  const downloadOptions = {
    movieListQuery: 'The Matrix',
    movieListSorter: {},
    subtitleListQuery: '',
    subtitleListSorter: {},
  };

  try {
    // Download subtitles from OpenSubtitles.com
    const fileOpenSubtitles = await Download('The Matrix', options, FetchOpenSubtitlesCom, downloadOptions);
    console.log(fileOpenSubtitles.filename + ':', fileOpenSubtitles.subtitles[0].slice(0, 100));

    // Download subtitles from MovieSubtitles.org
    const fileMovieSubtitlesOrg = await Download('The Matrix', options, FetchMovieSubtitlesOrg, downloadOptions);
    console.log(fileMovieSubtitlesOrg.filename + ':', fileMovieSubtitlesOrg.subtitles[0].slice(0, 100));

    // Download subtitles from MovieSubtitlesRT.com
    const fileMovieSubtitlesRT = await Download('The Matrix', options, FetchMoviesubtitlesrtCom, downloadOptions);
    console.log(fileMovieSubtitlesRT.filename + ':', fileMovieSubtitlesRT.subtitles[0].slice(0, 100));

    // Download subtitles from Podnapisi.net
    const filePodnapisiNet = await Download('The Matrix', options, FetchPodnapisiNet, downloadOptions);
    console.log(filePodnapisiNet.filename + ':', filePodnapisiNet.subtitles[0].slice(0, 100));

    // Download subtitles from SubDL.com
    const fileSubdlCom = await Download('The Matrix', options, FetchSubdlCom, downloadOptions);
    console.log(fileSubdlCom.filename + ':', fileSubdlCom.subtitles[0].slice(0, 100));

    // Download subtitles from YifySubtitles.ch
    const fileYifySubtitlesCh = await Download('The Matrix', options, FetchYifySubtitlesCh, downloadOptions);
    console.log(fileYifySubtitlesCh.filename + ':', fileYifySubtitlesCh.subtitles[0].slice(0, 100));
  } catch (error) {
    if (error === ErrNoMovies) {
      console.error('No movies found');
    } else if (error === ErrNoSubtitles) {
      console.error('No subtitles found');
    } else {
      console.error('An error occurred:', error);
    }
  }
}
```

### Using Fetch functions directly

You can use fetch functions directly to have more control over how the subtitles are downloaded.

each `Fetch` function returns a `MovieList` array, which contains a list of movies that match the search query.
You can then use the `toSubtitleLinks` method on any movie in list to get it's subtitle list.
`MovieList.toSubtitleLinks()` returns a `SubtitleList` array, which has `download` method to download the subtitle.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you encounter any problems or have suggestions for improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
