import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from './Table';

describe('Table', () => {
  it('renders rows and handles sorting', async () => {
    const user = userEvent.setup();
    const data = [{ name: 'Beta' }, { name: 'Alpha' }];

    render(<Table data={data} columns={[{ header: 'Nombre', key: 'name' }]} />);

    expect(screen.getByText('Beta')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /nombre/i }));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
  });
});
