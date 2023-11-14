# @gravity-ui/app-layout &middot; [![npm package](https://img.shields.io/npm/v/@gravity-ui/app-layout)](https://www.npmjs.com/package/@gravity-ui/app-layout) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/app-layout/.github/workflows/ci.yml?label=CI&logo=github)](https://github.com/gravity-ui/app-layout/actions/workflows/ci.yml?query=branch:main)

## Install

```shell
npm install --save-dev @gravity-ui/app-layout
```

## Usage

With `express`:

```js
import express from 'express';
import {createRenderFunction} from '@gravity-ui/app-layout';

const app = express();

const renderLayout = createRenderFunction();

app.get('/', function (req, res) {
  res.send(
    renderLayout({
      // RenderParams
      title: 'Home page',
      bodyContent: {
        root: 'Hello world!',
      },
    }),
  );
});

app.listen(3000);
```

where

```typescript
interface RenderParams<Data, Plugins> {
  // Any json compatible data, will be set to window.__DATA__ on the page
  data?: Data;
  // favicon
  icon?: Icon;
  // nonce to be set on the appropriate tags
  nonce?: string;

  // common options
  // Page title
  title: string;
  // language of page, will be set to html tag
  lang?: string;
  isMobile?: boolean;

  // header tag content
  // meta tags
  meta?: Meta[];
  // link tags
  links?: Link[];
  // script tags
  scripts?: Script[];
  // style tags
  styleSheets?: Stylesheet[];
  // script tags with inlined code
  inlineScripts?: string[];
  // style tags with inlined styles
  inlineStyleSheets?: string[];

  // content of body tag
  bodyContent?: {
    // class name for body tag
    className?: string;
    // body content before div tag with id root
    beforeRoot?: string;
    // innerHtml content of div tag with id root
    root?: string;
    // body content after div tag with id root
    afterRoot?: string;
  };
  // plugins options
  pluginsOptions?: Partial<PluginsOptions<Plugins>>;
}
```

### Meta

Describes `meta` tag:

```typescript
interface Meta {
  name: string;
  content: string;
}
```

Example:

```js
const meta = [
  {name: 'description', content: 'some text'},
  {name: 'robots', content: 'noindex'},
  {name: 'og:title', content: 'Some title'},
];
```

Will be rendered as:

```html
<meta name="description" content="some text" />
<meta name="robots" content="noindex" />
<meta property="og:title" content="Some title" />
```

### Icon

Describes page favicon:

```typescript
interface Icon {
  type?: string;
  sizes?: string;
  href?: string;
}
```

Default value is:

```js
const icon = {
  type: 'image/png',
  sizes: '16x16',
  href: '/favicon.png',
};
```

### Links

Describes `link` tag:

```typescript
interface Link {
  as?: string;
  href: string;
  rel?: string;
  type?: string;
  title?: HTMLLinkElement['title'];
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}
```

Example:

```js
const link = {
  href: 'myFont.woff2',
  rel: 'preload',
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous',
};
```

will be rendered as:

```html
<link href="myFont.woff2" rel="preload" as="font" type="font/woff2" crossorigin="anonymous" />
```

### Scripts

Describes link to script with preload:

```typescript
interface Script {
  src: string;
  defer?: boolean;
  async?: boolean;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}
```

Example:

```js
const script = {
  src: 'url/to/script',
  defer: true,
  async: false,
  crossOrigin: 'anonymous',
};
```

will be rendered as:

```html
<link href="url/to/script" rel="preload" as="script" crossorigin="anonymous" />

<script src="url/to/script" defer="true" async="false" crossorigin="anonymous" nonce="..."></script>
```

#### Style sheets

Describe link to styles:

```typescript
interface Stylesheet {
  href: string;
}
```

Example:

```js
const styleSheet = {
  href: 'url/to/stylesheet',
};
```

will be rendered as:

```html
<link href="url/to/stylesheet" rel="stylesheet" />
```

## Plugins

Render function can be extended by plugins. Plugin may rewrite user defined render content.
Plugin is an object with `name` and `apply` properties:

