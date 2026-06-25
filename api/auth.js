// API: Auth - password verification
const ACCESS_PASSWORD = 'jscxb';
const TDO_TOKEN = 'd42fe2a25af54d8994f098c4fa18a5d1';
const FILE_ID = 'XUAvcGmZMLpV';
const SHEET_ID = 't00i2h';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body;
  if (password === ACCESS_PASSWORD) {
    res.status(200).json({ success: true, token: 'vote_' + Date.now() });
  } else {
    res.status(401).json({ error: '密码错误' });
  }
};
