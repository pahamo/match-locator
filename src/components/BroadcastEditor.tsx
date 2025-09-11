import React, { useState, useEffect } from 'react';
import { SIMPLE_BROADCASTERS } from '../services/supabase-simple';

interface BroadcastEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (broadcasters: Array<{ id: number; name: string }>) => void;
}

const BroadcastEditor: React.FC<BroadcastEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [broadcasters, setBroadcasters] = useState(SIMPLE_BROADCASTERS);
  const [newBroadcaster, setNewBroadcaster] = useState({ name: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    setBroadcasters(SIMPLE_BROADCASTERS);
  }, []);

  const handleAdd = () => {
    if (newBroadcaster.name.trim()) {
      const newId = Math.max(...broadcasters.map(b => b.id)) + 1;
      setBroadcasters([...broadcasters, { 
        id: newId, 
        name: newBroadcaster.name.trim()
      }]);
      setNewBroadcaster({ name: '' });
    }
  };

  const handleEdit = (id: number, newName: string) => {
    setBroadcasters(prev => prev.map(b => 
      b.id === id ? { ...b, name: newName } : b
    ));
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this broadcaster?')) {
      setBroadcasters(prev => prev.filter(b => b.id !== id));
    }
  };

  const handleSave = () => {
    onSave(broadcasters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Manage Broadcasters</h2>
        
        {/* Add new broadcaster */}
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Add New Broadcaster</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
                Name
              </label>
              <input
                type="text"
                value={newBroadcaster.name}
                onChange={(e) => setNewBroadcaster({ name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                placeholder="e.g., BBC Sport"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!newBroadcaster.name.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: newBroadcaster.name.trim() ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                opacity: newBroadcaster.name.trim() ? 1 : 0.5
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Existing broadcasters */}
        <div>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Current Broadcasters</h3>
          {broadcasters.map(broadcaster => (
            <div key={broadcaster.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              marginBottom: '8px'
            }}>
              {editingId === broadcaster.id ? (
                <input
                  type="text"
                  defaultValue={broadcaster.name}
                  onBlur={(e) => handleEdit(broadcaster.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEdit(broadcaster.id, e.currentTarget.value);
                    }
                    if (e.key === 'Escape') {
                      setEditingId(null);
                    }
                  }}
                  autoFocus
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #6366f1',
                    borderRadius: '4px',
                    fontSize: '14px',
                    flex: 1,
                    marginRight: '8px'
                  }}
                />
              ) : (
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', fontSize: '14px' }}>{broadcaster.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    ID: {broadcaster.id}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {editingId !== broadcaster.id && (
                  <button
                    onClick={() => setEditingId(broadcaster.id)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDelete(broadcaster.id)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#dc2626'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px', 
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastEditor;