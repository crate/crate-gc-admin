# Grand Central Changelog

## Unreleased

- Avoid JWT renew on 400 HTTP errors.
- Tailwind prettier plugin added.

## 2024-02-27 - 0.6.8

- Refactored the SQL results output for readability.
- Display the error trace on failed SQL queries.

## 2024-02-26 - 0.6.7

- Misc tiny tidy-ups.

## 2024-02-26 - 0.6.6

- Fixing flickering in extra small Switch with loader.

## 2024-02-26 - 0.6.5

- Fixing column width on Job and Logs Table.
- Add specific tab query param key for GC tabs.
- UI Improvements on SQL Editor.

## 2024-02-23 - 0.6.4

- Fixing broken navigation link from Job table to logs table.

## 2024-02-23 - 0.6.3

- Fixing tab key that conflicts with those used in cloud-ui.

## 2024-02-23 - 0.6.2

- Fixing UI findings on SQL Scheduler.

## 2024-02-21 - 0.6.1

- Change CrateDB SQL Editor Mode ES5 export to ES6.

## 2024-02-20 - 0.6.0

- Add CrateDB specific syntax highlighting in the SQL console.
- Implementing SQL Scheduler UI v2.

## 2024-02-15 - 0.5.4

- Renewing JWT for all 4XX status code.

## 2024-02-14 - 0.5.3

- Fix "Cannot read properties of undefined (reading 'end')" error caused by new jobs.

## 2024-02-13 - 0.5.2

- Fix Authorization header on GC Api.

## 2024-02-13 - 0.5.1

- Added cookie name in context.
- Bumped nginx to 1.25 to fix CVE-2024-0567.

## 2024-02-13 - 0.5.0

- Added a node page.
- Allow copying text from JSON tree results view with a double click.
- Fixed error handling in SQL Console.
- Fixed CSV output
- Remember the choice of the output option in the session.

## 2024-02-08 - 0.4.6

- Added help page.
- [SQL Scheduler] Move "Running..." from "Last Execution" into "Next Due" column.
- [SQL Scheduler] Fix "Invalid Date" in job logs.
- Migrate to axios and configured interceptor to handle JWT Expire.
- Replaced the Grand Central cookie-based login mechanism with a bearer token.

## 2024-02-01 - 0.4.5

- Fix Acceptance Findings.

## 2024-02-01 - 0.4.4

- Added the Code component.
- Removed the NotificationHandler export.

## 2024-01-31 - 0.4.3

- Fix close button in QueryStackTraceModal.
- Export missing StatusLight components and lookups.

## 2024-01-31 - 0.4.2

- Export missing useButtonStyles function.

## 2024-01-31 - 0.4.1

- Export all components from this repo.

## 2024-01-30 - 0.4.0

- Added raw (unformatted) and CSV/JSON output to results table.
- Showing UTC timestamps in Job Scheduler.

## 2024-01-29 - 0.3.0

- Added responsive styling to the tables page.
- Migrated components from crate-ui-components.

## 2024-01-26 - 0.2.1

- Added type information to the result table.
- Add "Cancel" and "Save" buttons into ScheduledJobLogs component.
- SQL Scheduler UI improvements.

## 2024-01-25 - 0.2.0

- Added a cluster overview page with overall cluster stats.
- Updated navigation to be fully responsive and branded.
- Added charts to the cluster overview.
- Improved formatting in the results table.
- Added formatting of Arrays and Objects in the results table.
- Dynamically showing the header in the SQL Console.

## 2024-01-22 - 0.1.2

- Improved SQL Scheduler UI and add tests.

## 2024-01-22 - 0.1.1

- Initial release.
- SQL Page.
- Users Page.
- Enterprise Wrapper for pages which require GC.
- Tables Page.
- Implemented navigation (Ctrl+Up/Ctrl+Down) in the SQL Editor.
- Implemented SQL Scheduler UI.
- Added support for displaying certain types differently in the SQLResultsTable.
- Added a top bar with a logo.
- Added builds for deploying as npm package.
- Added a status bar and calculating cluster data status.
