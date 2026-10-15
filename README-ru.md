# @gravity-ui/app-layout &middot; [![npm package](https://img.shields.io/npm/v/@gravity-ui/app-layout)](https://www.npmjs.com/package/@gravity-ui/app-layout) [![CI](https://img.shields.io/github/actions/workflow/status/gravity-ui/app-layout/.github/workflows/ci.yml?label=CI&logo=github)](https://github.com/gravity-ui/app-layout/actions/workflows/ci.yml?query=branch:main)

## Установка

```shell
npm install --save-dev @gravity-ui/app-layout
```

## Использование

Пример использования с `express`:

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

Где:

```typescript
interface RenderParams<Data, Plugins> {
  // Any json compatible data, will be set to window.__DATA__ on the page
  data?: Data;
  // favicon
  icon?: Icon;
  // nonce to be set on the appropriate tags
  nonce?: string;
  // base tag attributes
  base?: Base;

  // common options
  // Page title
  title: string;
  // language of page, will be set to html tag
  lang?: string;
  isMobile?: boolean;

  // html attributes
  htmlAttributes?: string;
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
    // body attributes
    attributes?: string;
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

### `Base`

Описывает тег `base`:

```typescript
interface Base {
  href?: string;
  target?: HTMLBaseElement['target'];
}
```

Например:

```js
renderLayout({
  title: 'Home page',
  base: {target: '_top'},
});
```

Будет выглядеть следующим образом:

```html
<base target="_top" />
```

### `Meta`

Описывает тег `meta`:

```typescript
interface Meta {
  name: string;
  content: string;
}
```

Например:

```js
const meta = [
  {name: 'description', content: 'some text'},
  {name: 'robots', content: 'noindex'},
  {name: 'og:title', content: 'Some title'},
];
```

Будет выглядеть следующим образом:

```html
<meta name="description" content="some text" />
<meta name="robots" content="noindex" />
<meta property="og:title" content="Some title" />
```

### `Icon`

Описывает фавиконку страницы:

```typescript
interface Icon {
  type?: string;
  sizes?: string;
  href?: string;
}
```

Значение по умолчанию:

```js
const icon = {
  type: 'image/png',
  sizes: '16x16',
  href: '/favicon.png',
};
```

### `Link`

Описывает тег `link`:

```typescript
interface Link {
  as?: string;
  href: string;
  rel?: string;
  type?: string;
  sizes?: string;
  title?: HTMLLinkElement['title'];
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
}
```

Например:

```js
const link = {
  href: 'myFont.woff2',
  rel: 'preload',
  as: 'font',
  type: 'font/woff2',
  crossOrigin: 'anonymous',
};
```

Будет выглядеть следующим образом:

```html
<link href="myFont.woff2" rel="preload" as="font" type="font/woff2" crossorigin="anonymous" />
```

### `Script`

Описывает ссылку на скрипт с предварительной загрузкой:

```typescript
interface Script {
  src: string;
  defer?: boolean;
  async?: boolean;
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  type?: 'importmap' | 'module' | string;
}
```

Например:

```js
const script = {
  src: 'url/to/script',
  defer: true,
  async: false,
  crossOrigin: 'anonymous',
};
```

Будет выглядеть следующим образом:

```html
<link href="url/to/script" rel="preload" as="script" crossorigin="anonymous" />

<script src="url/to/script" defer="true" async="false" crossorigin="anonymous" nonce="..."></script>
```

#### `Stylesheet`

Описывает ссылку на таблицу стилей.

```typescript
interface Stylesheet {
  href: string;
}
```

Например:

```js
const styleSheet = {
  href: 'url/to/stylesheet',
};
```

Будет выглядеть следующим образом:

```html
<link href="url/to/stylesheet" rel="stylesheet" />
```

## Плагины

Функцию рендеринга можно расширить с помощью плагинов. Плагины могут перезаписывать пользовательский контент для рендеринга.
Плагин — это объект с двумя свойствами: `name` и `apply`:

```typescript
interface Plugin<Options = any, Name = string> {
  name: Name;
  apply: (params: {
    options: Options | undefined; // passed through `renderLayout` function in `pluginsOptions` parameter.
    commonOptions: CommonOptions;
    renderContent: RenderContent;
    /** @deprecated use `renderContent.helpers` instead */
    utils: RenderHelpers;
  }) => void;
}

