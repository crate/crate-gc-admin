import { QueryResultSuccess } from 'types/query';

export const useUsersRolesMock: QueryResultSuccess = {
  col_types: [],
  cols: [],
  rows: [
    [
      'user',
      'alex',
      false,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'AL',
        },
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'DDL',
        },
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'DQL',
        },
        {
          class: 'SCHEMA',
          ident: 'doc',
          state: 'GRANT',
          type: 'DQL',
        },
        {
          class: 'TABLE',
          ident: 'doc.a',
          state: 'GRANT',
          type: 'DML',
        },
        {
          class: 'VIEW',
          ident: 'doc.aaview',
          state: 'GRANT',
          type: 'DML',
        },
        {
          class: 'VIEW',
          ident: 'doc.view',
          state: 'GRANT',
          type: 'DML',
        },
      ],
      false,
    ],
    ['user', 'crate', false, false, [], [], true],
    [
      'user',
      'john',
      false,
      true,
      [
        {
          role: 'rolename',
          grantor: 'crate',
        },
        {
          role: 'rolename2',
          grantor: 'crate',
        },
        {
          role: 'rolename3',
          grantor: 'crate',
        },
        {
          role: 'rolename4',
          grantor: 'crate',
        },
        {
          role: 'rolename5',
          grantor: 'crate',
        },
        {
          role: 'rolename6',
          grantor: 'crate',
        },
      ],
      [],
      false,
    ],
    [
      'user',
      'my_user',
      false,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'AL',
        },
        {
          class: 'SCHEMA',
          ident: 'my_schema',
          state: 'GRANT',
          type: 'DQL',
        },
        {
          class: 'TABLE',
          ident: 'doc.a',
          state: 'DENY',
          type: 'DML',
        },
      ],
      false,
    ],
    [
      'user',
      'my_user_password',
      true,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'DDL',
        },
      ],
      false,
    ],
    ['user', 'test_user', true, true, [], [], false],
    [
      'role',
      'rolename',
      false,
      false,
      [],
      [
        {
          class: 'CLUSTER',
          ident: null,
          state: 'GRANT',
          type: 'AL',
        },
      ],
      false,
    ],
    ['role', 'rolename2', false, false, [], [], false],
    ['role', 'rolename3', false, false, [], [], false],
    ['role', 'rolename4', false, false, [], [], false],
    ['role', 'rolename5', false, false, [], [], false],
    ['role', 'rolename6', false, false, [], [], false],
  ],
  rowcount: 1,
  duration: 123.45,
};
