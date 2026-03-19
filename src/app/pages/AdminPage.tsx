import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  MapPin, 
  Lock, 
  ChevronRight,
  Loader2,
  Trash,
  ClipboardList,
  Check,
  Ban,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchFuelStations, adminSeedFromOSM, adminResetStations } from '../services/osmService';
import { API_BASE } from '../services/api';
import type { FuelStation } from '../types';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export function AdminPage() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stations' | 'requests'>('stations');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetActionType, setResetActionType] = useState<'reset' | 'seed'>('reset');
  const [resetPassword, setResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    nameSi: '',
    nameTa: '',
    address: '',
    addressSi: '',
    addressTa: '',
    lat: 0,
    lng: 0,
    stationCode: ''
  });

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem('adminAuth');
    if (auth) {
      setIsAuthenticated(true);
      fetchStations();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFuelStations();
      setStations(data);
    } catch (error) {
      toast.error('Failed to fetch stations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequests = async () => {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) return;
    
    setIsRequestsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/requests`, {
        headers: { 'Authorization': auth }
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setIsRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('adminAuth', `Bearer ${data.token}`);
        setIsAuthenticated(true);
        fetchStations();
        toast.success('Authenticated successfully');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setStations([]);
  };

  const handleSeedFromOSM = async () => {
    if (!resetPassword) {
      toast.error('Password is required');
      return;
    }

    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) return;
    
    setIsResetting(true);
    try {
      const result = await adminSeedFromOSM(auth, resetPassword);
      toast.success(`Seeded ${result.count} stations from OSM`);
      setIsResetModalOpen(false);
      setResetPassword('');
      fetchStations();
      
      // Scroll to the top of the station list/management area after seeding
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      toast.error(error.message || 'Seed failed');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetStations = async () => {
    if (!resetPassword) {
      toast.error('Password is required');
      return;
    }

    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) return;

    setIsResetting(true);
    try {
      await adminResetStations(auth, resetPassword);
      toast.success('All station data reset to defaults');
      setIsResetModalOpen(false);
      setResetPassword('');
      fetchStations();
    } catch (error: any) {
      toast.error(error.message || 'Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  const startEdit = (station: FuelStation) => {
    setIsEditing(station.id);
    setIsAdding(false);
    setFormData({
      name: station.name || '',
      nameSi: station.nameSi || '',
      nameTa: station.nameTa || '',
      address: station.address || '',
      addressSi: station.addressSi || '',
      addressTa: station.addressTa || '',
      lat: station.coordinates[0],
      lng: station.coordinates[1],
      stationCode: station.stationCode || ''
    });
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      nameSi: '',
      nameTa: '',
      address: '',
      addressSi: '',
      addressTa: '',
      lat: 7.8731, // Default SL center
      lng: 80.7718,
      stationCode: ''
    });
  };

  const saveStation = async () => {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) return;

    try {
      const url = isEditing 
        ? `${API_BASE}/admin/stations/${isEditing}` 
        : `${API_BASE}/admin/stations`;
      
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': auth
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(isEditing ? 'Station updated' : 'Station added');
        setIsEditing(null);
        setIsAdding(false);
        fetchStations();
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to save station');
      }
    } catch (error) {
      toast.error('Error saving station');
    }
  };

  const deleteStation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this station?')) return;
    
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) return;

    try {
      const response = await fetch(`${API_BASE}/admin/stations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': auth }
      });

      if (response.ok) {
        toast.success('Station deleted');
        fetchStations();
      } else {
        toast.error('Failed to delete station');
      }
    } catch (error) {
      toast.error('Error deleting station');
    }
  };

  const handleRequestStatus = async (id: number, status: string) => {
    const auth = sessionStorage.getItem('adminAuth');
    if (!auth) return;

    try {
      const response = await fetch(`${API_BASE}/admin/requests/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': auth 
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Request ${status}`);
        fetchRequests();
      }
    } catch (error) {
      toast.error('Failed to update request status');
    }
  };

  const applyRequest = (req: any) => {
    if (req.type === 'update_station') {
      setIsEditing(req.stationId.toString());
      setIsAdding(false);
    } else {
      setIsAdding(true);
      setIsEditing(null);
    }
    
    setFormData({
      name: req.name || '',
      nameSi: req.nameSi || '',
      nameTa: req.nameTa || '',
      address: req.address || '',
      addressSi: req.addressSi || '',
      addressTa: req.addressTa || '',
      lat: req.lat || 0,
      lng: req.lng || 0,
      stationCode: req.stationCode || ''
    });
    
    toast.info('Request details applied to form', {
      description: 'Review and save to update the database.'
    });
  };

  const filteredStations = stations.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.stationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-[#121212]' : 'bg-gray-50'}`}>
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-500" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Sign In</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 lg:p-8 ${theme === 'dark' ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto space-y-6 pb-24">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Station Management</h1>
            <p className="text-muted-foreground">Add, edit, or remove fuel stations from across the island.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
            <Button variant="outline" onClick={() => { setResetActionType('reset'); setIsResetModalOpen(true); }} className="text-orange-500 border-orange-500/30 hover:bg-orange-500/10">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset Data
            </Button>
            <Button variant="outline" onClick={() => { setResetActionType('seed'); setIsResetModalOpen(true); }} className="text-green-500 border-green-500/30 hover:bg-green-500/10">
              <RefreshCw className="w-4 h-4 mr-2" /> Seed from OSM
            </Button>
            <Button onClick={startAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" /> Add Station
            </Button>
          </div>
        </header>

        <div className="flex gap-1 p-1 rounded-xl bg-gray-800/10 w-fit">
          <Button 
            variant={activeTab === 'stations' ? 'secondary' : 'ghost'} 
            onClick={() => setActiveTab('stations')}
            className="rounded-lg"
          >
            <MapPin className="w-4 h-4 mr-2" /> All Stations
          </Button>
          <Button 
            variant={activeTab === 'requests' ? 'secondary' : 'ghost'} 
            onClick={() => setActiveTab('requests')}
            className="rounded-lg relative"
          >
            <ClipboardList className="w-4 h-4 mr-2" /> Requests
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center font-bold">
                {requests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'stations' ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    className="pl-10" 
                    placeholder="Search stations by ID, name, code or address..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className={`rounded-xl border shadow-sm overflow-hidden ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
                  {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p>Loading stations...</p>
                    </div>
                  ) : filteredStations.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <p>No stations found.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-800/50">
                      {filteredStations.map(station => (
                        <div key={station.id} className="p-4 flex items-center justify-between hover:bg-gray-800/10 transition-colors">
                          <div className="min-w-0 pr-4 flex-1">
                            <div className="flex flex-col gap-1">
                              <p className="font-semibold truncate flex items-center gap-2">
                                <span className="text-[10px] text-gray-500 font-mono shrink-0">#{station.id}</span>
                                <span className="truncate">{station.name}</span>
                              </p>
                              <div className="flex items-center gap-2">
                                {station.stationCode && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
                                    {station.stationCode}
                                  </span>
                                )}
                                <p className="text-xs text-muted-foreground truncate">{station.address}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-4">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => startEdit(station)}
                              className={isEditing === station.id ? 'bg-blue-500/10 text-blue-500' : ''}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10" 
                              onClick={() => deleteStation(station.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                 {isRequestsLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p>Loading requests...</p>
                    </div>
                 ) : requests.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground rounded-xl border border-dashed">
                      <p>No community requests yet.</p>
                    </div>
                 ) : (
                    <div className="grid gap-4 pr-1">
                      {requests.sort((a,b) => b.id - a.id).map(req => (
                        <Card key={req.id} className={`${req.status === 'pending' ? 'border-l-4 border-l-blue-500' : 'opacity-60'}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.type === 'add_station' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {req.type.replace('_', ' ')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'pending' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                    {req.status}
                                  </span>
                                </div>
                                <h3 className="font-bold text-lg">{req.name}</h3>
                                {req.stationId && (
                                  <p className="text-[10px] font-mono text-blue-500 mt-1">Station ID: {req.stationId}</p>
                                )}
                                <p className="text-sm text-muted-foreground">{req.address}</p>
                                {req.message && (
                                  <div className="mt-3 p-3 rounded-lg bg-gray-800/20 text-sm italic">
                                    <MessageSquare className="w-3 h-3 inline mr-2 opacity-50" />
                                    {req.message}
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2">
                                {req.status === 'pending' && (
                                  <>
                                    <Button size="sm" onClick={() => applyRequest(req)} className="bg-blue-600 hover:bg-blue-700">
                                      <ChevronRight className="w-4 h-4 mr-1" /> Review & Apply
                                    </Button>
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline" className="flex-1 text-green-500" onClick={() => handleRequestStatus(req.id, 'approved')}>
                                        <Check className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" className="flex-1 text-red-500" onClick={() => handleRequestStatus(req.id, 'rejected')}>
                                        <Ban className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                 )}
              </div>
            )}
          </div>

          {/* Form Side Panel */}
          <div className="space-y-4">
            {(isEditing || isAdding) ? (
              <Card className="lg:sticky lg:top-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{isEditing ? 'Edit Station' : 'Add New Station'}</span>
                    <Button variant="ghost" size="icon" onClick={() => { setIsEditing(null); setIsAdding(false); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Station Name (EN)</Label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="English Name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Station Name (SI)</Label>
                      <Input value={formData.nameSi} onChange={e => setFormData({...formData, nameSi: e.target.value})} placeholder="සිංහල නම" />
                    </div>
                    <div className="space-y-2">
                      <Label>Station Name (TA)</Label>
                      <Input value={formData.nameTa} onChange={e => setFormData({...formData, nameTa: e.target.value})} placeholder="தமிழ் பெயர்" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Latitude</Label>
                        <Input type="number" step="0.000001" value={formData.lat} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Longitude</Label>
                        <Input type="number" step="0.000001" value={formData.lng} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Station Code</Label>
                      <Input value={formData.stationCode} onChange={e => setFormData({...formData, stationCode: e.target.value})} placeholder="e.g., CP-001" />
                    </div>

                    <div className="space-y-2">
                      <Label>Address (EN)</Label>
                      <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={saveStation}>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                    {isEditing && (
                       <Button variant="outline" className="text-red-500 hover:bg-red-500/10 border-red-500/20" onClick={() => deleteStation(isEditing)}>
                         <Trash className="w-4 h-4" />
                       </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={`p-8 rounded-2xl border border-dashed text-center space-y-3 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">No Selection</p>
                  <p className="text-sm text-muted-foreground">Select a station to edit or add a new one.</p>
                </div>
                <Button variant="outline" size="sm" onClick={startAdd}>Add New Now</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add Button - visible only on mobile if not in form */}
      {!isEditing && !isAdding && (
         <div className="fixed bottom-24 right-4 lg:hidden">
           <Button onClick={startAdd} size="lg" className="rounded-full w-14 h-14 shadow-xl bg-blue-600 hover:bg-blue-700 p-0">
             <Plus className="w-8 h-8" />
           </Button>
         </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md border-orange-500/20 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-10 h-10 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {resetActionType === 'reset' ? 'Reset All Data?' : 'Seed from OSM?'}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                {resetActionType === 'reset' 
                  ? 'This action is irreversible. All fuel statuses, wait times, and queue lengths will be reset to default values across all stations.' 
                  : 'This will fetch fuel station data from OpenStreetMap and update the local database. New stations will be added.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-password">Confirm Admin Password</Label>
                <Input 
                  id="reset-password" 
                  type="password" 
                  value={resetPassword} 
                  onChange={e => setResetPassword(e.target.value)} 
                  placeholder="Enter admin password to proceed"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setResetPassword('');
                  }}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  className={`flex-1 ${resetActionType === 'seed' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`} 
                  onClick={resetActionType === 'reset' ? handleResetStations : handleSeedFromOSM}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {resetActionType === 'reset' ? 'Resetting...' : 'Seeding...'}
                    </>
                  ) : (
                    resetActionType === 'reset' ? 'Confirm Reset' : 'Confirm Seed'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
