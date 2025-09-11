import React, { useState } from 'react';
import { SIMPLE_BROADCASTERS } from '../services/supabase-simple';

interface Broadcaster {
  id: number;
  name: string;
  editable?: boolean;
}

interface BroadcastEditorProps {
  onClose: () => void;
}

const BroadcastEditor: React.FC<BroadcastEditorProps> = ({ onClose }) => {
  const [broadcasters, setBroadcasters] = useState<Broadcaster[]>(SIMPLE_BROADCASTERS);
  const [newBroadcasterName, setNewBroadcasterName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddBroadcaster = () => {
    if (!newBroadcasterName.trim()) return;
    
    const newId = Math.max(...broadcasters.map(b => b.id)) + 1;
    const newBroadcaster: Broadcaster = {
      id: newId,
      name: newBroadcasterName.trim(),
      editable: true
    };
    
    setBroadcasters([...broadcasters, newBroadcaster]);
    setNewBroadcasterName('');
  };

  const handleEditBroadcaster = (id: number, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim() || editingId === null) return;
    
    setBroadcasters(prev => prev.map(b => 
      b.id === editingId ? { ...b, name: editingName.trim() } : b
    ));
    setEditingId(null);
    setEditingName('');
  };

  const handleDeleteBroadcaster = (id: number) => {
    // Don't allow deleting core broadcasters (Sky Sports, TNT Sports, Blackout)
    if (id <= 999) {
      alert('Cannot delete core broadcasters');
      return;
    }
    
    setBroadcasters(prev => prev.filter(b => b.id !== id));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

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
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        minWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>
            Broadcast Editor
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Add New Broadcaster */}
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: '600' }}>
            Add New Broadcaster
          </h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={newBroadcasterName}
              onChange={(e) => setNewBroadcasterName(e.target.value)}
              placeholder="Enter broadcaster name (e.g., BBC iPlayer, Amazon Prime)"
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBroadcaster()}
            />
            <button
              onClick={handleAddBroadcaster}
              disabled={!newBroadcasterName.trim()}
              className="save-btn"
              style={{ fontSize: '14px' }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Broadcasters List */}
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '600' }}>
            Existing Broadcasters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {broadcasters.map(broadcaster => (
              <div 
                key={broadcaster.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: broadcaster.id <= 999 ? '#fef3f2' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ 
                    fontWeight: '500', 
                    color: broadcaster.id === 999 ? '#dc2626' : '#1f2937',
                    minWidth: '40px',
                    fontSize: '12px'
                  }}>
                    ID: {broadcaster.id}
                  </span>
                  
                  {editingId === broadcaster.id ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          border: '1px solid #6366f1',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        autoFocus
                      />
                      <button 
                        onClick={handleSaveEdit}
                        className="save-btn save-btn-small"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        style={{
                          padding: '4px 8px',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span style={{ flex: 1, fontSize: '14px' }}>
                      {broadcaster.name}
                      {broadcaster.id <= 999 && (
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '12px', 
                          color: '#6b7280',
                          fontStyle: 'italic' 
                        }}>
                          (Core broadcaster)
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {editingId !== broadcaster.id && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleEditBroadcaster(broadcaster.id, broadcaster.name)}
                      style={{
                        padding: '4px 8px',
                        background: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    
                    {broadcaster.id > 999 && (
                      <button
                        onClick={() => handleDeleteBroadcaster(broadcaster.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#fef2f2',
                          border: '1px solid #fca5a5',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#dc2626'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div style={{
          marginTop: '24px',
          padding: '12px',
          background: '#eff6ff',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#1e40af'
        }}>
          <strong>Note:</strong> Changes are only saved locally in this session. 
          To persist changes permanently, you would need to update the database schema and service configuration.
        </div>

        {/* Close Button */}
        <div style={{ 
          marginTop: '24px', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <button 
            onClick={onClose}
            className="save-btn"
            style={{ background: '#6b7280' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BroadcastEditor;