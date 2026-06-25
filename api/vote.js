// API: Submit vote (max 6 voters)
const TDO_TOKEN = 'd42fe2a25af54d8994f098c4fa18a5d1';
const FILE_ID = 'XUAvcGmZMLpV';
const SHEET_ID = 't00i2h';
const MAX_VOTERS = 6;

// Get vote count from 腾讯文档
async function getVoteCount() {
  const url = `https://docs.qq.com/openapi/smartsheet/${FILE_ID}/list_records?sheet_id=${SHEET_ID}&page_size=1000`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${TDO_TOKEN}` }
  });
  const data = await res.json();
  return data.data?.records?.length || 0;
}

// Save vote to 腾讯文档
async function saveVote(voterIp, iconIds) {
  const records = iconIds.map(id => ({
    values: {
      'voter_ip': { 'value': voterIp },
      'icon_id': { 'value': id },
      'timestamp': { 'value': new Date().toISOString() }
    }
  }));

  const url = `https://docs.qq.com/openapi/smartsheet/${FILE_ID}/add_records`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TDO_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sheet_id: SHEET_ID, records })
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Check if already 6 votes
    const currentCount = await getVoteCount();
    if (currentCount >= MAX_VOTERS) {
      return res.status(403).json({ error: '投票已结束，已达到6人上限' });
    }

    const { selectedIcons } = req.body;
    if (!Array.isArray(selectedIcons) || selectedIcons.length === 0) {
      return res.status(400).json({ error: '请至少选择1个图标' });
    }
    if (selectedIcons.length > 6) {
      return res.status(400).json({ error: '最多只能选择6个图标' });
    }

    const voterIp = req.headers['x-forwarded-for'] || 'unknown';
    await saveVote(voterIp, selectedIcons);

    res.status(200).json({ success: true, message: '投票成功！' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误，请重试' });
  }
};
