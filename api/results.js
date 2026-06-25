// API: Get voting results (top 10)
const TDO_TOKEN = 'd42fe2a25af54d8994f098c4fa18a5d1';
const FILE_ID = 'XUAvcGmZMLpV';
const SHEET_ID = 't00i2h';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Fetch all vote records
    const url = `https://docs.qq.com/openapi/smartsheet/${FILE_ID}/list_records?sheet_id=${SHEET_ID}&page_size=1000`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${TDO_TOKEN}` }
    });
    const data = await response.json();
    const records = data.data?.records || [];

    // Count votes per icon
    const voteCounts = {};
    records.forEach(record => {
      const iconId = record.values?.icon_id?.value;
      if (iconId) {
        voteCounts[iconId] = (voteCounts[iconId] || 0) + 1;
      }
    });

    // Sort by vote count
    const sorted = Object.entries(voteCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, votes: count }));

    res.status(200).json({
      totalVoters: records.length,
      totalVotes: Object.values(voteCounts).reduce((a, b) => a + b, 0),
      top10: sorted
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '服务器错误' });
  }
};
