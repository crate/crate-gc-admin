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
