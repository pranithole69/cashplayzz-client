// Import statements assumed present at top

// Fetch all main data: stats, tournaments, deposits, withdrawals, users
const fetchAllData = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No auth token found');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const [statsRes, tournamentsRes, depositsRes, withdrawalsRes, usersRes] = await Promise.all([
      fetch('/api/admin/dashboard', { headers }),
      fetch('/api/admin/tournaments', { headers }),
      fetch(`/api/admin/deposits?status=${filters.deposits}`, { headers }),
      fetch(`/api/admin/withdrawals?status=${filters.withdrawals}`, { headers }),
      fetch('/api/admin/users', { headers }),
    ]);

    const statsData = await statsRes.json();
    const tournamentsData = await tournamentsRes.json();
    const depositsData = await depositsRes.json();
    const withdrawalsData = await withdrawalsRes.json();
    const usersData = await usersRes.json();

    if (statsData.success) setStats(statsData.stats);
    if (tournamentsData.success) setTournaments(tournamentsData.tournaments);
    if (depositsData.success) setDeposits(depositsData.deposits);
    if (withdrawalsData.success) setWithdrawals(withdrawalsData.withdrawals);
    if (usersData.success) setUsers(usersData.users);

  } catch (error) {
    notification.error({
      message: 'Failed to fetch data',
      description: error.message || 'Try again later',
    });
  } finally {
    setLoading(false);
  }
};

// Create new tournament
const handleCreateTournament = async (values) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No auth token found');

    const response = await fetch('/api/admin/tournaments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...values,
        matchTime: values.matchTime.toISOString(),
      }),
    });

    const data = await response.json();

    if (data.success) {
      notification.success({
        message: 'Tournament Created',
        description: `Prize Pool: ₹${data.tournament.prizePool}`,
      });
      setCreateTournamentModal(false);
      form.resetFields();
      fetchAllData();
    } else {
      notification.error({ message: data.error || 'Tournament creation failed' });
    }
  } catch (error) {
    notification.error({ message: error.message || 'Network error' });
  }
};

// Update tournament room details
const handleUpdateRoom = async (values) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No auth token found');

    const response = await fetch(`/api/admin/tournaments/${selectedTournament._id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (data.success) {
      notification.success({
        message: 'Room Updated and users notified',
      });
      setUpdateRoomModal(false);
      fetchAllData();
    } else {
      notification.error({ message: data.error || 'Room update failed' });
    }
  } catch (error) {
    notification.error({ message: error.message || 'Network error' });
  }
};

// Handle deposit or withdrawal actions (approve/reject)
const handleTransactionAction = async (type, id, action, adminNotes = '') => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No auth token found');

    const response = await fetch(`/api/admin/${type}/${id}/${action}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminNotes }),
    });

    const data = await response.json();

    if (data.success) {
      notification.success({
        message: `${type.slice(0, -1)} ${action}d successfully`,
        description: data.newUserBalance ? `User new balance: ₹${data.newUserBalance}` : '',
      });
      fetchAllData();
      setDetailsModal(false);
    } else {
      notification.error({ message: data.error || `${action} action failed` });
    }
  } catch (error) {
    notification.error({ message: error.message || 'Network error' });
  }
};

// Delete tournament
const handleDeleteTournament = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No auth token found');

    const response = await fetch(`/api/admin/tournaments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      notification.success({ message: 'Tournament deleted successfully' });
      fetchAllData();
    } else {
      notification.error({ message: data.error || 'Delete action failed' });
    }
  } catch (error) {
    notification.error({ message: error.message || 'Network error' });
  }
};
