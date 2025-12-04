# CrateDB Grand Central Admin

A TypeScript/React front-end only app that runs purely in a browser with no external dependencies, reliance on APIs etc.

This project is active, but it is important to understand why it was created and how it is used for today:

* Origins
  * Created to be a direct replacement for the original [crate-admin](https://github.com/crate/crate-admin), aka Admin UI.
  * Designed to have consistent UX and branding with the [cloud-ui](https://github.com/crate/cloud-ui).
  * Designed to be a home for common, reusable components, to be used here and imported into the Cloud offering via NPM package: https://www.npmjs.com/package/@cratedb/crate-gc-admin.
  * Designed to house future non-Open Source, enterprise features, not yet implemented.
* Original Goals
  * It was intended for this repo to always be open source (Apache 2.0)
  * Authentication is performed using HTTP Basic Auth.
  * To be able to run embedded within CrateDB (as the original Admin UI is), or run standalone and communicate with CrateDB instances via cross-origin requests.
  * Designed to communicate with CrateDB via Grand Central. However, since this project was started, CrateDB has added support for direct communication via JWT tokens. This means that communication between this app and the database is now a hybrid collection of calls to GC, and some JWT-enabled calls direct to the database.
* Current state
  * The standalone side of this project is feature complete (or very close to it), but hasn’t been updated since Q1/Q2 2025. A product decision needs to be made here, but the old Admin UI is written using the now end-of-life AngularJS framework.
  * Creating / editing components in this repo, then importing them into the Cloud UI is a time consuming, inefficient process. Possible solutions to this problem include combining this repo and the cloud-ui into a monorepo with two separate build outputs.

## Install

It is recommended to use Node Version Manager with Crate front-end projects.

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

## Testing with the Cloud UI

To test unpublished `crate-gc-admin` code in the Admin UI, use the `devtools/link_gc.sh` bash script within the Cloud UI repo. It is not a fast process, but it is the easiest way to code across the two repos.

## Publish a new version

To publish a new version of the `crate-gc-admin` you need to

1.  `git checkout -b prefix/release-x.y.z`
2.  Update `package.json` with the new version
3.  Update `CHANGES.md` with a new release section
4.  Commit, push, get approval, merge
5.  Wait for the GitHub Action to automatically publish the new version on NPM.
