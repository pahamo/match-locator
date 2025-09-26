import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminAuth from '../../components/AdminAuth';

interface Redirect {
  id: string;
  from: string;
  to: string;
  statusCode: number;
  force: boolean;
  comment?: string;
}

const AdminRedirectsPage: React.FC = () => {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [formData, setFormData] = useState({ from: '', to: '', statusCode: 301, force: false, comment: '' });

  useEffect(() => {
    if (isAuthenticated) {
      loadRedirects();
    }
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRedirects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since _redirects file is not served by the web server (it's a Netlify config file),
      // we'll show the known redirects for now. In a real implementation, you would:
      // 1. Create a backend API endpoint that reads the _redirects file from the file system
      // 2. Use a Netlify function to read and manage the _redirects file
      // 3. Store redirects in a database instead of the file system

      // Try to fetch from Netlify function first, then fallback to known content
      let redirectsContent = '';

      try {
        const response = await fetch('/.netlify/functions/get-redirects');
        if (response.ok) {
          redirectsContent = await response.text();
        } else {
          throw new Error('Function failed');
        }
      } catch (err) {
        // Fallback to current known content from _redirects file
        redirectsContent = `# Team URL Redirects
# Redirect old /clubs/ paths to new /club/ paths
/clubs/:slug /club/:slug 301!

# Note: H2H redirects removed - now handled dynamically by JavaScript in HeadToHeadPage
# This eliminates the need for static redirect maintenance and provides better error handling

# Future team redirects can be added here if needed
# Format: /club/old-slug /club/new-slug 301!`;
      }

      console.log('Using redirects content:', redirectsContent);
      const parsedRedirects = parseRedirectsFile(redirectsContent);
      console.log('Parsed redirects:', parsedRedirects);
      setRedirects(parsedRedirects);
    } catch (err) {
      console.error('Failed to load redirects:', err);
      setError(`Failed to load redirects: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const parseRedirectsFile = (content: string): Redirect[] => {
    const lines = content.split('\n');
    const redirects: Redirect[] = [];
    let currentComment = '';

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        currentComment = '';
        return;
      }

      // Handle comments
      if (trimmed.startsWith('#')) {
        currentComment = trimmed.substring(1).trim();
        return;
      }

      // Parse redirect line
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3) {
        const from = parts[0];
        const to = parts[1];
        const statusCode = parseInt(parts[2]) || 301;
        const force = parts.includes('!') || parts[2].includes('!');

        redirects.push({
          id: `redirect-${index}`,
          from,
          to,
          statusCode: force ? parseInt(parts[2].replace('!', '')) : statusCode,
          force,
          comment: currentComment || undefined
        });

        currentComment = ''; // Reset comment after using it
      }
    });

    return redirects;
  };

  const getRedirectTypeLabel = (redirect: Redirect): string => {
    if (redirect.statusCode === 301) return 'Permanent';
    if (redirect.statusCode === 302) return 'Temporary';
    if (redirect.statusCode === 200) return 'Rewrite';
    return `${redirect.statusCode}`;
  };

  const getRedirectTypeBadge = (redirect: Redirect): string => {
    if (redirect.statusCode === 301) return 'bg-blue-100 text-blue-800';
    if (redirect.statusCode === 302) return 'bg-yellow-100 text-yellow-800';
    if (redirect.statusCode === 200) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleEditRedirect = (redirect: Redirect) => {
    setEditingRedirect(redirect);
    setFormData({
      from: redirect.from,
      to: redirect.to,
      statusCode: redirect.statusCode,
      force: redirect.force,
      comment: redirect.comment || ''
    });
    setShowAddModal(true);
  };

  const handleDeleteRedirect = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this redirect?')) {
      return;
    }

    try {
      const updatedRedirects = redirects.filter(r => r.id !== id);
      await saveRedirectsToFile(updatedRedirects);
      setRedirects(updatedRedirects);
      setSuccess('Redirect deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to delete redirect:', err);
      setError('Failed to delete redirect');
    }
  };

  const handleSaveRedirect = async () => {
    if (!formData.from || !formData.to) {
      setError('From and To fields are required');
      return;
    }

    try {
      const newRedirect: Redirect = {
        id: editingRedirect?.id || `redirect-${Date.now()}`,
        from: formData.from,
        to: formData.to,
        statusCode: formData.statusCode,
        force: formData.force,
        comment: formData.comment || undefined
      };

      let updatedRedirects;
      if (editingRedirect) {
        updatedRedirects = redirects.map(r => r.id === editingRedirect.id ? newRedirect : r);
      } else {
        updatedRedirects = [...redirects, newRedirect];
      }

      await saveRedirectsToFile(updatedRedirects);
      setRedirects(updatedRedirects);
      setShowAddModal(false);
      setEditingRedirect(null);
      setFormData({ from: '', to: '', statusCode: 301, force: false, comment: '' });
      setSuccess(`Redirect ${editingRedirect ? 'updated' : 'added'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save redirect:', err);
      setError('Failed to save redirect');
    }
  };

  const saveRedirectsToFile = async (redirectsToSave: Redirect[]) => {
    const content = generateRedirectsFileContent(redirectsToSave);

    // Note: In a real implementation, you would need a backend endpoint to save files
    // For now, this is a placeholder that demonstrates the functionality
    console.log('Would save to _redirects file:', content);

    // You could implement this with:
    // 1. A backend API endpoint that writes to the _redirects file
    // 2. A Netlify function that updates the file
    // 3. Integration with your deployment pipeline
    throw new Error('File saving not implemented - needs backend endpoint');
  };

  const generateRedirectsFileContent = (redirectsToSave: Redirect[]): string => {
    const lines: string[] = [];

    // Add header comment
    lines.push('# Team URL Redirects');
    lines.push('# Managed by Admin Interface');
    lines.push('');

    redirectsToSave.forEach(redirect => {
      if (redirect.comment) {
        lines.push(`# ${redirect.comment}`);
      }

      const forceFlag = redirect.force ? '!' : '';
      lines.push(`${redirect.from} ${redirect.to} ${redirect.statusCode}${forceFlag}`);
      lines.push('');
    });

    return lines.join('\n');
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout title="Redirect Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redirect Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage URL redirects and URL rewriting rules
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadRedirects}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                setFormData({ from: '', to: '', statusCode: 301, force: false, comment: '' });
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Redirect
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading redirects...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">⚠️ {error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 text-sm">✅ {success}</div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Current Redirects ({redirects.length})
                </h2>
                <div className="text-sm text-gray-500">
                  Source: public/_redirects (demo data)
                </div>
              </div>
            </div>

            {redirects.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No redirects found</h3>
                <p className="text-gray-600">
                  No redirect rules are currently configured in _redirects file.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Force
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {redirects.map((redirect) => (
                      <tr key={redirect.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {redirect.from}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {redirect.to}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRedirectTypeBadge(redirect)}`}>
                            {getRedirectTypeLabel(redirect)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {redirect.force ? (
                            <span className="text-red-600 text-sm font-semibold">!</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {redirect.comment ? (
                            <span className="text-sm text-gray-600 italic">
                              {redirect.comment}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditRedirect(redirect)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRedirect(redirect.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-600 text-lg mr-3">💡</div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-2">About Redirects</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>301 (Permanent):</strong> Permanently moved, passes SEO value</li>
                <li><strong>302 (Temporary):</strong> Temporarily moved, doesn't pass SEO value</li>
                <li><strong>200 (Rewrite):</strong> Internal rewrite, URL stays the same</li>
                <li><strong>Force (!):</strong> Override existing files/routes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-yellow-600 text-lg mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">Implementation Status</h3>
              <p className="text-sm text-yellow-800">
                <strong>Current:</strong> Displays known redirects from your _redirects file (hardcoded for demo).<br/>
                <strong>Limitation:</strong> The _redirects file is not served by the web server - it's a Netlify configuration file.
              </p>
              <p className="text-sm text-yellow-800 mt-2">
                <strong>To make this fully functional, implement one of:</strong>
              </p>
              <ul className="text-sm text-yellow-800 space-y-1 mt-1">
                <li>• <strong>Netlify Function:</strong> Read/write _redirects file from server-side function</li>
                <li>• <strong>Database Storage:</strong> Store redirects in Supabase instead of flat file</li>
                <li>• <strong>GitHub API:</strong> Directly edit _redirects file via GitHub API</li>
                <li>• <strong>Build Integration:</strong> Generate _redirects file during build process</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Add/Edit Redirect Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRedirect ? 'Edit Redirect' : 'Add New Redirect'}
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Path
                  </label>
                  <input
                    type="text"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    placeholder="/old-path/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Path
                  </label>
                  <input
                    type="text"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="/new-path/:splat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Code
                  </label>
                  <select
                    value={formData.statusCode}
                    onChange={(e) => setFormData({ ...formData, statusCode: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={301}>301 - Permanent Redirect</option>
                    <option value={302}>302 - Temporary Redirect</option>
                    <option value={200}>200 - Rewrite (Proxy)</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="force"
                    checked={formData.force}
                    onChange={(e) => setFormData({ ...formData, force: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="force" className="ml-2 block text-sm text-gray-900">
                    Force redirect (override existing files)
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Description of this redirect"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRedirect(null);
                    setFormData({ from: '', to: '', statusCode: 301, force: false, comment: '' });
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRedirect}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRedirect ? 'Update' : 'Add'} Redirect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRedirectsPage;