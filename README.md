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

## Install

To install this library you have to run the following command:

    yarn add @cratedb/crate-gc-admin

Then, if you are using tailwind, edit your `tailwind.config` file and
add the following:

    ...
    content: [
      ...
      './node_modules/@cratedb/crate-gc-admin/**/*.{js,jsx,ts,tsx}'
    ]
    ...

and edit your index.css to import library style:

    @import '@cratedb/crate-gc-admin/style.css';

## Publish a new version

To publish a new version of the `crate-gc-admin` you need to

1.  `git checkout -b prefix/release-x.y.z`
2.  Update `package.json` with the new version
3.  Update `CHANGES.md` with a new release section
4.  Commit, push, get approval, merge
5.  Wait for the GitHub Action to automatically publish the new version on NPM.
