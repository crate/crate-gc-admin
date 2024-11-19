import { render, screen, within } from 'test/testUtils';
import UsersTable from './UsersTable';
import { CRATEDB_PRIVILEGES_DOCS } from 'constants/defaults';
import { UserInfo } from 'types/cratedb';
import { useUsersRolesMock } from 'test/__mocks__/useUsersRolesMock';
import { postFetch } from 'src/swr/jwt/useUsersRoles';

const users: UserInfo[] = postFetch(useUsersRolesMock);
const SYSTEM_USER = 1;
const SUPERUSER_INDEX = 1;
const USER_GRANTED_ROLES_INDEX = 2;
const USER_WITH_GRANTED_DENIED_PRIVILEGES_INDEX = 3;
const FULL_AUTH_USER_INDEX = 5;
const ROLE_INDEX = 6;

const setup = () => {
  return render(<UsersTable />);
};

const waitForTableRender = async () => {
  await screen.findByRole('table');
};

describe('The UsersTable component', () => {
  it('renders a loader while loading the users', async () => {
    setup();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    await waitForTableRender();
  });

  it('renders the documentation link', async () => {
    setup();
    await waitForTableRender();

    expect(screen.getByText('documentation')).toBeInTheDocument();
    expect(screen.getByText('documentation')).toHaveAttribute(
      'href',
      CRATEDB_PRIVILEGES_DOCS,
    );
  });

  describe('the "Name" cell', () => {
    it('shows the user name', async () => {
      setup();
      await waitForTableRender();

      expect(screen.getByText(users[SUPERUSER_INDEX].name)).toBeInTheDocument();
    });

    it('shows user icon for users', async () => {
      setup();
      await waitForTableRender();
      const userRow = screen.getAllByRole('row')[SUPERUSER_INDEX + 1];

      expect(within(userRow).getByTestId('user-icon')).toBeInTheDocument();
    });

    it('shows role icon for roles', async () => {
      setup();
      await waitForTableRender();
      const roleRow = screen.getAllByRole('row')[ROLE_INDEX + 1];

      expect(within(roleRow).getByTestId('role-icon')).toBeInTheDocument();
    });

    it('shows "system" for system users', async () => {
      setup();
      await waitForTableRender();
      const userRow = screen.getAllByRole('row')[SYSTEM_USER + 1];

      expect(within(userRow).getByText('system')).toBeInTheDocument();
    });
  });

  describe('the "Authentication" cell', () => {
    it('shows all the authentication methods', async () => {
      setup();
      await waitForTableRender();
      const userRow = screen.getAllByRole('row')[FULL_AUTH_USER_INDEX + 1];

      expect(within(userRow).getByText('JWT')).toBeInTheDocument();
      expect(within(userRow).getByText('Password')).toBeInTheDocument();
    });
  });

  describe('the "Granted Roles" cell', () => {
    it('shows all user roles', async () => {
      setup();
      await waitForTableRender();
      const user = users[USER_GRANTED_ROLES_INDEX];
      const userRow = screen.getAllByRole('row')[USER_GRANTED_ROLES_INDEX + 1];

      user.granted_roles.forEach(gr => {
        expect(within(userRow).getByText(gr.role)).toBeInTheDocument();
      });
    });
  });

  describe('the "Granted Privileges" cell', () => {
    it('shows SUPERUSER for user with superuser: true', async () => {
      setup();
      await waitForTableRender();
      const userRow = screen.getAllByRole('row')[SUPERUSER_INDEX + 1];

      expect(within(userRow).getByText('SUPERUSER')).toBeInTheDocument();
    });

    it('shows granted privileges', async () => {
      setup();
      await waitForTableRender();
      const user = users[USER_WITH_GRANTED_DENIED_PRIVILEGES_INDEX];
      const privilege = user.privileges.filter(p => p.state === 'GRANT')[1];
      const userRow =
        screen.getAllByRole('row')[USER_WITH_GRANTED_DENIED_PRIVILEGES_INDEX + 1];

      expect(
        within(userRow).getByText(
          `${privilege.type} ON ${privilege.class} ${privilege.ident}`,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('the "Denied Privileges" cell', () => {
    it('shows denied privileges', async () => {
      setup();
      await waitForTableRender();
      const user = users[USER_WITH_GRANTED_DENIED_PRIVILEGES_INDEX];
      const privilege = user.privileges.filter(p => p.state === 'DENY')[0];
      const userRow =
        screen.getAllByRole('row')[USER_WITH_GRANTED_DENIED_PRIVILEGES_INDEX + 1];

      expect(
        within(userRow).getByText(
          `${privilege.type} ON ${privilege.class} ${privilege.ident}`,
        ),
      ).toBeInTheDocument();
    });
  });
});
