// src/components/SchedulerForm.tsx
'use client';

import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import { schedulePost } from '../../lib/ayrshare';
import { useAccounts } from '../contexts/AccountsContext'; // <-- USE THE NEW CONTEXT
import 'react-datetime-picker/dist/DateTimePicker.css';
import '../styles/SchedulerForm.css';
import { Select, MenuItem, Checkbox, ListItemText, OutlinedInput, InputLabel, FormControl, CircularProgress } from '@mui/material';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function SchedulerForm() {
  const { profiles, isLoading: isProfilesLoading, error: profilesError } = useAccounts(); // <-- GET DATA FROM CONTEXT
  const [selectedProfileKeys, setSelectedProfileKeys] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Value>(new Date());
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSchedule = async () => {
    if (!caption || selectedProfileKeys.length === 0 || !scheduleDate) {
      setStatus('Caption, destination, and date are required.');
      return;
    }
    setIsLoading(true);
    setStatus('Scheduling...');
    try {
      await schedulePost({
        post: caption,
        destinations: selectedProfileKeys,
        scheduleDate: (scheduleDate as Date).toISOString(),
      });
      setStatus('Post scheduled successfully!');
      setCaption('');
      setSelectedProfileKeys([]);
    } catch (error) { setStatus('Failed to schedule post.'); }
    finally { setIsLoading(false); }
  };
  
  return (
    <div className="scheduler-container">
      <h2>Schedule a Post</h2>
      <div className="scheduler-section">
        <label>Destination Accounts</label>
        {isProfilesLoading ? <CircularProgress size={24} /> : profilesError ? <Typography color="error">{profilesError}</Typography> : (
            <FormControl fullWidth>
              <InputLabel>Select Accounts</InputLabel>
              <Select
                multiple
                value={selectedProfileKeys}
                onChange={(e) => setSelectedProfileKeys(e.target.value as string[])}
                input={<OutlinedInput label="Select Accounts" />}
                renderValue={(selected) => profiles.filter(p => selected.includes(p.profileKey)).map(p => p.title).join(', ')}
              >
                {profiles.map((p) => (
                  <MenuItem key={p.profileKey} value={p.profileKey}>
                    <Checkbox checked={selectedProfileKeys.includes(p.profileKey)} />
                    <ListItemText primary={p.title} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
        )}
      </div>
      <div className="scheduler-section">
        <label>Caption</label>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?" disabled={isLoading}/>
      </div>
      <div className="scheduler-section">
        <label>Schedule Time</label>
        <DateTimePicker onChange={setScheduleDate} value={scheduleDate} disabled={isLoading} />
      </div>
      <button onClick={handleSchedule} className="schedule-btn" disabled={isLoading || isProfilesLoading}>
        {isLoading ? 'Scheduling...' : 'Schedule Post'}
      </button>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}