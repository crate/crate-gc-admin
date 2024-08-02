# Grand Central Changelog

## Unreleased

## 2024-08-02 - 0.9.4

- Add clusterID to context, filter SQL console history by cluster.

## 2024-07-15 - 0.9.1

- Renew JWT only on 401 and 403 HTTP error codes from GC.

## 2024-07-15 - 0.9.0

- Split and execute queries sequentially using cratedb-sqlparse.

## 2024-06-26 - 0.8.5

- SQL Console - Fixing visibility of long column names.
- SQL Console - Fixing column names not visible when querying empty tables.

## 2024-06-10 - 0.8.4

- Combine "Scheduler" and "Table Policies" UI into "Automation" section.

## 2024-06-10 - 0.8.2

- Usability Improvements for the Table Tree.
- Fixing cursor pointer in schema Table Tree item.
- Fixed bug in SQL console view history handler.

## 2024-06-03 - 0.8.1

- Added ability to pass in optional event handlers to SQL Console, Job Scheduler and Table Policies.

## 2024-05-21 - 0.8.0

- Improve UX of SQL console / SQL editor by making the panels resizable.
- Only show number of rows affected, not all the results, on the SQL scheduler.
- Remove additional API requests to get the logs of the last
  executions of a scheduled job.

## 2024-04-30 - 0.7.2

- Improve Nodes page UI/UX.
- Fix DataTable filtering to strictly check the filter element.
- Updating imports to use path aliases.
- Change "Max" to "Size" in heap and disk stats in Nodes page.
- Change node attributes Chip color to gray in Nodes page.

## 2024-04-17 - 0.7.1

- Fix "Pretty" SQL results output unnecessary line breaks.
- Escape new lines and whitespace characters in CSV output.
- CrateDB logo in top-left now clickable.
- New Crate blue color. Updated "Tables" list colors.
- Remove single-line comments from SQL.

## 2024-04-11 - 0.7.0

- Switching main font for console to "Menlo" to improve compatibility with Safari.
- Fix sub-objects keys in SQL query results table (keys as NaNs).
- Table Lifecycle Management - Data Retention.

## 2024-03-18 - 0.6.27

- Fixing undefined error on getting job last execution.

## 2024-03-12 - 0.6.18

- Display SQL results arrays with 1-based indexing.

## 2024-03-11 - 0.6.17

- Added icons to the SQL editor table tree.

## 2024-03-08 - 0.6.14

- Misc minor fixes to Job Scheduler components.

## 2024-03-05 - 0.6.13

- Handle case when API requests are rejected by the server.

## 2024-03-05 - 0.6.12

- Tidied layout issues with the SQL editor.

## 2024-03-01 - 0.6.11

- Added schema/table/column tree view to SQL editor.

## 2024-02-29 - 0.6.10

- Display and manage SQL console history.

## 2024-02-29 - 0.6.9

- Avoid JWT renew on 400 HTTP errors.
- Tailwind prettier plugin added.
- Publish to NPM using a GitHub Action.

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
