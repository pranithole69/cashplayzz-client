// pages/api/admin/login.js
export default function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { username, password } = req.body;

  try {
    // Replace with your real authentication logic
    // Example: check against database, validate credentials
    if (username === 'admin@cashplayzz.com' && password === 'your_real_admin_password') {
      const token = 'admin_jwt_' + Date.now(); // Replace with real JWT
      return res.status(200).json({
        success: true,
        token: token,
        message: 'Login successful'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
