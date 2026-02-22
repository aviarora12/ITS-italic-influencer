const express = require('express');
const router = express.Router();
const sheetsService = require('../services/googleSheets');

function requireAuth(req, res, next) {
  if (!req.session.tokens) return res.status(401).json({ error: 'Not authenticated' });
  next();
}

function daysSince(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return Math.floor((Date.now() - date.getTime()) / 86400000);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return Math.floor((date.getTime() - Date.now()) / 86400000);
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const [campaigns, content, contracts] = await Promise.all([
      sheetsService.readSheet(req.session.tokens, 'Campaigns'),
      sheetsService.readSheet(req.session.tokens, 'Content'),
      sheetsService.readSheet(req.session.tokens, 'Contracts'),
    ]);

    const reminders = [];

    campaigns.forEach(campaign => {
      const id = campaign['ID'];
      const name = campaign['Influencer Name'];
      const status = campaign['Status'];
      const type = campaign['Type'];
      const updatedAt = campaign['Updated At'] || campaign['Created At'];
      const days = daysSince(updatedAt);

      // DM Sent with no update in 3+ days
      if (status === 'DM Sent' && days !== null && days >= 3) {
        reminders.push({
          id: `${id}-dm-sent`,
          campaignId: id,
          influencerName: name,
          type: 'follow_up',
          reason: 'Follow up — no response yet',
          detail: `DM sent ${days} days ago`,
          daysSinceUpdate: days,
          priority: days >= 7 ? 'high' : 'medium',
        });
      }

      // Interested with no update in 3+ days
      if (status === 'Interested' && days !== null && days >= 3) {
        reminders.push({
          id: `${id}-interested`,
          campaignId: id,
          influencerName: name,
          type: 'follow_up',
          reason: 'Follow up — still interested?',
          detail: `Marked interested ${days} days ago`,
          daysSinceUpdate: days,
          priority: days >= 7 ? 'high' : 'medium',
        });
      }

      // Delivered but no post after 14 days
      if (status === 'Delivered' && days !== null && days >= 14) {
        reminders.push({
          id: `${id}-delivered-no-post`,
          campaignId: id,
          influencerName: name,
          type: 'check_in',
          reason: 'Check in — product delivered, no post yet',
          detail: `Delivered ${days} days ago`,
          daysSinceUpdate: days,
          priority: 'high',
        });
      }

      // Product Sent but no delivery confirmed after 10 days
      if (status === 'Product Sent' && days !== null && days >= 10) {
        reminders.push({
          id: `${id}-shipped-no-delivery`,
          campaignId: id,
          influencerName: name,
          type: 'check_tracking',
          reason: 'Check tracking — may be delivered',
          detail: `Shipped ${days} days ago`,
          daysSinceUpdate: days,
          priority: 'medium',
        });
      }

      // Gifted Posted with no follow-up in 7 days
      if (status === 'Posted' && type === 'Gifted' && days !== null && days >= 7) {
        reminders.push({
          id: `${id}-posted-gifted`,
          campaignId: id,
          influencerName: name,
          type: 'conversion',
          reason: 'Ask if they want a paid collab',
          detail: `Posted ${days} days ago`,
          daysSinceUpdate: days,
          priority: 'medium',
        });
      }

      // Reached Out status
      if (status === 'Reached Out' && days !== null && days >= 3) {
        reminders.push({
          id: `${id}-reached-out`,
          campaignId: id,
          influencerName: name,
          type: 'follow_up',
          reason: 'Follow up — no response yet',
          detail: `Reached out ${days} days ago`,
          daysSinceUpdate: days,
          priority: days >= 7 ? 'high' : 'medium',
        });
      }
    });

    // Content reminders
    content.forEach(item => {
      const campId = item['Campaign ID'];
      const name = item['Influencer Name'];
      const expiry = item['Ad Access Expiry Date'];
      const whitelisting = item['Whitelisting Approved'];

      // Whitelisting not confirmed
      const campaign = campaigns.find(c => c['ID'] === campId);
      if (campaign && campaign['Status'] === 'Posted' && !whitelisting) {
        reminders.push({
          id: `${campId}-whitelisting`,
          campaignId: campId,
          influencerName: name,
          type: 'whitelisting',
          reason: 'Confirm whitelisting with creator',
          detail: 'Post is live but whitelisting not confirmed',
          daysSinceUpdate: daysSince(item['Created At']),
          priority: 'medium',
        });
      }

      // Ad access expiring within 30 days
      const daysLeft = daysUntil(expiry);
      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30) {
        reminders.push({
          id: `${campId}-ad-expiry`,
          campaignId: campId,
          influencerName: name,
          type: 'ad_expiry',
          reason: 'Whitelisting expiring soon',
          detail: `Ad access expires in ${daysLeft} days`,
          daysSinceUpdate: null,
          priority: daysLeft <= 7 ? 'high' : 'medium',
        });
      }
    });

    // Contract renewal reminders
    contracts.forEach(contract => {
      const campId = contract['Campaign ID'];
      const name = contract['Influencer Name'];
      const endDate = contract['End Date'];
      const daysLeft = daysUntil(endDate);

      if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 30) {
        reminders.push({
          id: `${campId}-contract-renewal`,
          campaignId: campId,
          influencerName: name,
          type: 'contract_renewal',
          reason: 'Contract renewal coming up',
          detail: `Contract ends in ${daysLeft} days`,
          daysSinceUpdate: null,
          priority: daysLeft <= 7 ? 'high' : 'medium',
        });
      }
    });

    // Sort by priority then days
    reminders.sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) {
        return pOrder[a.priority] - pOrder[b.priority];
      }
      return (b.daysSinceUpdate || 0) - (a.daysSinceUpdate || 0);
    });

    res.json(reminders);
  } catch (err) {
    console.error('Reminders error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
