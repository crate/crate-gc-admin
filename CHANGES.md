# Grand Central Changelog

## Unreleased

## 2024-12-16 - 0.19.6

- Add scrollbar to SQL results tab bar when many resultsets are returned.
- Add support for FLOAT_VECTOR in SQL results.

## 2024-12-09 - 0.19.5

- Improve spacing on schema tree buttons.
- Fix case-sensitive error where schema refresh doesn't always occur.

## 2024-12-06 - 0.19.4

- Migrate package from @crate.io to @cratedb on npm.

## 2024-12-05 - 0.19.3

- Add a refresh button to the SQL console schema tree.
- Update text copied to clipboard when clicking a SQL column name.
- Dependabot: bump nginx from 1.27.2 to 1.27.3
- Dependabot: bump node from 23.1.0-slim to 23.3.0-slim
- Update SQL console history to show most recent 50 queries first.
- Dependabot: bump @ant-design/icons from 5.5.1 to 5.5.2.
- Dependabot: bump prettier-plugin-tailwindcss from 0.6.8 to 0.6.9.
- Dependabot: bump sql-formatter from 15.3.2 to 15.4.6.
- Dependabot: bump cronstrue from 2.50.0 to 2.52.0.
- Dependabot: bump @tanstack/react-table from 8.19.2 to 8.20.5.
- Dependabot: bump @tanstack/match-sorter-utils from 8.15.1 to 8.19.4.
- Dependabot: bump autoprefixer from 10.4.19 to 10.4.20.
- Dependabot: bump @types/node from 22.8.5 to 22.10.1.
- Dependabot: bump @hookform/resolvers from 3.9.0 to 3.9.1.
- Dependabot: bump react-ace from 10.1.0 to 13.0.0.

## 2024-11-29 - 0.19.2

- Dependabot: bump antd from 4.24.16 to 5.22.2.

## 2024-11-29 - 0.19.1

- Fixed a bug where the wrong API URL was used for legacy clusters.
- Fix flaky PolicyForm test.

## 2024-11-26 - 0.19.0

- Updated the schema tree to be more efficient and have nested columns.

## 2024-11-26 - 0.18.2

- Dependabot: bump zustand from 4.4.7 to 5.0.1.

## 2024-11-19 - 0.18.1

- Fixed missing UsersTable export.

## 2024-11-19 - 0.18.0

- Dependabot: bump react-router-dom from 6.24.1 to 6.28.0.
- Dependabot: bump prettier from 3.3.2 to 3.3.3.
- Dependabot: bump prettier-plugin-tailwindcss from 0.5.14 to 0.6.8.
- Refactored JWT token handling and calls direct to the cluster.
- Migrated the TableShards route to this repo from cloud-ui.

## 2024-11-11 - 0.17.2

- Dependabot: remove unused package (@radix-ui/react-collapsible).
- Dependabot: bump @types/papaparse from 5.3.14 to 5.3.15.
- Dependabot: bump ace-builds from 1.35.2 to 1.36.4.
- Dependabot: bump vite from 5.3.6 to 5.4.10.
- Dependabot: bump vite-plugin-dts from 3.9.1 to 4.3.0.
- Dependabot: bump react-icons from 5.2.1 to 5.3.0.
- Upgrade @cratedb/cratedb-sqlparse to the latest version.
- Fix bug on VerticalProgress component when current value is greather than max value.

## 2024-11-06 - 0.17.1

- Misc minor fixes to Users view.

## 2024-11-06 - 0.17.0

