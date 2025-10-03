/**
 * Admin Feature Flag Controls
 *
 * Provides real-time control over feature flags without requiring deployments.
 * Includes master API switch and dependent feature controls.
 */

import React, { useState } from 'react';
import {
  FEATURE_FLAGS,
  getCurrentAPISource,
  isTestMode,
  isComparisonMode
} from '../../config/featureFlags';

interface FeatureFlagControlsProps {
  className?: string;
}

const FeatureFlagControls: React.FC<FeatureFlagControlsProps> = ({ className = '' }) => {
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');

  // Simulate environment variable updates (in real implementation, this would call Netlify API)
  const updateEnvironmentVariable = async (key: string, value: boolean) => {
    setIsUpdating(true);
    setUpdateStatus(`Updating ${key}...`);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In real implementation, this would update Netlify environment variables
      console.log(`Would update REACT_APP_FF_${key} = ${value}`);

      setUpdateStatus(`✅ Updated ${key}`);
      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (error) {
      setUpdateStatus(`❌ Failed to update ${key}`);
      setTimeout(() => setUpdateStatus(''), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleMasterSwitch = async () => {
    const newValue = !flags.dataSources.useSoccersAPI;

    // Update master switch
    await updateEnvironmentVariable('USE_SOCCERSAPI', newValue);

    // If turning off SoccersAPI, disable all dependent features
    const updatedFlags = { ...flags };
    updatedFlags.dataSources.useSoccersAPI = newValue;

    if (!newValue) {
      // Auto-disable all SoccersAPI features
      Object.keys(updatedFlags.soccersAPIFeatures).forEach(key => {
        (updatedFlags.soccersAPIFeatures as any)[key] = false;
      });
      setUpdateStatus('🔄 Auto-disabled dependent features');
    }

    setFlags(updatedFlags);
  };

  const toggleFeature = async (category: string, feature: string, currentValue: boolean) => {
    const newValue = !currentValue;
    const envKey = feature.replace(/([A-Z])/g, '_$1').toUpperCase();

    await updateEnvironmentVariable(envKey, newValue);

    const updatedFlags = { ...flags };
    ((updatedFlags as any)[category] as any)[feature] = newValue;
    setFlags(updatedFlags);
  };

  const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }> = ({ label, checked, onChange, disabled = false }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px',
      backgroundColor: disabled ? 'var(--color-surface-disabled)' : 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-md)',
      marginBottom: '8px',
      opacity: disabled ? 0.6 : 1
    }}>
      <span style={{
        fontSize: '14px',
        color: disabled ? 'var(--color-text-disabled)' : 'var(--color-text)'
      }}>
        {label}
      </span>
      <button
        onClick={onChange}
        disabled={disabled || isUpdating}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s'
        }}
      >
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: 'white',
          position: 'absolute',
          top: '3px',
          left: checked ? '23px' : '3px',
          transition: 'left 0.2s'
        }} />
      </button>
    </div>
  );

  return (
    <div className={`feature-flag-controls ${className}`} style={{
      backgroundColor: 'var(--color-background)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--border-radius-lg)',
      padding: '24px',
      maxWidth: '600px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '18px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚀 Feature Flag Controls
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          margin: 0
        }}>
          Control API sources and feature visibility. Changes apply immediately.
        </p>
      </div>

      {/* Status Display */}
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            Current API Source:
          </span>
          <span style={{
            fontSize: '14px',
            color: getCurrentAPISource() === 'soccersapi' ? 'var(--color-success)' : 'var(--color-warning)',
            fontWeight: '600'
          }}>
            {getCurrentAPISource() === 'soccersapi' ? '🆕 SoccersAPI' : '📊 Football-Data.org'}
          </span>
        </div>
        {isTestMode() && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-warning)' }}>
            ⚠️ Test Mode: Changes are logged but not applied to database
          </div>
        )}
        {isComparisonMode() && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-info)' }}>
            🔍 Comparison Mode: Both APIs running in parallel
          </div>
        )}
      </div>

      {/* Update Status */}
      {updateStatus && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: updateStatus.includes('✅') ? 'var(--color-success-light)' :
                          updateStatus.includes('❌') ? 'var(--color-error-light)' :
                          'var(--color-info-light)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {updateStatus}
        </div>
      )}

      {/* Master API Controls */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '16px',
          marginBottom: '16px',
          color: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎛️ API Source Control
        </h3>

        <ToggleSwitch
          label="Use SoccersAPI (Master Switch)"
          checked={flags.dataSources.useSoccersAPI}
          onChange={toggleMasterSwitch}
        />

        <ToggleSwitch
          label="Test Mode (Log only, don't update DB)"
          checked={flags.dataSources.soccersAPITestMode}
          onChange={() => toggleFeature('dataSources', 'soccersAPITestMode', flags.dataSources.soccersAPITestMode)}
          disabled={!flags.dataSources.useSoccersAPI}
        />

        <ToggleSwitch
          label="Comparison Mode (Run both APIs)"
          checked={flags.dataSources.enableAPIComparison}
          onChange={() => toggleFeature('dataSources', 'enableAPIComparison', flags.dataSources.enableAPIComparison)}
        />
      </div>

      {/* SoccersAPI Features */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '16px',
          marginBottom: '16px',
          color: flags.dataSources.useSoccersAPI ? 'var(--color-text)' : 'var(--color-text-disabled)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚽ SoccersAPI Features
        </h3>

        {!flags.dataSources.useSoccersAPI && (
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--color-warning-light)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--border-radius-md)',
            marginBottom: '16px',
            fontSize: '14px',
            color: 'var(--color-warning-dark)'
          }}>
            ⚠️ Enable SoccersAPI to control these features
          </div>
        )}

        {Object.entries(flags.soccersAPIFeatures).map(([key, value]) => (
          <ToggleSwitch
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            checked={value}
            onChange={() => toggleFeature('soccersAPIFeatures', key, value)}
            disabled={!flags.dataSources.useSoccersAPI}
          />
        ))}
      </div>

      {/* General Features */}
      <div>
        <h3 style={{
          fontSize: '16px',
          marginBottom: '16px',
          color: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📊 General Features
        </h3>

        {Object.entries(flags.generalFeatures).map(([key, value]) => (
          <ToggleSwitch
            key={key}
            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            checked={value}
            onChange={() => toggleFeature('generalFeatures', key, value)}
          />
        ))}
      </div>

      {/* Warning */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        backgroundColor: 'var(--color-info-light)',
        border: '1px solid var(--color-info)',
        borderRadius: 'var(--border-radius-md)',
        fontSize: '14px',
        color: 'var(--color-info-dark)'
      }}>
        💡 <strong>Production Note:</strong> These controls simulate environment variable updates.
        In production, changes would update Netlify environment variables and trigger a rebuild.
      </div>
    </div>
  );
};

export default FeatureFlagControls;