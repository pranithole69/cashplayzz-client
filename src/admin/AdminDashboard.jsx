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
  Alert,
  Drawer,
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

const API_BASE_URL = "https://cashplayzz-backend-1";

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
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  async function fetchAllData() {
    setLoading(true);
    try {
      const [statsRes, tournamentsRes, depositsRes, withdrawalsRes, usersRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/dashboard`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/api/admin/tournaments`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/api/admin/deposits?status=all`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/api/admin/withdrawals?status=all`, { headers: getHeaders() }),
          fetch(`${API_BASE_URL}/api/admin/users`, { headers: getHeaders() }),
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
    } catch (error) {
      notification.error({
        message: "Failed to fetch admin data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }

  function calculatePrizePool(entryFee, maxPlayers) {
    const totalCollection = entryFee * maxPlayers;
    const commission = Math.round(totalCollection * 0.23);
    const prizePool = totalCollection - commission;
    return { commission, prizePool };
  }

  async function onCreateTournament(values) {
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

      let endpoint = "/tournaments";
      if (payload.gameMode === "battle-royale") endpoint = "/battlegrounds";
      else if (payload.gameMode === "clash-squad") endpoint = "/clashsquad";
      else if (payload.gameMode === "lone-wolf") endpoint = "/lonewolf";

      const response = await fetch(`${API_BASE_URL}/api/admin${endpoint}`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        notification.success({
          message: "Tournament created",
          description: `Prize Pool ₹${prizePool} (Commission ₹${commission})`,
        });
        setCreateModalVisible(false);
        form.resetFields();
        fetchAllData();
      } else {
        notification.error({ message: data.error || "Failed to create tournament" });
      }
    } catch (error) {
      notification.error({ message: "Network error", description: error.message });
    }
  }

  async function onApproveReject(type, id, action) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${type}/${id}/${action}`, {
        method: "PUT",
        headers: getHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        notification.success({
          message: `${type === "deposits" ? "Deposit" : "Withdrawal"} ${action}d`,
          description: data.newUserBalance ? `User new balance: ₹${data.newUserBalance}` : "",
        });
        fetchAllData();
      } else {
        notification.error({ message: data.error || "Operation failed" });
      }
    } catch (error) {
      notification.error({ message: "Network error", description: error.message });
    }
  }

  const tournamentColumns = [
    {
      title: "Info",
      key: "info",
      render: (_, record) => (
        <>
          <Text strong>{record.teamType} Tournament</Text>
          <br />
          <Badge color="blue">{record.gameMode.replace("-", " ").toUpperCase()}</Badge>
          <br />
          <Text type="secondary">{moment(record.matchTime).format("YYYY-MM-DD HH:mm")}</Text>
        </>
      ),
    },
    { title: "Entry Fee", dataIndex: "entryFee", key: "entryFee", render: (val) => `₹${val}` },
    { title: "Prize Pool", dataIndex: "prizePool", key: "prizePool", render: (val) => `₹${val}` },
    { title: "Status", dataIndex: "status", key: "status", render: (val) => <Badge color={val === "live" ? "green" : val === "completed" ? "gray" : "orange"} text={val.charAt(0).toUpperCase() + val.slice(1)} /> },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => { setSelectedTournament(record); setUpdateModalVisible(true); }}>
            Edit
          </Button>
          <Popconfirm
            title="Delete Tournament?"
            onConfirm={async () => {
              const res = await fetch(`${API_BASE_URL}/api/admin/tournaments/${record._id}`, {
                method: "DELETE",
                headers: getHeaders(),
              });
              const data = await res.json();
              if (data.success) {
                notification.success({ message: "Tournament deleted" });
                fetchAllData();
              } else {
                notification.error({ message: data.error || "Delete failed" });
              }
            }}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Similarly define depositColumns, withdrawalColumns, userColumns (not expanded here for brevity)

  return (
    <div style={{ padding: 20 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Title level={2}>
          <TrophyOutlined /> Admin Dashboard
        </Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            Create Tournament
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchAllData} loading={loading}>
            Refresh
          </Button>
        </Space>
      </Row>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Text strong>Tournaments Today</Text>
            <br />
            <Text>{stats?.tournaments?.today ?? 0}</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text strong>Total Users</Text>
            <br />
            <Text>{stats?.users?.total ?? 0}</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text strong>Pending Deposits</Text>
            <br />
            <Text>{stats?.deposits?.pending ?? 0}</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Text strong>Pending Withdrawals</Text>
            <br />
            <Text>{stats?.withdrawals?.pending ?? 0}</Text>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="tournaments">
        <TabPane tab={<span><TrophyOutlined />Tournaments</span>} key="tournaments">
          <Table dataSource={tournaments} columns={tournamentColumns} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
        </TabPane>

        <TabPane tab={<span><MoneyCollectOutlined />Deposits</span>} key="deposits">
          {/* Deposits Table with approve/reject buttons: implement like tournamentColumns */}
        </TabPane>

        <TabPane tab={<span><BankOutlined />Withdrawals</span>} key="withdrawals">
          {/* Withdrawals Table with approve/reject buttons: implement like tournamentColumns */}
        </TabPane>

        <TabPane tab={<span><UserOutlined />Users</span>} key="users">
          {/* Users Table showing users info */}
        </TabPane>
      </Tabs>

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
            <Select placeholder="Tournament Type">
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
            <Input placeholder="Will be assigned if blank" />
          </Form.Item>

          <Form.Item name="roomPassword" label="Room Password (Optional)">
            <Input placeholder="Will be assigned if blank" />
          </Form.Item>

          <Form.Item name="description" label="Description (Optional)">
            <TextArea rows={3} />
          </Form.Item>

          <Alert
            type="info"
            message="Prize Pool Calculation"
            description="Prize pool = (entry fee * max players) - 23% commission. Prizes: 50% / 30% / 20% for top 3."
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
