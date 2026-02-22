import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { statusColor, typeColor, getStatusesForType, formatDate, formatDateTime } from '../../utils/formatters';

function Field({ label, value, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      {children || <div className="text-sm text-white">{value || <span className="text-gray-600">—</span>}</div>}
    </div>
  );
}

function EditableField({ label, value, onSave, type = 'text', options }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) onSave(val);
  };

  if (editing) {
    if (options) {
      return (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
          <select
            autoFocus
            className="w-full bg-[#2d3148] border border-indigo-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={handleBlur}
          >
            {options.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        {type === 'textarea' ? (
          <textarea
            autoFocus
            className="w-full bg-[#2d3148] border border-indigo-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none"
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={handleBlur}
            rows={3}
          />
        ) : (
          <input
            autoFocus
            type={type}
            className="w-full bg-[#2d3148] border border-indigo-500 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
            value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={handleBlur}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div
        className="text-sm text-white cursor-pointer hover:bg-[#2d3148] rounded px-2 py-1 -mx-2 -my-1 transition-colors min-h-[28px] flex items-center"
        onClick={() => setEditing(true)}
      >
        {value || <span className="text-gray-600 italic">Click to edit</span>}
      </div>
    </div>
  );
}

export default function CampaignDetailPanel({ campaign, onClose }) {
  const { saveCampaign, shipments, addShipment, saveShipment, content, addContent, saveContent, contracts, addContract, saveContract, activity, addActivity } = useData();
  const { toast } = useApp();
  const [tab, setTab] = useState('overview');
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const shipment = useMemo(() => shipments.find(s => s['Campaign ID'] === campaign['ID']), [shipments, campaign]);
  const contentItem = useMemo(() => content.find(c => c['Campaign ID'] === campaign['ID']), [content, campaign]);
  const contract = useMemo(() => contracts.find(c => c['Campaign ID'] === campaign['ID']), [contracts, campaign]);
  const campaignActivity = useMemo(() =>
    activity.filter(a => a['Campaign ID'] === campaign['ID'])
      .sort((a, b) => new Date(b['Created At']) - new Date(a['Created At'])),
    [activity, campaign]
  );

  const handleFieldSave = async (field, value) => {
    const updated = { ...campaign, [field]: value };
    await saveCampaign(campaign['ID'], updated);
  };

  const handleStatusChange = async (status) => {
    await saveCampaign(campaign['ID'], { ...campaign, 'Status': status, 'Updated At': new Date().toISOString() });
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      await addActivity({
        campaignId: campaign['ID'],
        influencerName: campaign['Influencer Name'],
        note: noteText.trim(),
      });
      setNoteText('');
      setAddingNote(false);
      toast('Note added');
    } finally {
      setSavingNote(false);
    }
  };

  const handleShipmentSave = async (field, value) => {
    if (shipment) {
      await saveShipment(shipment['ID'], { ...shipment, [field]: value });
    } else {
      await addShipment({
        'Campaign ID': campaign['ID'],
        'Influencer Name': campaign['Influencer Name'],
        [field]: value,
      });
    }
  };

  const handleContentSave = async (field, value) => {
    if (contentItem) {
      await saveContent(contentItem['ID'], { ...contentItem, [field]: value });
    } else {
      await addContent({
        'Campaign ID': campaign['ID'],
        'Influencer Name': campaign['Influencer Name'],
        [field]: value,
      });
    }
  };

  const handleContractSave = async (field, value) => {
    if (contract) {
      await saveContract(contract['ID'], { ...contract, [field]: value });
    } else {
      await addContract({
        'Campaign ID': campaign['ID'],
        'Influencer Name': campaign['Influencer Name'],
        [field]: value,
      });
    }
  };

  const statuses = getStatusesForType(campaign['Type']);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'shipment', label: 'Shipment' },
    { id: 'content', label: 'Content' },
    ...(campaign['Type'] !== 'Gifted' ? [{ id: 'contract', label: 'Contract' }] : []),
  ];

  return (
    <div className="fixed right-0 top-0 h-screen w-[520px] bg-[#1a1d27] border-l border-[#2d3148] z-20 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-[#2d3148]">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColor(campaign['Type'])}`}>
              {campaign['Type']}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded border ${statusColor(campaign['Status'])}`}>
              {campaign['Status']}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white truncate">{campaign['Influencer Name']}</h2>
          {campaign['Deliverable'] && (
            <p className="text-sm text-gray-400 mt-0.5">{campaign['Deliverable']}</p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none flex-shrink-0">✕</button>
      </div>

      {/* Status change */}
      <div className="px-6 py-3 border-b border-[#2d3148]">
        <label className="text-xs text-gray-500 font-medium block mb-1.5">Change Status</label>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                s === campaign['Status']
                  ? statusColor(s) + ' ring-1 ring-offset-1 ring-offset-[#1a1d27]'
                  : 'bg-[#242736] border-[#3d4160] text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2d3148] px-6">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm font-medium py-3 px-1 mr-5 border-b-2 transition-colors ${
              tab === t.id
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <EditableField
                label="Product"
                value={campaign['Product']}
                onSave={v => handleFieldSave('Product', v)}
              />
              <EditableField
                label="Rate"
                value={campaign['Rate']}
                onSave={v => handleFieldSave('Rate', v)}
              />
              <EditableField
                label="Outreach Channel"
                value={campaign['Outreach Channel']}
                onSave={v => handleFieldSave('Outreach Channel', v)}
                options={['Instagram DM', 'Facebook Creator Marketplace', 'Email']}
              />
              <EditableField
                label="Contact Email"
                value={campaign['Contact Email']}
                onSave={v => handleFieldSave('Contact Email', v)}
                type="email"
              />
              {campaign['DM Link'] && (
                <div className="col-span-2">
                  <Field label="DM Link">
                    <a href={campaign['DM Link']} target="_blank" rel="noreferrer"
                      className="text-sm text-indigo-400 hover:text-indigo-300 truncate block">
                      {campaign['DM Link']}
                    </a>
                  </Field>
                </div>
              )}
            </div>

            <div>
              <EditableField
                label="Notes"
                value={campaign['Notes']}
                onSave={v => handleFieldSave('Notes', v)}
                type="textarea"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div><span className="text-gray-600">Created:</span> {formatDate(campaign['Created At'])}</div>
              <div><span className="text-gray-600">Updated:</span> {formatDate(campaign['Updated At'])}</div>
            </div>

            {/* Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Activity Log</h3>
                <button
                  onClick={() => setAddingNote(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  + Add Note
                </button>
              </div>

              {addingNote && (
                <div className="mb-3 bg-[#242736] rounded-lg p-3">
                  <textarea
                    className="w-full bg-[#2d3148] border border-[#3d4160] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Add a note..."
                    rows={3}
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleAddNote}
                      disabled={savingNote}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      {savingNote ? 'Saving...' : 'Add Note'}
                    </button>
                    <button
                      onClick={() => { setAddingNote(false); setNoteText(''); }}
                      className="text-xs bg-[#3d4160] text-gray-300 px-3 py-1.5 rounded-lg hover:bg-[#4d5180]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {campaignActivity.length === 0 ? (
                  <p className="text-xs text-gray-600">No activity yet</p>
                ) : (
                  campaignActivity.map(a => (
                    <div key={a['ID']} className="flex gap-3 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-gray-300">{a['Note']}</span>
                        <span className="text-gray-600 block mt-0.5">
                          {a['Created By']} · {formatDateTime(a['Created At'])}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {tab === 'shipment' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <EditableField
                label="Delivery Address"
                value={shipment?.['Address']}
                onSave={v => handleShipmentSave('Address', v)}
                type="textarea"
              />
            </div>
            <EditableField
              label="Order Number"
              value={shipment?.['Order Number']}
              onSave={v => handleShipmentSave('Order Number', v)}
            />
            <EditableField
              label="Tracking Number"
              value={shipment?.['Tracking Number']}
              onSave={v => handleShipmentSave('Tracking Number', v)}
            />
            <EditableField
              label="Date Shipped"
              value={shipment?.['Date Shipped']}
              onSave={v => handleShipmentSave('Date Shipped', v)}
              type="date"
            />
            <EditableField
              label="Date Delivered"
              value={shipment?.['Date Delivered']}
              onSave={v => handleShipmentSave('Date Delivered', v)}
              type="date"
            />
            <div className="col-span-2">
              <EditableField
                label="Expected Posting Date"
                value={shipment?.['Expected Posting Date']}
                onSave={v => handleShipmentSave('Expected Posting Date', v)}
                type="date"
              />
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Post Link</label>
              {contentItem?.['Post Link'] ? (
                <a href={contentItem['Post Link']} target="_blank" rel="noreferrer"
                  className="text-sm text-indigo-400 hover:text-indigo-300 break-all">
                  {contentItem['Post Link']}
                </a>
              ) : (
                <EditableField
                  label=""
                  value={contentItem?.['Post Link']}
                  onSave={v => handleContentSave('Post Link', v)}
                />
              )}
            </div>
            <EditableField
              label="Posted Date"
              value={contentItem?.['Posted Date']}
              onSave={v => handleContentSave('Posted Date', v)}
              type="date"
            />
            <EditableField
              label="Whitelisting Approved"
              value={contentItem?.['Whitelisting Approved']}
              onSave={v => handleContentSave('Whitelisting Approved', v)}
              options={['', 'Y', 'N']}
            />
            <EditableField
              label="Ad Access Expiry"
              value={contentItem?.['Ad Access Expiry Date']}
              onSave={v => handleContentSave('Ad Access Expiry Date', v)}
              type="date"
            />
            <div className="col-span-2">
              <EditableField
                label="Usage Rights Notes"
                value={contentItem?.['Usage Rights Notes']}
                onSave={v => handleContentSave('Usage Rights Notes', v)}
                type="textarea"
              />
            </div>
          </div>
        )}

        {tab === 'contract' && (
          <div className="grid grid-cols-2 gap-4">
            <EditableField
              label="Start Date"
              value={contract?.['Start Date']}
              onSave={v => handleContractSave('Start Date', v)}
              type="date"
            />
            <EditableField
              label="End Date"
              value={contract?.['End Date']}
              onSave={v => handleContractSave('End Date', v)}
              type="date"
            />
            <EditableField
              label="Monthly Rate ($)"
              value={contract?.['Monthly Rate']}
              onSave={v => handleContractSave('Monthly Rate', v)}
            />
            <EditableField
              label="Total Value ($)"
              value={contract?.['Total Value']}
              onSave={v => handleContractSave('Total Value', v)}
            />
            <div className="col-span-2">
              <EditableField
                label="Deliverables Per Month"
                value={contract?.['Deliverables Per Month']}
                onSave={v => handleContractSave('Deliverables Per Month', v)}
              />
            </div>
            <EditableField
              label="Whitelisting Required"
              value={contract?.['Whitelisting Required']}
              onSave={v => handleContractSave('Whitelisting Required', v)}
              options={['', 'Y', 'N']}
            />
            <EditableField
              label="Signed"
              value={contract?.['Signed']}
              onSave={v => handleContractSave('Signed', v)}
              options={['', 'Y', 'N']}
            />
            <div className="col-span-2">
              <EditableField
                label="Contract File URL"
                value={contract?.['Contract File URL']}
                onSave={v => handleContractSave('Contract File URL', v)}
              />
              {contract?.['Contract File URL'] && (
                <a href={contract['Contract File URL']} target="_blank" rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 block">
                  Open contract →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