interface CommonOptions {
  name: string;
  title: string;
  lang?: string;
  isMobile?: boolean;
}

export interface HeadContent {
  base?: Base;
  scripts: Script[];
  helpers: RenderHelpers;
  links: Link[];
  meta: Meta[];
  styleSheets: Stylesheet[];
  inlineStyleSheets: string[];
  inlineScripts: string[];
  title: string;
}

export interface BodyContent {
  attributes: Attributes;
  beforeRoot: string[];
  root?: string;
  afterRoot: string[];
}

export interface RenderContent extends HeadContent {
  htmlAttributes: Attributes;
  bodyContent: BodyContent;
}

export interface RenderHelpers {
  renderScript(script: Script): string;
  renderInlineScript(content: string): string;
  renderStyle(style: Stylesheet): string;
  renderInlineStyle(content: string): string;
  renderMeta(meta: Meta): string;
  renderLink(link: Link): string;
  attrs(obj: Attributes): string;
}
```

Данный пакет включает в себя несколько плагинов:

### Google Analytics

Добавляет на страницу счетчик Google Analytics.

Использование:

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

Параметры плагина:

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

Добавляет на страницу счетчики Яндекс Метрики.

Использование:

```js
import {createRenderFunction, createYandexMetrikaPlugin} from '@gravity-ui/app-layout';

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

Параметры плагина:

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

### `Layout` (расположение)

Добавляет скрипты и стили из манифеста ресурсов Webpack.

Использование:

```js
import {createRenderFunction, createLayoutPlugin} from '@gravity-ui/app-layout';

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

Параметры плагина:

```typescript
export interface LayoutOptions {
  name: string;
  prefix?: string;
}
```

#### Резервные адреса загрузки ресурсов

Загружает начальные скрипты и таблицы стилей с резервных адресов, если загрузка с `publicPath` завершилась ошибкой.

Использование:

```js
createLayoutPlugin({
  manifest: 'path/to/assets-manifest.json',
  publicPath: 'https://static.example.com/build/',
  publicPathFallbacks: ['https://backup.example.com/build/', '/build/'],
});
```

Эти параметры также доступны в `createDefaultPlugins({layout: …})`. Включите плагин через `pluginsOptions.layout.name`, как в примере выше. Без `publicPathFallbacks` или при значении `[]` рендер не меняется.

Также можно использовать callback функцию:

```js
createLayoutPlugin({
  manifest: 'path/to/assets-manifest.json',
  publicPath: 'https://static.example.com/build/',
  publicPathFallbacks: () =>
    location.hostname.endsWith('.example.org')
      ? ['https://backup.example.org/build/', '/build/']
      : ['/build/'],
});
```

Функция выполняется один раз и должна быть самодостаточной, без замыканий и импортов. Она получает `{publicPath}`; для основного пути от корня домена это значение включает `layout.prefix`. Если функция возвращает `[]`, используется основной адрес без повторов.

Параметры повторных попыток:

```typescript
interface AssetRetryOptions {
  retries?: number; // Дополнительные попытки на каждом адресе. По умолчанию: 2.
  delayMs?: number; // Задержка перед первым повтором в миллисекундах. По умолчанию: 500.
  factor?: number; // Множитель задержки для следующих повторов. По умолчанию: 2.
  maxDelayMs?: number; // Максимальная задержка в миллисекундах. По умолчанию: 3000.
}
```

Передайте эти параметры в `assetRetry` при вызове `createLayoutPlugin`. Каждый ресурс начинает загрузку с основного адреса. После исчерпания попыток на одном адресе загрузчик перебирает резервы в указанном порядке. Повторы происходят по ошибке загрузки ресурса.

По резервным адресам должны находиться одинаковые файлы сборки с одинаковыми относительными путями. Не добавляйте query-параметры и hash-фрагменты в базовые адреса. Завершающий `/` добавляется, а дубли удаляются автоматически. Путь `/build/` отсчитывается от корня домена страницы; префикс приложения нужно указать явно. Разрешите домены резервов в CSP и настройте CORS.

Порядок загрузки и обработка ошибок:

- Обрабатываются `defer`-скрипты без `async` и `type`, а также таблицы стилей внутри основного пути с сохранением nonce и `crossOrigin`. Остальные ресурсы рендерятся как обычно.
- Таблицы стилей загружаются параллельно. Скрипты выполняются по порядку после завершения попыток загрузки стилей и готовности DOM. Событие `DOMContentLoaded` не означает завершения загрузки приложения.
- Окончательная ошибка отправляет событие `app-layout:asset-load-error` на `window`. Поле `detail` содержит `{type, originalUrl, attempts}` и описывается экспортируемым типом `AssetLoadError`; `attempts` — список URL выполненных попыток, включая повторы. Подключите обработчик до загрузки ресурсов. Окончательная ошибка загрузки таблицы стилей не блокирует скрипты; окончательная ошибка загрузки скрипта останавливает очередь скриптов загрузчика.
- Резервная загрузка также работает при прямых вызовах `content.helpers` в потоковом рендере.

Ленивые чанки требуют отдельной настройки, например через `client.publicPathFallback` в [App Builder](https://github.com/gravity-ui/app-builder). Укажите резервные адреса в обеих библиотеках; список резервов не передаётся через глобальную переменную.

### @gravity-ui/uikit

Добавляет атрибуты к тегу `body`.

Использование:

```js
import {createRenderFunction, createUikitPlugin} from '@gravity-ui/app-layout';

