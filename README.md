<h1 align="center">css-custom-property-extractor</h1>

<p align="center">
<a href="https://badge.fury.io/js/css-custom-property-extractor"><img src="https://badge.fury.io/js/css-custom-property-extractor.svg" alt="npm version" height="18"></a>
<a href="https://github.com/actions/setup-node"><img alt="GitHub Actions status" src="https://github.com/activeguild/css-custom-property-extractor/workflows/automatic%20release/badge.svg" style="max-width: 100%;"></a>
</p>

## Intro

- Parse css custom properties and output typescript files.By importing the output typescript files<br/>
  ,custom properties can be used type-safely in various libraries.
- Supports `css` and `sass` and `less`.

## Usage

1. Install as `devDependencies`

```shell
npm i -D css-custom-property-extractor
```

2. For example.
   Parsing [./samples/scss/bootstrap.scss](./samples/scss/bootstrap.scss) outputs the following typescript file.

```shell
npx ccpe -i ./samples/scss/bootstrap.scss
```

```ts
/**
 *  #0d6efd;
 */
export const bsBlue = "var(--bs-blue)"
/**
 *  #6610f2;
 */
export const bsIndigo = "var(--bs-indigo)"
/**
 *  #6f42c1;
 */
export const bsPurple = "var(--bs-purple)"
/**
 *  #d63384;
 */
export const bsPink = "var(--bs-pink)"
...
```

3. Import and use the output typescript file.
