import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  notification,
  Tabs,
  Space,
  Popconfirm,
  Typography,
  Badge,
  Drawer,
  Alert,
} from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  MoneyCollectOutlined,
  BankOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "./AdminDashboard.css";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

const API_BASE_URL = "https://cashplayzz.net/api"; // Put your backend URL here

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState(null); // "deposit" or "withdrawal"
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  // Helpers for auth headers
  const getHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);

    try {
      const [statsRes, tournamentsRes, depositsRes, withdrawalsRes, usersRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/admin/dashboard`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/admin/tournaments`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/admin/deposits?status=all`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/admin/withdrawals?status=all`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() }),
        ]);

      const [statsData, tournamentsData, depositsData, withdrawalsData, usersData] =
        await Promise.all([
          statsRes.json(),
          tournamentsRes.json(),
          depositsRes.json(),
          withdrawalsRes.json(),
          usersRes.json(),
        ]);

      if (statsData.success) setStats(statsData.stats);
      if (tournamentsData.success) setTournaments(tournamentsData.tournaments);
      if (depositsData.success) setDeposits(depositsData.deposits);
      if (withdrawalsData.success) setWithdrawals(withdrawalsData.withdrawals);
      if (usersData.success) setUsers(usersData.users);
    } catch (e) {
      notification.error({
        message: "Failed to fetch admin data",
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Prize calculation utility
  const calculatePrizePool = (fee, maxPlayers) => {
    const totalCollection = fee * maxPlayers;
    const commission = Math.round(totalCollection * 0.23);
    const prizePool = totalCollection - commission;
    return { commission, prizePool };
  };

  // Submit new tournament
  const onCreateTournament = async (values) => {
    try {
      const { commission, prizePool } = calculatePrizePool(values.entryFee, values.maxPlayers);
      const payload = {
        ...values,
        prizePool,
        prizes: {
          first: Math.round(prizePool * 0.5),
          second: Math.round(prizePool * 0.3),
          third: Math.round(prizePool * 0.2),
        },
        roomPassword: values.roomPassword || "Will be shared 8 min before start",
        roomId: values.roomId || "Will be shared 8 min before start",
      };

      // Select proper endpoint based on game mode
      let endpoint = "/tournaments";
      if (payload.gameMode === "battle-royale") endpoint = "/battlegrounds";
      else if (payload.gameMode === "clash-squad") endpoint = "/clashsquad";
      else if (payload.gameMode === "lone-wolf") endpoint = "/lonewolf";

      const res = await fetch(`${API_BASE_URL}/admin${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        notification.success({
          message: "Tournament created",
          description: `Prize Pool ₹${prizePool} (Commission ₹${commission})`,
        });
        setCreateModalVisible(false);
        form.resetFields();
        await fetchAllData();
      } else {
        notification.error({ message: data.error || "Failed to create tournament" });
      }
    } catch (e) {
      notification.error({ message: "Network error", description: e.message });
    }
  };

  // Approve or reject deposit/withdrawal
  const onApproveRejectTransaction = async (type, id, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/${type}/${id}/${action}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        notification.success({
          message: `${type === "deposits" ? "Deposit" : "Withdrawal"} ${action}d`,
          description: data.newUserBalance ? `New balance ₹${data.newUserBalance}` : "",
        });
        await fetchAllData();
      } else {
        notification.error({ message: data.error || "Operation failed" });
      }
    } catch (e) {
      notification.error({ message: "Network Error", description: e.message });
    }
  };

  // Columns for tournaments table
  const tournamentColumns = [
    {
      title: "Info",
      dataIndex: "teamType",
      key: "info",
      render: (_, record) => (
        <>
          <Text strong>{record.teamType} Tournament</Text><br />
          <Tag color={record.gameMode === "battle-royale" ? "red" : record.gameMode === "clash-squad" ? "green" : "purple"}>
            {record.gameMode.replace("-", " ").toUpperCase()}
          </Tag><br />
          <Text type="secondary">{moment(record.matchTime).format("YYYY-MM-DD HH:mm")}</Text>
        </>
      ),
    },
    {
      title: "Entry Fee",
      dataIndex: "entryFee",
      key: "entryFee",
      render: (val) => `₹${val}`,
    },
    {
      title: "Prize Pool",
      dataIndex: "prizePool",
      key: "prizePool",
      render: (val) => `₹${val}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val, record) => {
        const now = new Date();
        const matchTime = new Date(record.matchTime);
        const expired = matchTime < now;
        const color = expired ? "red" : val === "live" ? "green" : "blue";
        return <Badge color={color} text={val.charAt(0).toUpperCase() + val.slice(1)} />;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => { setSelectedTournament(record); setUpdateModalVisible(true); }}>
            Edit
          </Button>
          <Popconfirm title="Delete Tournament?" onConfirm={async () => {
            try {
              const r = await fetch(`${API_BASE_URL}/admin/tournaments/${record._id}`, {
                method: "DELETE",
                headers: getHeaders(),
              });
              const data = await r.json();
              if (data.success) {
                notification.success({ message: "Tournament deleted" });
                fetchAllData();
              } else {
                notification.error({ message: data.error || "Failed to delete" });
              }
            } catch (e) {
              notification.error({ message: "Network Error", description: e.message });
            }
          }}>
            <Button danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Similarly define columns for deposits, withdrawals and users...

  return (
    <div style={{ padding: "2rem" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: "1rem" }}>
        <Title level={2}><TrophyOutlined /> Admin Dashboard</Title>
        <Space>
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setCreateModalVisible(true)}>Create Tournament</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchAllData} loading={loading}>Refresh</Button>
        </Space>
      </Row>

      <Row gutter={16} style={{ marginBottom: "2rem" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tournaments Today"
              value={stats.tournaments?.today || 0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.users?.total || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Deposits"
              value={stats.deposits?.pending || 0}
              prefix={<MoneyCollectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Withdrawals"
              value={stats.withdrawals?.pending || 0}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="tournaments" animated>
        <TabPane tab={<span><TrophyOutlined />Tournaments</span>} key="tournaments">
          <Table
            dataSource={tournaments}
            columns={tournamentColumns}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 900 }}
          />
        </TabPane>

        {/* Implement Deposits Tab similarly with approve/reject */}

        {/* Implement Withdrawals Tab similarly with approve/reject */}

        {/* Implement Users Tab similarly */}
      </Tabs>

      {/* Tournament create modal */}
      <Modal
        visible={createModalVisible}
        title="Create Tournament"
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onCreateTournament}>
          <Form.Item name="gameMode" label="Game Mode" rules={[{ required: true }]}>
            <Select placeholder="Select Game Mode">
              <Select.Option value="battle-royale">Battle Royale</Select.Option>
              <Select.Option value="clash-squad">Clash Squad</Select.Option>
              <Select.Option value="lone-wolf">Lone Wolf</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="teamType" label="Tournament Type" rules={[{ required: true }]}>
            <Select placeholder="Select Tournament Type">
              <Select.Option value="Solo">Solo</Select.Option>
              <Select.Option value="Duo">Duo</Select.Option>
              <Select.Option value="Squad">Squad</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="entryFee" label="Entry Fee (₹)" rules={[{ required: true, type: "number", min: 1 }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="maxPlayers" label="Max Players" rules={[{ required: true, type: "number", min: 1 }]}>
            <Input type="number" />
          </Form.Item>

          <Form.Item name="matchTime" label="Match Time" rules={[{ required: true }]}>
            <DatePicker showTime />
          </Form.Item>

          <Form.Item name="roomId" label="Room ID (Optional)">
            <Input placeholder="Will be assigned automatically if left blank" />
          </Form.Item>

          <Form.Item name="roomPassword" label="Room Password (Optional)">
            <Input placeholder="Will be assigned automatically if left blank" />
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <TextArea rows={3} />
          </Form.Item>

          <Alert
            type="info"
            message="Prize Pool Calculation"
            description="Prize pool will be total entry fees minus 23% commission. Prizes: 50% to 1st, 30% to 2nd, 20% to 3rd."
            showIcon
            style={{ marginBottom: "1rem" }}
          />

          <Form.Item>
            <Space>
              <Button htmlType="submit" type="primary">Create Tournament</Button>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Additional modals/drawers for viewing/updating details can be added similarly */}

    </div>
  );
}