const renderLayout = createRenderFunction([createUikitPlugin()]);

app.get((req, res) => {
  res.send(
    renderLayout({
      title: 'Home page',
      pluginsOptions: {
        uikit: {
          theme: 'dark',
          direction: 'ltr',
        },
      },
    }),
  );
});
```

Параметры плагина:

```typescript
interface UikitPluginOptions {
  theme: string;
  direction?: 'ltr' | 'rtl';
}
```

### Remote Versions

Добавляет информацию о версиях микрофронтендов на страницу.

Этот плагин создает глобальный объект `window.__REMOTE_VERSIONS__`, содержащий указанные версии микрофронтендов, который может использоваться module federation или аналогичными архитектурами микрофронтендов для определения того, какие версии удаленных модулей загружать.

Он может использоваться в связке с [App Builder](https://github.com/gravity-ui/app-builder?tab=readme-ov-file#module-federation) и опцией `moduleFederation.remotesRuntimeVersioning` для автоматической загрузки удаленных модулей с соответствующими версиями.

Использование:

```js
import {createRenderFunction, createRemoteVersionsPlugin} from '@gravity-ui/app-layout';

const renderLayout = createRenderFunction([createRemoteVersionsPlugin()]);

app.get((req, res) => {
  res.send(
    renderLayout({
      title: 'Home page',
      pluginsOptions: {
        remoteVersions: {
          header: '1.2.3',
          footer: '2.1.0',
          sidebar: '0.5.1',
        },
      },
    }),
  );
});
```

Параметры плагина:

```typescript
type RemoteVersionsPluginOptions = Record<string, string>;
```

### Утилиты

Для создания плагинов используется предустановленная утилита:

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

## Альтернативное использование

Пример использования с рендерами `generateRenderContent`, `renderHeadContent` и `renderBodyContent` через потоковую передачу HTML:

```js
import express from 'express';
import htmlescape from 'htmlescape';
import {
  generateRenderContent,
  renderHeadContent,
  renderBodyContent,
  createDefaultPlugins,
} from '@gravity-ui/app-layout';

const app = express();

app.get('/', async function (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Transfer-Encoding': 'chunked',
  });

  const plugins = createDefaultPlugins({layout: {manifest: 'path/to/assets-manifest.json'}});

  const content = generateRenderContent(plugins, {
    title: 'Home page',
  });

  const {htmlAttributes, helpers, bodyContent} = content;

  res.write(`
        <!DOCTYPE html>
        <html ${helpers.attrs({...htmlAttributes})}>
        <head>
            ${renderHeadContent(content)}
        </head>
        <body ${helpers.attrs(bodyContent.attributes)}>
            ${renderBodyContent(content)}
    `);

  const data = await getUserData();

  res.write(`
            ${content.renderHelpers.renderInlineScript(`
                window.__DATA__ = ${htmlescape(data)};
            `)}
        </body>
        </html>
    `);
  res.end();
});

app.listen(3000);
```
