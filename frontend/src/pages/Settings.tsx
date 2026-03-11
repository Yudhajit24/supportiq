import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { User, Bell, Shield, Link2, Users, Palette, Save, Check, X, Plus, Mail, AlertTriangle } from 'lucide-react';

export default function Settings() {
    const { user, isDark, toggleDark } = useAuth();
    const [tab, setTab] = useState('profile');
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' });
    const [notifications, setNotifications] = useState<Record<string, boolean>>({
        'Email notifications': true,
        'Browser notifications': true,
        'Ticket assignments': true,
        'SLA breach alerts': true,
        'Daily summary': false,
        'Weekly report': true,
    });
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
    const [twoFA, setTwoFA] = useState(false);
    const [integrations, setIntegrations] = useState([
        { name: 'Zendesk', status: 'Not connected', connected: false },
        { name: 'Email (SMTP)', status: 'Connected', connected: true },
        { name: 'Slack', status: 'Not connected', connected: false },
        { name: 'Jira', status: 'Not connected', connected: false },
    ]);
    const [teamMembers, setTeamMembers] = useState([
        { name: 'Mike Johnson', role: 'Agent' },
        { name: 'Emily Davis', role: 'Agent' },
        { name: 'Alex Rivera', role: 'Agent' },
        { name: 'Lisa Park', role: 'Manager' },
    ]);
    const [editingMember, setEditingMember] = useState<number | null>(null);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [passError, setPassError] = useState('');

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleToggleNotif = (key: string) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleToggleIntegration = (index: number) => {
        setIntegrations(prev => prev.map((int, i) =>
            i === index ? { ...int, connected: !int.connected, status: int.connected ? 'Not connected' : 'Connected' } : int
        ));
    };

    const handlePasswordChange = () => {
        if (passwords.newPass !== passwords.confirm) {
            setPassError('Passwords do not match');
            return;
        }
        if (passwords.newPass.length < 6) {
            setPassError('Password must be at least 6 characters');
            return;
        }
        setPassError('');
        setPasswords({ current: '', newPass: '', confirm: '' });
        handleSave();
    };

    const handleInvite = () => {
        if (!inviteEmail.trim()) return;
        setTeamMembers(prev => [...prev, { name: inviteEmail.split('@')[0], role: 'Agent' }]);
        setInviteEmail('');
        setShowInvite(false);
    };

    const handleRemoveMember = (index: number) => {
        setTeamMembers(prev => prev.filter((_, i) => i !== index));
    };

    const handleRoleChange = (index: number, role: string) => {
        setTeamMembers(prev => prev.map((m, i) => i === index ? { ...m, role } : m));
        setEditingMember(null);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'integrations', label: 'Integrations', icon: Link2 },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'appearance', label: 'Appearance', icon: Palette },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="font-heading text-3xl font-extrabold tracking-tighter">Settings</h2>

            <div className="flex gap-1 flex-wrap">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-heading font-bold rounded-xl border-2 border-black transition-all ${tab === t.id ? 'bg-nb-charcoal text-white shadow-nb-sm' : 'bg-white hover:bg-nb-yellow'}`}>
                        <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                ))}
            </div>

            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="nb-card-lg p-6">
                {tab === 'profile' && (
                    <div className="space-y-5">
                        <h3 className="font-heading text-xl font-extrabold">Profile</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-nb-charcoal border-2 border-black flex items-center justify-center text-nb-yellow text-2xl font-heading font-extrabold shadow-nb-sm">
                                {profile.fullName?.charAt(0) || 'D'}
                            </div>
                            <div>
                                <p className="font-heading font-bold">{profile.fullName}</p>
                                <p className="text-sm font-body text-muted-foreground">{profile.email}</p>
                                <span className="nb-badge bg-nb-yellow text-xs mt-1">{user?.role}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-heading font-bold mb-1.5">Full Name</label>
                            <input type="text" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="nb-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-heading font-bold mb-1.5">Email</label>
                            <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="nb-input" />
                        </div>
                    </div>
                )}

                {tab === 'notifications' && (
                    <div className="space-y-3">
                        <h3 className="font-heading text-xl font-extrabold">Notifications</h3>
                        {Object.entries(notifications).map(([item, enabled]) => (
                            <div key={item} className="flex items-center justify-between py-3 border-b-2 border-black/10">
                                <span className="text-sm font-heading font-bold">{item}</span>
                                <button onClick={() => handleToggleNotif(item)}
                                    className={`w-12 h-7 rounded-xl border-2 border-black relative transition-all shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${enabled ? 'bg-nb-charcoal' : 'bg-gray-200'}`}>
                                    <div className={`w-5 h-5 rounded-lg bg-nb-yellow border border-black absolute top-0.5 transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'security' && (
                    <div className="space-y-5">
                        <h3 className="font-heading text-xl font-extrabold">Security</h3>
                        <div>
                            <label className="block text-sm font-heading font-bold mb-1.5">Current Password</label>
                            <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="nb-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-heading font-bold mb-1.5">New Password</label>
                            <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="nb-input" />
                        </div>
                        <div>
                            <label className="block text-sm font-heading font-bold mb-1.5">Confirm New Password</label>
                            <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="nb-input" />
                        </div>
                        {passError && (
                            <div className="nb-badge bg-red-100 text-red-700 border-red-400 w-full justify-center">
                                <AlertTriangle className="w-3 h-3" /> {passError}
                            </div>
                        )}
                        <button onClick={handlePasswordChange} disabled={!passwords.current || !passwords.newPass}
                            className="nb-btn nb-btn-yellow nb-btn-sm disabled:opacity-40 disabled:cursor-not-allowed">
                            Update Password
                        </button>
                        <div className="flex items-center justify-between py-3 border-t-2 border-black/10">
                            <div>
                                <p className="text-sm font-heading font-bold">Two-Factor Auth</p>
                                <p className="text-xs font-body text-muted-foreground">{twoFA ? 'Enabled — extra security active' : 'Add extra security to your account'}</p>
                            </div>
                            <button onClick={() => { setTwoFA(!twoFA); handleSave(); }}
                                className={`nb-btn nb-btn-sm ${twoFA ? 'nb-btn-sage' : 'nb-btn-yellow'}`}>
                                {twoFA ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                    </div>
                )}

                {tab === 'integrations' && (
                    <div className="space-y-3">
                        <h3 className="font-heading text-xl font-extrabold">Integrations</h3>
                        {integrations.map((int, index) => (
                            <div key={int.name} className="flex items-center justify-between p-4 rounded-xl border-2 border-black bg-white shadow-nb-sm">
                                <div>
                                    <p className="font-heading font-bold text-sm">{int.name}</p>
                                    <p className={`text-xs font-body ${int.connected ? 'text-green-700 font-bold' : 'text-muted-foreground'}`}>{int.status}</p>
                                </div>
                                <button onClick={() => handleToggleIntegration(index)}
                                    className={`nb-btn nb-btn-sm ${int.connected ? 'nb-btn-sage' : 'nb-btn-yellow'}`}>
                                    {int.connected ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'team' && (
                    <div className="space-y-3">
                        <h3 className="font-heading text-xl font-extrabold">Team ({teamMembers.length})</h3>
                        {teamMembers.map((m, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-xl border-2 border-black bg-white shadow-nb-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-nb-charcoal border-2 border-black flex items-center justify-center text-nb-yellow text-xs font-bold">{m.name[0]}</div>
                                    <div>
                                        <span className="text-sm font-heading font-bold">{m.name}</span>
                                        {editingMember === index ? (
                                            <div className="flex gap-1 mt-1">
                                                {['Agent', 'Manager', 'Admin'].map(r => (
                                                    <button key={r} onClick={() => handleRoleChange(index, r)}
                                                        className={`px-2 py-0.5 text-[10px] font-heading font-bold rounded-lg border border-black ${m.role === r ? 'bg-nb-charcoal text-white' : 'bg-white hover:bg-nb-yellow'}`}>
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs font-body text-muted-foreground">{m.role}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => setEditingMember(editingMember === index ? null : index)}
                                        className="nb-btn nb-btn-sm nb-btn-white">{editingMember === index ? 'Done' : 'Edit'}</button>
                                    <button onClick={() => handleRemoveMember(index)}
                                        className="w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center text-red-500 hover:bg-red-50">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <AnimatePresence>
                            {showInvite ? (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="flex gap-2 overflow-hidden">
                                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleInvite()}
                                        placeholder="email@company.com" className="nb-input flex-1" autoFocus />
                                    <button onClick={handleInvite} disabled={!inviteEmail.trim()} className="nb-btn nb-btn-yellow nb-btn-sm disabled:opacity-40">
                                        <Mail className="w-3.5 h-3.5" /> Send
                                    </button>
                                    <button onClick={() => { setShowInvite(false); setInviteEmail(''); }}
                                        className="nb-btn nb-btn-white nb-btn-sm">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <button onClick={() => setShowInvite(true)}
                                    className="w-full py-3 text-sm font-heading font-bold border-2 border-dashed border-black rounded-xl hover:bg-nb-yellow transition-colors flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Invite Member
                                </button>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {tab === 'appearance' && (
                    <div className="space-y-4">
                        <h3 className="font-heading text-xl font-extrabold">Appearance</h3>
                        <div className="flex items-center justify-between py-3">
                            <div>
                                <p className="text-sm font-heading font-bold">Dark Mode</p>
                                <p className="text-xs font-body text-muted-foreground">{isDark ? 'Dark theme active' : 'Light theme active'}</p>
                            </div>
                            <button onClick={toggleDark}
                                className={`w-14 h-8 rounded-xl border-2 border-black relative transition-all shadow-nb-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${isDark ? 'bg-nb-charcoal' : 'bg-nb-sage'}`}>
                                <div className={`w-6 h-6 rounded-lg bg-nb-yellow border border-black absolute top-0.5 transition-all ${isDark ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="flex justify-end">
                <button onClick={handleSave} className="nb-btn nb-btn-yellow shadow-nb-lg">
                    {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}
