// Static demo data for offline/preview mode (no server required)
const now = new Date();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString().split('T')[0];
const daysFromNow = (n) => new Date(now.getTime() + n * 86400000).toISOString().split('T')[0];
const uid = ((n) => { let i = 0; return () => `demo-${n}-${++i}`; })('id');

const influencers = [
  { id: uid(), name: 'Mia Chen',      handle: '@mia.chen.lifestyle', platform: 'Instagram', followers: 45000,  email: 'mia@example.com' },
  { id: uid(), name: 'Jake Torres',   handle: '@jakefitlife',         platform: 'Instagram', followers: 125000, email: 'jake@example.com' },
  { id: uid(), name: 'Priya Kapoor',  handle: '@priya.kapoor',        platform: 'TikTok',    followers: 230000, email: 'priya@example.com' },
  { id: uid(), name: 'Lena Schmidt',  handle: '@lena_schmidt',        platform: 'Instagram', followers: 68000,  email: 'lena@example.com' },
  { id: uid(), name: 'Marcus Lee',    handle: '@marcuslee',           platform: 'YouTube',   followers: 89000,  email: 'marcus@example.com' },
  { id: uid(), name: 'Sofia Rivera',  handle: '@sofia.style',         platform: 'Instagram', followers: 32000,  email: 'sofia@example.com' },
  { id: uid(), name: 'Aisha Johnson', handle: '@aishabeauty',         platform: 'TikTok',    followers: 510000, email: 'aisha@example.com' },
  { id: uid(), name: 'Tom Walsh',     handle: '@tomwalksthetalk',     platform: 'Instagram', followers: 21000,  email: 'tom@example.com' },
  { id: uid(), name: 'Yuki Tanaka',   handle: '@yuki.creates',        platform: 'Instagram', followers: 175000, email: 'yuki@example.com' },
  { id: uid(), name: 'Bianca Flores', handle: '@bianca.daily',        platform: 'YouTube',   followers: 95000,  email: 'bianca@example.com' },
  { id: uid(), name: 'Ethan Park',    handle: '@ethan_park_',         platform: 'Instagram', followers: 54000,  email: 'ethan@example.com' },
  { id: uid(), name: 'Camille Dupont',handle: '@camille.dupont',      platform: 'Instagram', followers: 83000,  email: 'camille@example.com' },
];

const campaignDefs = [
  { inf: 0, type: 'Gifted',   status: 'DM Sent',          deliverable: '1 Instagram Reel',         product: 'Italic Cashmere Sweater', channel: 'Instagram DM',               updatedDaysAgo: 5  },
  { inf: 1, type: 'Gifted',   status: 'Delivered',        deliverable: '1 Instagram Post + Story', product: 'Italic Linen Shirt',       channel: 'Instagram DM',               updatedDaysAgo: 16 },
  { inf: 2, type: 'Gifted',   status: 'Posted',           deliverable: '1 TikTok Video',           product: 'Italic Silk Blouse',       channel: 'Instagram DM',               updatedDaysAgo: 8  },
  { inf: 3, type: 'Gifted',   status: 'Interested',       deliverable: '1 Instagram Reel',         product: 'Italic Leather Bag',       channel: 'Instagram DM',               updatedDaysAgo: 4  },
  { inf: 4, type: 'Gifted',   status: 'No Response',      deliverable: '1 YouTube Short',          product: 'Italic Merino Wool Scarf', channel: 'Email',                      updatedDaysAgo: 14 },
  { inf: 5, type: 'Paid',     status: 'Contract Signed',  deliverable: '2 Instagram Reels',        product: 'Italic Collection SS24',   channel: 'Instagram DM',    rate: '$800',    updatedDaysAgo: 3  },
  { inf: 6, type: 'Paid',     status: 'Posted',           deliverable: '1 TikTok + 2 Stories',     product: 'Italic Sunglasses',        channel: 'Facebook Creator Marketplace', rate: '$2,500', updatedDaysAgo: 6  },
  { inf: 7, type: 'Paid',     status: 'Rate Negotiating', deliverable: '1 Instagram Reel',         product: 'Italic Sneakers',          channel: 'Instagram DM',    rate: '$400',    updatedDaysAgo: 2  },
  { inf: 8, type: 'Paid',     status: 'Complete',         deliverable: '3 Instagram Reels',        product: 'Italic Denim Jacket',      channel: 'Email',           rate: '$1,800',  updatedDaysAgo: 30 },
  { inf: 9, type: 'Retainer', status: 'Active',           deliverable: '4 posts/month',            product: 'All Italic products',      channel: 'Email',           rate: '$3,500/mo', updatedDaysAgo: 1 },
  { inf: 10,type: 'Retainer', status: 'Active',           deliverable: '2 Reels + 4 Stories/month',product: 'Italic Essentials',        channel: 'Instagram DM',    rate: '$1,500/mo', updatedDaysAgo: 7 },
  { inf: 11,type: 'Gifted',   status: 'Address Collected',deliverable: '1 Instagram Reel + Story', product: 'Italic Linen Pants',       channel: 'Instagram DM',               updatedDaysAgo: 2  },
];

