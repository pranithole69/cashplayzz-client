import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Table, Button, Modal, Form, Input, DatePicker,
  Select, Statistic, Badge, notification, Tabs, Space, Popconfirm,
  Typography, Tag, Image, Alert, Drawer, Switch, Progress
} from 'antd';
import {
  TrophyOutlined, UserOutlined, MoneyCollectOutlined,
  BankOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, CheckOutlined, CloseOutlined, ReloadOutlined,
  SettingOutlined, DashboardOutlined, TeamOutlined,
  DollarOutlined, FileTextOutlined, CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './AdminDashboard.css';

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
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    fetchAllData();
    // Setup real-time refresh
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all admin data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, tournamentsRes, depositsRes, withdrawalsRes, usersRes] = await Promise.all([
        fetch('/api/admin/dashboard', { headers }),
        fetch('/api/admin/tournaments', { headers }),
        fetch(`/api/admin/deposits?status=${filters.deposits}`, { headers }),
        fetch(`/api/admin/withdrawals?status=${filters.withdrawals}`, { headers }),
        fetch('/api/admin/users', { headers })
      ]);
      
      const [statsData, tournamentsData, depositsData, withdrawalsData, usersData] = await Promise.all([
        statsRes.json(),
        tournamentsRes.json(),
        depositsRes.json(),
        withdrawalsRes.json(),
        usersRes.json()
      ]);
      
      if (statsData.success) setStats(statsData.stats);
      if (tournamentsData.success) setTournaments(tournamentsData.tournaments);
      if (depositsData.success) setDeposits(depositsData.deposits);
      if (withdrawalsData.success) setWithdrawals(withdrawalsData.withdrawals);
      if (usersData.success) setUsers(usersData.users);
      
    } catch (error) {
      notification.error({ 
        message: 'Failed to fetch data',
        description: 'Please check your connection and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create Tournament
  const handleCreateTournament = async (values) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          matchTime: values.matchTime.toISOString()
        })
      });
      
      const data = await response.json();
      if (data.success) {
        notification.success({ 
          message: 'Tournament Created Successfully!',
          description: `Entry Fee: ₹${values.entryFee} | Profit: ₹${data.profit} | Prize Pool: ₹${data.tournament.prizePool}`
        });
        setCreateTournamentModal(false);
        form.resetFields();
        fetchAllData();
      } else {
        notification.error({ message: data.error || 'Failed to create tournament' });
      }
    } catch (error) {
      notification.error({ message: 'Network error occurred' });
    }
  };

  // Update Room Details
  const handleUpdateRoom = async (values) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/tournaments/${selectedTournament._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      if (data.success) {
        notification.success({ 
          message: 'Room Details Updated!',
          description: 'All joined players have been notified instantly.'
        });
        setUpdateRoomModal(false);
        fetchAllData();
      } else {
        notification.error({ message: data.error || 'Failed to update room details' });
      }
    } catch (error) {
      notification.error({ message: 'Network error occurred' });
    }
  };

  // Handle Deposit/Withdrawal Actions
  const handleTransactionAction = async (type, id, action, adminNotes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/${type}/${id}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes })
      });
      
      const data = await response.json();
      
      if (data.success) {
        notification.success({ 
          message: `${type.slice(0, -1)} ${action}d successfully!`,
          description: data.newUserBalance ? `User new balance: ₹${data.newUserBalance.toLocaleString()}` : ''
        });
        fetchAllData();
        setDetailsModal(false);
      } else {
        notification.error({ message: data.error || 'Action failed' });
      }
    } catch (error) {
      notification.error({ message: 'Network error occurred' });
    }
  };

  // Delete Tournament
  const handleDeleteTournament = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/tournaments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        notification.success({ message: 'Tournament deleted successfully!' });
        fetchAllData();
      } else {
        notification.error({ message: data.error || 'Failed to delete tournament' });
      }
    } catch (error) {
      notification.error({ message: 'Network error occurred' });
    }
  };

  // Tournament Columns
  const tournamentColumns = [
    {
      title: 'Tournament Info',
      key: 'info',
      render: (record) => (
        <div className="tournament-info">
          <Text strong className="tournament-title">{record.teamType} Tournament</Text>
          <div className="tournament-tags">
            <Tag color={record.gameMode === 'battle-royale' ? 'red' : record.gameMode === 'clash-squad' ? 'green' : 'purple'}>
              {record.gameMode.replace('-', ' ').toUpperCase()}
            </Tag>
          </div>
          <Text type="secondary" className="tournament-date">
            {moment(record.matchTime).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
      )
    },
    {
      title: 'Financial Details',
      key: 'financial',
      render: (record) => (
        <div className="financial-info">
          <div className="financial-item">
            <Text>Entry Fee: <span className="amount-positive">₹{record.entryFee}</span></Text>
          </div>
          <div className="financial-item">
            <Text>Prize Pool: <span className="amount-success">₹{record.prizePool}</span></Text>
          </div>
          <div className="financial-item">
            <Text>Profit (22%): <span className="amount-profit">₹{record.profit}</span></Text>
          </div>
        </div>
      )
    },
    {
      title: 'Players',
      key: 'players',
      render: (record) => (
        <div className="player-info">
          <div className="player-count">
            <Badge count={record.playerCount} overflowCount={999}>
              <span className="player-display">{record.playerCount}/{record.maxPlayers}</span>
            </Badge>
          </div>
          <Progress 
            percent={record.fillPercentage} 
            size="small" 
            strokeColor={record.fillPercentage > 80 ? '#52c41a' : record.fillPercentage > 50 ? '#1890ff' : '#faad14'}
          />
          <Text type="secondary">{record.fillPercentage}% filled</Text>
        </div>
      )
    },
    {
      title: 'Room Details',
      key: 'room',
      render: (record) => (
        <div className="room-details">
          <div className="room-item">
            <Text strong>Room ID:</Text> {record.roomId || <Text type="secondary">Not Set</Text>}
          </div>
          <div className="room-item">
            <Text strong>Password:</Text> {record.roomPassword || <Text type="secondary">Not Set</Text>}
          </div>
          <Button 
            size="small" 
            type="link"
            onClick={() => {
              setSelectedTournament(record);
              setUpdateRoomModal(true);
            }}
          >
            Update Room
          </Button>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (record) => {
        const now = new Date();
        const matchTime = new Date(record.matchTime);
        const isExpired = matchTime < now;
        const isFull = record.playerCount >= record.maxPlayers;
        const timeRemaining = isExpired ? 0 : Math.ceil((matchTime - now) / (1000 * 60));
        
        return (
          <div className="status-info">
            <Badge 
              status={isExpired ? 'error' : isFull ? 'warning' : 'processing'}
              text={isExpired ? 'Expired' : isFull ? 'Full' : 'Active'}
            />
            {!isExpired && (
              <Text type="secondary" className="time-remaining">
                {timeRemaining > 60 ? `${Math.floor(timeRemaining/60)}h ${timeRemaining%60}m` : `${timeRemaining}m`} left
              </Text>
            )}
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space direction="vertical">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setDetailsModal(true);
            }}
          >
            Details
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTournament(record);
              setUpdateRoomModal(true);
            }}
          >
            Edit Room
          </Button>
          <Popconfirm
            title="Delete Tournament?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteTournament(record._id)}
          >
            <Button 
              size="small" 
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Deposit Columns
  const depositColumns = [
    {
      title: 'User Info',
      key: 'user',
      render: (record) => (
        <div className="user-info">
          <Text strong>{record.userId?.username || 'Unknown'}</Text>
          <br/>
          <Text type="secondary">{record.userId?.email}</Text>
          <br/>
          <Text>Current Balance: <span className="amount-positive">₹{record.userId?.balance?.toLocaleString() || 0}</span></Text>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong className="amount-deposit">₹{amount?.toLocaleString()}</Text>,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Payment Details',
      key: 'payment',
      render: (record) => (
        <div className="payment-details">
          <Tag color="blue">{record.paymentMethod}</Tag>
          {record.paymentDetails?.upiId && (
            <div><Text type="secondary">UPI: {record.paymentDetails.upiId}</Text></div>
          )}
          {record.paymentDetails?.transactionId && (
            <div><Text type="secondary">TXN: {record.paymentDetails.transactionId}</Text></div>
          )}
        </div>
      )
    },
    {
      title: 'Status & Date',
      key: 'status',
      render: (record) => (
        <div className="status-date">
          <Badge 
            color={record.status === 'pending' ? 'orange' : record.status === 'approved' ? 'green' : 'red'} 
            text={record.status?.toUpperCase()} 
          />
          <br/>
          <Text type="secondary">{moment(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
          <br/>
          <Text type="secondary">{moment(record.createdAt).fromNow()}</Text>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space direction="vertical">
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setDetailsModal(true);
            }}
          >
            View Details
          </Button>
          {record.status === 'pending' && (
            <Space>
              <Popconfirm
                title="Approve Deposit?"
                description="User wallet will be credited immediately."
                onConfirm={() => handleTransactionAction('deposits', record._id, 'approve')}
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  Approve
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Reject Deposit?"
                description="This cannot be undone."
                onConfirm={() => handleTransactionAction('deposits', record._id, 'reject')}
              >
                <Button danger size="small" icon={<CloseOutlined />}>
                  Reject
                </Button>
              </Popconfirm>
            </Space>
          )}
        </Space>
      )
    }
  ];

  // Withdrawal Columns  
  const withdrawalColumns = [
    {
      title: 'User Info',
      key: 'user',
      render: (record) => (
        <div className="user-info">
          <Text strong>{record.userId?.username || 'Unknown'}</Text>
          <br/>
          <Text type="secondary">{record.userId?.email}</Text>
          <br/>
          <Text>Current Balance: <span className="amount-positive">₹{record.userId?.balance?.toLocaleString() || 0}</span></Text>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong className="amount-withdrawal">₹{amount?.toLocaleString()}</Text>,
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Payment Details',
      key: 'payment',
      render: (record) => (
        <div className="payment-details">
          <Tag color="red">{record.paymentMethod}</Tag>
          {record.paymentDetails?.bankAccount && (
            <div><Text type="secondary">Bank: {record.paymentDetails.bankAccount}</Text></div>
          )}
          {record.paymentDetails?.upiId && (
            <div><Text type="secondary">UPI: {record.paymentDetails.upiId}</Text></div>
          )}
        </div>
      )
    },
    {
      title: 'Status & Date',
      key: 'status',
      render: (record) => (
        <div className="status-date">
          <Badge 
            color={record.status === 'pending' ? 'orange' : record.status === 'approved' ? 'green' : 'red'} 
            text={record.status?.toUpperCase()} 
          />
          <br/>
          <Text type="secondary">{moment(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
          <br/>
          <Text type="secondary">{moment(record.createdAt).fromNow()}</Text>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record) => (
        <Space direction="vertical">
          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedItem(record);
              setDetailsModal(true);
            }}
          >
            View Details
          </Button>
          {record.status === 'pending' && (
            <Space>
              <Popconfirm
                title="Approve Withdrawal?"
                description="Amount will be debited from user wallet."
                onConfirm={() => handleTransactionAction('withdrawals', record._id, 'approve')}
              >
                <Button type="primary" size="small" icon={<CheckOutlined />}>
                  Approve
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Reject Withdrawal?"
                description="This cannot be undone."
                onConfirm={() => handleTransactionAction('withdrawals', record._id, 'reject')}
              >
                <Button danger size="small" icon={<CloseOutlined />}>
                  Reject
                </Button>
              </Popconfirm>
            </Space>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          <DashboardOutlined /> CashPlayzz Admin Dashboard
        </Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchAllData}
          loading={loading}
          className="refresh-btn"
        >
          Refresh All
        </Button>
      </div>
      
      {/* Statistics Overview */}
      <div className="stats-section">
        <Row gutter={[16, 16]} className="stats-grid">
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card tournament-stat">
              <Statistic
                title="Today's Tournaments"
                value={stats.tournaments?.today || 0}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card user-stat">
              <Statistic
                title="Total Users"
                value={stats.users?.total || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card deposit-stat">
              <Statistic
                title="Pending Deposits"
                value={stats.deposits?.pending || 0}
                prefix={<MoneyCollectOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card withdrawal-stat">
              <Statistic
                title="Pending Withdrawals"
                value={stats.withdrawals?.pending || 0}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="stats-grid secondary-stats">
          <Col xs={24} sm={8} lg={6}>
            <Card className="stat-card game-mode-stat">
              <Statistic
                title="Battle Royale"
                value={stats.tournaments?.battleRoyale || 0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card className="stat-card game-mode-stat">
              <Statistic
                title="Clash Squad"
                value={stats.tournaments?.clashSquad || 0}
                valueStyle={{ color: '#eb2f96' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card className="stat-card game-mode-stat">
              <Statistic
                title="Lone Wolf"
                value={stats.tournaments?.loneWolf || 0}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} lg={6}>
            <Card className="stat-card revenue-stat">
              <Statistic
                title="Total Deposited"
                value={stats.deposits?.totalAmount || 0}
                prefix="₹"
                precision={0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content Tabs */}
      <div className="content-section">
        <Tabs defaultActiveKey="tournaments" className="admin-tabs">
          <TabPane tab={<span><TrophyOutlined />Tournaments</span>} key="tournaments">
            <Card className="content-card">
              <div className="content-header">
                <Title level={4}>Tournament Management</Title>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setCreateTournamentModal(true)}
                    className="create-btn"
                  >
                    Create Tournament
                  </Button>
                </Space>
              </div>
              <Table 
                columns={tournamentColumns}
                dataSource={tournaments}
                rowKey="_id"
                loading={loading}
                className="admin-table"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tournaments`
                }}
                scroll={{ x: 1200 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><MoneyCollectOutlined />Deposits</span>} key="deposits">
            <Card className="content-card">
              <div className="content-header">
                <Title level={4}>Deposit Management</Title>
                <Select
                  value={filters.deposits}
                  onChange={(value) => setFilters({...filters, deposits: value})}
                  className="filter-select"
                >
                  <Select.Option value="all">All Status</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="approved">Approved</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
              </div>
              <Table 
                columns={depositColumns}
                dataSource={deposits}
                rowKey="_id"
                loading={loading}
                className="admin-table"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} deposits`
                }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><BankOutlined />Withdrawals</span>} key="withdrawals">
            <Card className="content-card">
              <div className="content-header">
                <Title level={4}>Withdrawal Management</Title>
                <Select
                  value={filters.withdrawals}
                  onChange={(value) => setFilters({...filters, withdrawals: value})}
                  className="filter-select"
                >
                  <Select.Option value="all">All Status</Select.Option>
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="approved">Approved</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
              </div>
              <Table 
                columns={withdrawalColumns}
                dataSource={withdrawals}
                rowKey="_id"
                loading={loading}
                className="admin-table"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} withdrawals`
                }}
                scroll={{ x: 1000 }}
              />
            </Card>
          </TabPane>

          <TabPane tab={<span><TeamOutlined />Users</span>} key="users">
            <Card className="content-card">
              <div className="content-header">
                <Title level={4}>User Management</Title>
                <Text type="secondary">Total: {users.length} users</Text>
              </div>
              <Table 
                dataSource={users}
                rowKey="_id"
                loading={loading}
                className="admin-table"
                columns={[
                  {
                    title: 'User',
                    key: 'user',
                    render: (record) => (
                      <div>
                        <Text strong>{record.username}</Text><br/>
                        <Text type="secondary">{record.email}</Text>
                      </div>
                    )
                  },
                  {
                    title: 'Balance',
                    dataIndex: 'balance',
                    render: (balance) => <Text className="amount-positive">₹{balance?.toLocaleString() || 0}</Text>
                  },
                  {
                    title: 'Status',
                    dataIndex: 'isActive',
                    render: (active) => <Badge color={active ? 'green' : 'red'} text={active ? 'Active' : 'Inactive'} />
                  },
                  {
                    title: 'Joined',
                    dataIndex: 'createdAt',
                    render: (date) => moment(date).format('DD/MM/YYYY')
                  }
                ]}
                pagination={{
                  pageSize: 15,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} users`
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* Create Tournament Modal */}
      <Modal
        title="Create New Tournament"
        visible={createTournamentModal}
        onCancel={() => setCreateTournamentModal(false)}
        footer={null}
        width={700}
        className="create-tournament-modal"
      >
        <Form form={form} onFinish={handleCreateTournament} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gameMode" label="Game Mode" rules={[{ required: true }]}>
                <Select placeholder="Select game mode" size="large">
                  <Select.Option value="battle-royale">Battle Royale (/battle-royale)</Select.Option>
                  <Select.Option value="clash-squad">Clash Squad (/clash-squad)</Select.Option>
                  <Select.Option value="lone-wolf">Lone Wolf (/lone-wolf)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="teamType" label="Tournament Type" rules={[{ required: true }]}>
                <Select placeholder="Select team type" size="large">
                  <Select.Option value="Solo">Solo</Select.Option>
                  <Select.Option value="Duo">Duo</Select.Option>
                  <Select.Option value="Squad">Squad</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="entryFee" label="Entry Fee (₹)" rules={[{ required: true }]}>
                <Input type="number" prefix="₹" placeholder="Entry fee amount" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="maxPlayers" label="Max Players" rules={[{ required: true }]}>
                <Input type="number" placeholder="Maximum participants" size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="matchTime" label="Match Time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} size="large" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomId" label="Room ID">
                <Input placeholder="Auto-generated if empty" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="roomPassword" label="Room Password">
                <Input placeholder="Auto-generated if empty" size="large" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Tournament description (optional)..." />
          </Form.Item>
          
          <Alert
            message="Automatic Calculations"
            description="Prize pool will be calculated automatically with 22% profit margin. 1st place gets 50%, 2nd gets 30%, 3rd gets 20% of prize pool."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Create Tournament
              </Button>
              <Button size="large" onClick={() => setCreateTournamentModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Room Details Modal */}
      <Modal
        title="Update Room Details"
        visible={updateRoomModal}
        onCancel={() => setUpdateRoomModal(false)}
        footer={null}
        width={500}
      >
        <Form 
          initialValues={{
            roomId: selectedTournament?.roomId,
            roomPassword: selectedTournament?.roomPassword
          }}
          onFinish={handleUpdateRoom}
          layout="vertical"
        >
          <Alert
            message="Live Update"
            description="All joined players will be notified instantly when you update room details."
            type="warning"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Form.Item name="roomId" label="Room ID" rules={[{ required: true }]}>
            <Input size="large" placeholder="Enter room ID" />
          </Form.Item>
          
          <Form.Item name="roomPassword" label="Room Password" rules={[{ required: true }]}>
            <Input size="large" placeholder="Enter room password" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" size="large">
                Update & Notify Players
              </Button>
              <Button size="large" onClick={() => setUpdateRoomModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal for any item */}
      <Drawer
        title="Details"
        placement="right"
        closable={true}
        onClose={() => setDetailsModal(false)}
        visible={detailsModal}
        width={600}
      >
        {selectedItem && (
          <div className="details-drawer">
            {/* Tournament Details */}
            {selectedItem.teamType && (
              <div>
                <Title level={4}>{selectedItem.teamType} Tournament Details</Title>
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Game Mode:</Text> {selectedItem.gameMode}<br/>
                    <Text strong>Entry Fee:</Text> ₹{selectedItem.entryFee}<br/>
                    <Text strong>Prize Pool:</Text> ₹{selectedItem.prizePool}<br/>
                    <Text strong>Players:</Text> {selectedItem.playerCount}/{selectedItem.maxPlayers}
                  </Col>
                  <Col span={12}>
                    <Text strong>Room ID:</Text> {selectedItem.roomId}<br/>
                    <Text strong>Password:</Text> {selectedItem.roomPassword}<br/>
                    <Text strong>Match Time:</Text> {moment(selectedItem.matchTime).format('DD/MM/YYYY HH:mm')}<br/>
                    <Text strong>Status:</Text> {selectedItem.timeRemaining > 0 ? 'Active' : 'Expired'}
                  </Col>
                </Row>
              </div>
            )}
            
            {/* Transaction Details */}
            {selectedItem.amount && (
              <div>
                <Title level={4}>Transaction Details</Title>
                <Text strong>User:</Text> {selectedItem.userId?.username}<br/>
                <Text strong>Email:</Text> {selectedItem.userId?.email}<br/>
                <Text strong>Amount:</Text> ₹{selectedItem.amount}<br/>
                <Text strong>Payment Method:</Text> {selectedItem.paymentMethod}<br/>
                <Text strong>Status:</Text> {selectedItem.status}<br/>
                <Text strong>Date:</Text> {moment(selectedItem.createdAt).format('DD/MM/YYYY HH:mm')}<br/>
                
                {selectedItem.paymentDetails && (
                  <div style={{ marginTop: '16px' }}>
                    <Title level={5}>Payment Details</Title>
                    {selectedItem.paymentDetails.upiId && <div>UPI ID: {selectedItem.paymentDetails.upiId}</div>}
                    {selectedItem.paymentDetails.transactionId && <div>Transaction ID: {selectedItem.paymentDetails.transactionId}</div>}
                    {selectedItem.paymentDetails.screenshot && (
                      <div style={{ marginTop: '8px' }}>
                        <Text strong>Payment Screenshot:</Text><br/>
                        <Image 
                          width={200} 
                          src={`/uploads/transactions/${selectedItem.paymentDetails.screenshot}`}
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6U..."
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminDashboard;
