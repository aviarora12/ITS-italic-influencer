const express = require('express');
const router = express.Router();
const store = require('../services/localStore');

function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((d.getTime() - Date.now()) / 86400000);
}

router.get('/', (req, res) => {
  try {
    const campaigns = store.readSheet('Campaigns');
    const content = store.readSheet('Content');
    const contracts = store.readSheet('Contracts');
    const reminders = [];

    campaigns.forEach(campaign => {
      const id = campaign['ID'];
      const name = campaign['Influencer Name'];
      const status = campaign['Status'];
      const type = campaign['Type'];
      const days = daysSince(campaign['Updated At'] || campaign['Created At']);

      if ((status === 'DM Sent' || status === 'Reached Out') && days >= 3)
        reminders.push({ id: `${id}-dm`, campaignId: id, influencerName: name, type: 'follow_up',
          reason: 'Follow up — no response yet', detail: `${status} ${days} days ago`,
          daysSinceUpdate: days, priority: days >= 7 ? 'high' : 'medium' });

      if (status === 'Interested' && days >= 3)
        reminders.push({ id: `${id}-interested`, campaignId: id, influencerName: name, type: 'follow_up',
          reason: 'Follow up — still interested?', detail: `Marked interested ${days} days ago`,
          daysSinceUpdate: days, priority: days >= 7 ? 'high' : 'medium' });

      if (status === 'Delivered' && days >= 14)
        reminders.push({ id: `${id}-delivered`, campaignId: id, influencerName: name, type: 'check_in',
          reason: 'Check in — product delivered, no post yet', detail: `Delivered ${days} days ago`,
          daysSinceUpdate: days, priority: 'high' });

      if (status === 'Product Sent' && days >= 10)
        reminders.push({ id: `${id}-shipped`, campaignId: id, influencerName: name, type: 'check_tracking',
          reason: 'Check tracking — may be delivered', detail: `Shipped ${days} days ago`,
          daysSinceUpdate: days, priority: 'medium' });

      if (status === 'Posted' && type === 'Gifted' && days >= 7)
        reminders.push({ id: `${id}-convert`, campaignId: id, influencerName: name, type: 'conversion',
          reason: 'Ask if they want a paid collab', detail: `Posted ${days} days ago`,
          daysSinceUpdate: days, priority: 'medium' });
    });

    content.forEach(item => {
      const campId = item['Campaign ID'];
      const name = item['Influencer Name'];
      const daysLeft = daysUntil(item['Ad Access Expiry Date']);
      const campaign = campaigns.find(c => c['ID'] === campId);

      if (campaign?.['Status'] === 'Posted' && !item['Whitelisting Approved'])
        reminders.push({ id: `${campId}-whitelist`, campaignId: campId, influencerName: name,
          type: 'whitelisting', reason: 'Confirm whitelisting with creator',
          detail: 'Post is live but whitelisting not confirmed',
          daysSinceUpdate: daysSince(item['Created At']), priority: 'medium' });

      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30)
        reminders.push({ id: `${campId}-expiry`, campaignId: campId, influencerName: name,
          type: 'ad_expiry', reason: 'Whitelisting expiring soon',
          detail: `Ad access expires in ${daysLeft} days`,
          daysSinceUpdate: null, priority: daysLeft <= 7 ? 'high' : 'medium' });
    });

    contracts.forEach(contract => {
      const daysLeft = daysUntil(contract['End Date']);
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30)
        reminders.push({ id: `${contract['Campaign ID']}-renewal`, campaignId: contract['Campaign ID'],
          influencerName: contract['Influencer Name'], type: 'contract_renewal',
          reason: 'Contract renewal coming up', detail: `Contract ends in ${daysLeft} days`,
          daysSinceUpdate: null, priority: daysLeft <= 7 ? 'high' : 'medium' });
    });

    reminders.sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority] || (b.daysSinceUpdate || 0) - (a.daysSinceUpdate || 0);
    });

    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
