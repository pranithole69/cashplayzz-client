import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Table, Button, Modal, Form, Input, DatePicker,
  Select, Statistic, Badge, notification, Tabs, Space, Popconfirm,
  Typography, Tag, Progress, Alert, Drawer
} from 'antd';
import {
  TrophyOutlined, UserOutlined, MoneyCollectOutlined,
  BankOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined,
  DashboardOutlined, TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const AdminDashboard = () => {
  // State Management
  const [stats, setStats] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [createTournamentModal, setCreateTournamentModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [updateRoomModal, setUpdateRoomModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    deposits: 'all',
    withdrawals: 'all',
    tournaments: 'all'
  });

  // Form instance
  const [form] = Form.useForm();
  const [roomForm] = Form.useForm();

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        notification.error({
          message: 'No Admin Token',
          description: 'Please login to continue',
        });
        setLoading(false);
        return;
      }

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
        message: 'Fetch Error',
        description: 'Failed to load data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (values) => {
    try {
      const token = localStorage.getItem('adminToken');
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
        notification.error({ message: data.error || 'Failed to create tournament' });
      }
    } catch (error) {
      notification.error({ message: error.message || 'Network error' });
    }
  };

  const handleUpdateRoom = async (values) => {
    try {
      const token = localStorage.getItem('adminToken');
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
          message: 'Room updated. Players notified.',
        });
        setUpdateRoomModal(false);
        fetchAllData();
      } else {
        notification.error({ message: data.error || 'Failed to update room' });
      }
    } catch (error) {
      notification.error({ message: error.message || 'Network error' });
    }
  };

  const handleTransactionAction = async (type, id, action, adminNotes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
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
          description: data.newUserBalance ? `New balance: ₹${data.newUserBalance}` : '',
        });
        fetchAllData();
        setDetailsModal(false);
      } else {
        notification.error({ message: data.error || 'Action failed' });
      }
    } catch (error) {
      notification.error({ message: error.message || 'Network error' });
    }
  };

  const handleDeleteTournament = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
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
        notification.error({ message: data.error || 'Failed to delete tournament' });
      }
    } catch (error) {
      notification.error({ message: error.message || 'Network error' });
    }
  };

  // You can define your columns here as done before for tournaments, deposits, withdrawals

  // The rest of your JSX rendering your dashboard UX including:
  // Stats cards, Tabs for tournaments, deposits, withdrawals, users
  // CreateTournament modal, UpdateRoom modal, Details drawer

  return (
    <div className="admin-dashboard" style={{ padding: 24 }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={2}><DashboardOutlined /> CashPlayzz Admin Dashboard</Title>
        <Button icon={<ReloadOutlined />} onClick={fetchAllData} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Add Stat Cards, Tabs, Tables, Modals here following your UI design */}

      {/* Placeholders for brevity */}
      <p>Full dashboard UI implementation goes here...</p>

    </div>
  );
};

export default AdminDashboard;