export function buildDemoData() {
  const influencerRows = influencers.map((inf, i) => ({
    'ID': inf.id,
    'Name': inf.name,
    'Handle': inf.handle,
    'Instagram URL': `https://instagram.com/${inf.handle.replace('@', '')}`,
    'Follower Count': String(inf.followers),
    'Email': inf.email,
    'Platform': inf.platform,
    'Notes': '',
    'Created At': daysAgo(30 - i),
  }));

  const campaigns = campaignDefs.map((c, i) => {
    const inf = influencers[c.inf];
    return {
      'ID': `demo-camp-${i + 1}`,
      'Influencer ID': inf.id,
      'Influencer Name': inf.name,
      'Type': c.type,
      'Status': c.status,
      'Deliverable': c.deliverable,
      'Rate': c.rate || '',
      'Product': c.product,
      'Outreach Channel': c.channel,
      'DM Link': '',
      'Contact Email': inf.email,
      'Notes': '',
      'Created At': daysAgo(20 - i),
      'Updated At': daysAgo(c.updatedDaysAgo),
    };
  });

  const shipments = [
    { 'ID': 'demo-ship-1', 'Campaign ID': campaigns[1]['ID'], 'Influencer Name': influencers[1].name, 'Address': '123 Fitness Ave, Los Angeles, CA 90001', 'Order Number': 'ORD-20241', 'Tracking Number': '1Z999AA101', 'Date Shipped': daysAgo(20), 'Date Delivered': daysAgo(18), 'Expected Posting Date': daysAgo(4), 'Created At': daysAgo(21) },
    { 'ID': 'demo-ship-2', 'Campaign ID': campaigns[2]['ID'], 'Influencer Name': influencers[2].name, 'Address': '456 Creator Blvd, New York, NY 10001', 'Order Number': 'ORD-20242', 'Tracking Number': '1Z999AA102', 'Date Shipped': daysAgo(15), 'Date Delivered': daysAgo(12), 'Expected Posting Date': daysAgo(9), 'Created At': daysAgo(16) },
    { 'ID': 'demo-ship-3', 'Campaign ID': campaigns[5]['ID'], 'Influencer Name': influencers[5].name, 'Address': '789 Style St, Miami, FL 33101',          'Order Number': 'ORD-20243', 'Tracking Number': '1Z999AA103', 'Date Shipped': daysAgo(6),  'Date Delivered': daysAgo(4),  'Expected Posting Date': daysFromNow(5), 'Created At': daysAgo(7) },
    { 'ID': 'demo-ship-4', 'Campaign ID': campaigns[11]['ID'],'Influencer Name': influencers[11].name,'Address': 'Awaiting confirmation',                  'Order Number': '',           'Tracking Number': '',           'Date Shipped': '',           'Date Delivered': '',          'Expected Posting Date': daysFromNow(14), 'Created At': daysAgo(2) },
  ];

  const content = [
    { 'ID': 'demo-con-1', 'Campaign ID': campaigns[2]['ID'], 'Influencer Name': influencers[2].name, 'Post Link': 'https://www.tiktok.com/@priya.kapoor/video/example', 'Posted Date': daysAgo(8),  'Whitelisting Approved': '',  'Ad Access Expiry Date': daysFromNow(22), 'Usage Rights Notes': 'Usage rights for 30 days',    'Created At': daysAgo(8)  },
    { 'ID': 'demo-con-2', 'Campaign ID': campaigns[6]['ID'], 'Influencer Name': influencers[6].name, 'Post Link': 'https://www.tiktok.com/@aishabeauty/video/example',   'Posted Date': daysAgo(6),  'Whitelisting Approved': 'Y', 'Ad Access Expiry Date': daysFromNow(24), 'Usage Rights Notes': 'Whitelisting approved for 30 days','Created At': daysAgo(6)  },
    { 'ID': 'demo-con-3', 'Campaign ID': campaigns[8]['ID'], 'Influencer Name': influencers[8].name, 'Post Link': 'https://www.instagram.com/p/example',                 'Posted Date': daysAgo(30), 'Whitelisting Approved': 'Y', 'Ad Access Expiry Date': daysFromNow(2),  'Usage Rights Notes': 'Full rights granted',           'Created At': daysAgo(30) },
  ];

  const contracts = [
    { 'ID': 'demo-ct-1', 'Campaign ID': campaigns[5]['ID'],  'Influencer Name': influencers[5].name,  'Start Date': daysAgo(10), 'End Date': daysFromNow(20), 'Monthly Rate': '800',  'Total Value': '800',   'Deliverables Per Month': '2 Reels',             'Whitelisting Required': 'N', 'Contract File URL': '', 'Signed': 'Y', 'Created At': daysAgo(12) },
    { 'ID': 'demo-ct-2', 'Campaign ID': campaigns[9]['ID'],  'Influencer Name': influencers[9].name,  'Start Date': daysAgo(60), 'End Date': daysFromNow(30), 'Monthly Rate': '3500', 'Total Value': '10500', 'Deliverables Per Month': '4 posts',             'Whitelisting Required': 'Y', 'Contract File URL': '', 'Signed': 'Y', 'Created At': daysAgo(62) },
    { 'ID': 'demo-ct-3', 'Campaign ID': campaigns[10]['ID'], 'Influencer Name': influencers[10].name, 'Start Date': daysAgo(30), 'End Date': daysFromNow(60), 'Monthly Rate': '1500', 'Total Value': '4500',  'Deliverables Per Month': '2 Reels + 4 Stories', 'Whitelisting Required': 'Y', 'Contract File URL': '', 'Signed': 'Y', 'Created At': daysAgo(32) },
  ];

  const activityLog = [
    { 'ID': 'demo-act-1', 'Campaign ID': campaigns[0]['ID'],  'Influencer Name': influencers[0].name,  'Note': 'Sent DM on Instagram introducing Italic brand',              'Created By': 'Team', 'Created At': daysAgo(5)  + 'T10:00:00Z' },
    { 'ID': 'demo-act-2', 'Campaign ID': campaigns[1]['ID'],  'Influencer Name': influencers[1].name,  'Note': 'Package delivered per tracking update',                      'Created By': 'Team', 'Created At': daysAgo(18) + 'T14:30:00Z' },
    { 'ID': 'demo-act-3', 'Campaign ID': campaigns[2]['ID'],  'Influencer Name': influencers[2].name,  'Note': 'Post went live — 12k views in first hour',                   'Created By': 'Team', 'Created At': daysAgo(8)  + 'T09:15:00Z' },
    { 'ID': 'demo-act-4', 'Campaign ID': campaigns[6]['ID'],  'Influencer Name': influencers[6].name,  'Note': 'TikTok posted, whitelisting approved. Performance looks strong.','Created By': 'Team', 'Created At': daysAgo(6)  + 'T11:00:00Z' },
    { 'ID': 'demo-act-5', 'Campaign ID': campaigns[9]['ID'],  'Influencer Name': influencers[9].name,  'Note': 'Monthly check-in call completed. Great relationship.',         'Created By': 'Team', 'Created At': daysAgo(1)  + 'T15:00:00Z' },
  ];

  return { influencerRows, campaigns, shipments, content, contracts, activityLog };
}