```typescript
interface Plugin<Options = any, Name = string> {
  name: Name;
  apply: (params: {
    options: Options | undefined; // passed through `renderLayout` function in `pluginsOptions` parameter.
    commonOptions: CommonOptions;
    renderContent: RenderContent;
    utils: RenderHelpers;
  }) => void;
}

interface CommonOptions {
  name: string;
  title: string;
  lang?: string;
  isMobile?: boolean;
}

interface RenderContent {
  meta: Meta[];
  links: Link[];
  scripts: Script[];
  styleSheets: Stylesheet[];
  inlineScripts: string[];
  inlineStyleSheets: string[];
  bodyContent: {
    className: string[];
    beforeRoot: string[];
    root?: string;
    afterRoot: string[];
  };
}

export interface RenderHelpers {
  renderScript(script: Script): string;
  renderInlineScript(content: string): string;
  renderStyle(style: Stylesheet): string;
  renderInlineStyle(content: string): string;
  renderMeta(meta: Meta): string;
  renderLink(link: Link): string;
}
```

There are some plugins in this package:

### Google analytics

Adds google analytics counter on the page.

Usage:

```js
import {createRenderFunction, createGoogleAnalyticsPlugin} from '@gravity-ui/app-layout';

const renderLayout = createRenderFunction([createGoogleAnalyticsPlugin()]);

app.get((req, res) => {
  res.send(
    renderLayout({
      title: 'Home page',
      pluginsOptions: {
        googleAnalytics: {
          useBeaconTransport: true, // enables use of navigator.sendBeacon
          counter: {
            id: 'some id',
          },
        },
      },
    }),
  );
});
```

Plugin options:

```typescript
interface GoogleAnalyticsCounter {
  id: string;
}

interface GoogleAnalyticsOptions {
  useBeaconTransport?: boolean;
  counter: GoogleAnalyticsCounter;
}
```

### Yandex Metrika

Adds Yandex metrics counters on the page.

Usage:

```js
import {createMiddleware, createYandexMetrikaPlugin} from '@gravity-ui/app-layout';

const renderLayout = createRenderFunction([createYandexMetrikaPlugin()]);

app.get((req, res) => {
  res.send(
    renderLayout({
      title: 'Home page',
      pluginsOptions: {
        yandexMetrika: {
          counter: {
            id: 123123123,
            defer: true,
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
          },
        },
      },
    }),
  );
});
```

Plugin options:

```typescript
export type UserParams = {
  [x: string]: boolean | string | number | null | UserParams;
};

export interface MetrikaCounter {
  id: number;
  defer: boolean;
  clickmap: boolean;
  trackLinks: boolean;
  accurateTrackBounce: boolean | number;
  webvisor?: boolean;
  nonce?: string;
  encryptedExperiments?: string;
  triggerEvent?: boolean;
  trackHash?: boolean;
  ecommerce?: boolean | string;
  type?: number;
  userParams?: UserParams;
}

export type MetrikaOptions = {
  src?: string;
  counter: MetrikaCounter | MetrikaCounter[];
};
```

### Layout

Adds script and styles from webpack assets manifest file.

Usage:

```js
import {createMiddleware, createLayoutPlugin} from '@gravity-ui/app-layout';

const renderLayout = createRenderFunction([
  createLayoutPlugin({manifest: 'path/to/assets-manifest.json', publicPath: '/build/'}),
]);

app.get((req, res) => {
  res.send(
    renderLayout({
      title: 'Home page',
      pluginsOptions: {
        layout: {
          name: 'home',
        },
      },
    }),
  );
});
```

Plugin options:

```typescript
export interface LayoutOptions {
  name: string;
  prefix?: string;
}
```

There is helper to create all plugins:

```js
import {createMiddleware, createDefaultPlugins} from '@gravity-ui/app-layout';

const renderLayout = createRenderFunction(
    createDefaultPlugins({layout: {manifest: 'path/to/assets-manifest.json'}})
);

app.get((req, res) => {
    res.send(renderLayout({
        title: 'Home page',
        pluginsOptions: {
            layout: {
                name: 'home'
            },
            googleAnalytics: {
                counter: {...}
            },
            yandexMetrika: {
                counter: {...}
            },
        },
    }));
})
```
