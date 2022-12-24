<h1 align="center">css-custom-property-extractor</h1>

- Parse css custom properties and output typescript files.By importing the output typescript files<br/>
  ,custom properties can be used type-safely in various libraries.
- Supports `css` and `sass` and `less`.

## Usage

1. Install as `devDependencies`

```shell
npm i -D css-custom-property-extractor
```

2.For example.
Parsing [./samples/scss/bootstrap.scss](./samples/scss/bootstrap.scss) outputs the following typescript file.

```shell
npx ccpe -i ./samples/scss/bootstrap.scss
```

```ts
/**
 *  #0d6efd;
 */
export const BsBlue = "var(--bs-blue)"
/**
 *  #6610f2;
 */
export const BsIndigo = "var(--bs-indigo)"
/**
 *  #6f42c1;
 */
export const BsPurple = "var(--bs-purple)"
/**
 *  #d63384;
 */
export const BsPink = "var(--bs-pink)"
/**
 *  #dc3545;
 */
export const BsRed = "var(--bs-red)"
/**
 *  #fd7e14;
 */
export const BsOrange = "var(--bs-orange)"
/**
...
```
