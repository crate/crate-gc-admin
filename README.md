# CrateDB Grand Central Admin

This is an administration interface for CrateDB, that aims to be a direct replacement
for the original [crate-admin](https://github.com/crate/crate-admin) (a.k.a. Admin UI).

## Architectural Design Choices

GC Admin is open source and will always be open source (Apache 2.0).

GC Admin aims to be embedded within a CrateDB database, as the original crate-admin is.
However, the project can also be run standalone, and configured to access CrateDB using
Cross-Origin requests.

GC Admin is pure TypeScript/React that runs in a browser (no backend code).

GC Admin exposes a React component library, where components can be re-used in other
React applications (i.e. they are used in CrateDB Cloud).

GC Admin has a consistent UX with CrateDB Cloud.

### Authentication

GC Admin authenticates to CrateDB using standard HTTP Basic Auth.

### Enterprise Features

GC Admin includes certain enterprise features, which require a non-open-source, paid-for
application called Grand Central to function. When Grand Central is not present, the admin
UI works, but certain features/tabs are inaccessible. Grand Central is always accessed
via HTTP(S) Cross-Origin requests (the URL is configurable).

GC Admin authenticates to Grand Central via a JWT token, which must be obtained from
CrateDB Cloud.

## Using @crate.io/crate-ui-components as a local library

Sometimes you need to be able to develop using the local version instead of using a version published on npm.

To be able to do this you need to have cloned the repositories in a structure like this:

    your-work-directory/
    ├── ...
    ├── crate-gc-admin/          # Crate GC Admin
    ├── crate-ui-components/     # Crate UI Components Library
    ├── ...

Then you need to follow these steps:

1. In the `crate-ui-components` run `yarn link-local`
2. In `crate-gc-admin` run `yarn link-local-lib`

In `crate-gc-admin` `package.json` you should see this under dependencies:

```
    ...
    "dependencies": {
        ...,
        "@crate.io/crate-ui-components": "link:../crate-ui-components",
        ...
    },
    ...
```

This means that `crate-gc-admin` is using the local build of the `crate-ui-components` library, instead of the one on NPM registry.

Everytime you are updating some components in `crate-ui-components` library, you have to:

1. Run `yarn build` of the `crate-ui-components` library
2. Hit a refresh in `crate-gc-admin` browser page (there is no hot-reload)

When you have finished local development you have to:

1. Run `yarn unlink-local-lib` in `crate-gc-admin`. Pay attention that this is installing the latest version of the `crate-ui-components` published on NPM, so check the version.
2. Run `yarn unlink-local` in `crate-ui-components`.