- Dependabot: bump vite from 5.3.3 to 5.3.6.
- Dependabot: bump axios from 1.7.2 to 1.7.4.
- Dependabot: bump nginx from 1.25.3 to 1.27.2.
- Dependabot: bump @types/react-dom from 18.3.0 to 18.3.1.
- Dependabot: bump @radix-ui/react-dropdown-menu from 2.1.1 to 2.1.2.
- Dependabot: bump @radix-ui/react-popover from 1.1.1 to 1.1.2.
- Dependabot: bump @types/jest from 29.5.12 to 29.5.14.
- Dependabot: bump react-resizable-panels from 2.0.20 to 2.1.6.
- Dependabot: bump @types/lodash from 4.17.6 to 4.17.13.
- Dependabot: bump @types/node from 16.18.101 to 22.8.5.
- Dependabot: bump node from 18.16.0-slim to 23.1.0-slim.
- Add Users / Permissions View.

## 2024-10-29 - 0.16.2

- Fix DDL/DQL format query to a try-format method.

## 2024-10-29 - 0.16.1

- Hide non top-level columns in DQL statement.

## 2024-10-29 - 0.16.0

- Add option to generate DQL and DDL statements.

## 2024-10-28 - 0.15.9

- Dependabot bump @types/react from 18.3.3 to 18.3.12.
- Dependabot bump tailwind-merge from 2.4.0 to 2.5.4.
- Fix bug with version comparison on a non-stable build.

## 2024-10-25 - 0.15.8

- Upgrade @cratedb/cratedb-sqlparse to the latest version.

## 2024-10-24 - 0.15.7

- Use quoted identifiers when copying from the SQL tree.

## 2024-10-24 - 0.15.6

- Add tooltip to SQL result tabs showing the given query.

## 2024-10-24 - 0.15.5

- Fix bug where the shards data in the Nodes component was being counted instead of summed.

## 2024-10-23 - 0.15.4

- Upgrade @cratedb/cratedb-sqlparse to the latest version.

## 2024-10-22 - 0.15.3

- Make location.search optional in DataTable to prevent issues with tests.

## 2024-10-17 - 0.15.2

- Add ability to disable pagination and provide a custom header for DataTable.

## 2024-10-15 - 0.15.1

- Display grouped table columns correctly.

## 2024-10-02 - 0.15.0

- Refactor schema fetching to store values in a context provider for re-use elsewhere.

## 2024-10-01 - 0.14.2

- Fix bug where the SQL editor was re-rendering too frequently.

## 2024-09-27 - 0.14.1

- Fix bug where JWT calls to the database were still being sent to Grand Central.
- Display Geo shapes and points nicely in the SQL results.

## 2024-09-26 - 0.14.0

- Add SQL editor object filtering.

## 2024-09-24 - 0.13.5

- Fix problem with SQL results not being displayed in certain circumstances.

## 2024-09-23 - 0.13.4

- Fix minor issue with content jumping when navigating between tabs.

## 2024-09-20 - 0.13.3

- Fix edge-case bug where tabs don't always display when hideWhenSingleTab is set.

## 2024-09-20 - 0.13.2

- Update SQL Results output to be memoized to prevent unnecessary re-renders.

## 2024-09-19 - 0.13.1

- Fix an incorrect parameter accidentally committed during testing.

## 2024-09-19 - 0.13.0

- Add scroll margin to SQL console editor.
- Bump sqlparse to 0.0.6.
- Improve the UX of the SQL results output.

## 2024-09-05 - 0.12.1

- Add ability to execute selected text only in SQL console.

## 2024-09-02 - 0.12.0

- Update SQL query call to connect directly to database, rather than via GC, when able to do so.

## 2024-08-14 - 0.11.0

- Migrate JWT token store from cookies to sessionStorage.

## 2024-08-12 - 0.10.3

- Handle sqlparse errors.

## 2024-08-08 - 0.10.2

- Change operation labels in policy form.

## 2024-08-06 - 0.10.1

- Console SQL array results are 1-indexed.

## 2024-08-06 - 0.10.0

- Rework policy condition and add weeks as interval unit.

## 2024-08-06 - 0.9.6

- Fix bug in SQL results to show booleans in RAW output correctly.

## 2024-08-06 - 0.9.5

- Mark VIEWs and FOREIGN TABLEs as such in the Console Table tree.

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
