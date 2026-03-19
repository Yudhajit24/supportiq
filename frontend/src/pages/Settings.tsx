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
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Settings</h2>

            <div className="flex gap-2 nm-inset p-2 rounded-2xl flex-wrap">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl transition-all ${tab === t.id ? 'nm-flat text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        <t.icon className={`w-4 h-4 ${tab === t.id ? 'text-primary' : ''}`} /> {t.label}
                    </button>
                ))}
            </div>

            <motion.div key={tab} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="nm-flat p-8 rounded-[32px]">
                {tab === 'profile' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-extrabold mb-6">Profile Information</h3>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-24 h-24 rounded-full nm-inset flex items-center justify-center text-primary text-4xl font-extrabold relative overflow-hidden group">
                                {profile.fullName?.charAt(0) || 'D'}
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">Edit</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{profile.fullName}</p>
                                <p className="text-sm font-medium text-muted-foreground mt-1">{profile.email}</p>
                                <div className="mt-3 inline-flex px-3 py-1 rounded-full nm-flat text-xs font-extrabold uppercase tracking-wider text-accent-emerald">
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Full Name</label>
                                <input type="text" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Email Address</label>
                                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold" />
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'notifications' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-extrabold mb-6">Notification Preferences</h3>
                        <div className="space-y-4">
                            {Object.entries(notifications).map(([item, enabled]) => (
                                <div key={item} className="flex items-center justify-between p-4 nm-inset rounded-2xl bg-background/20">
                                    <span className="text-[15px] font-bold text-foreground">{item}</span>
                                    <button onClick={() => handleToggleNotif(item)}
                                        className={`w-14 h-8 rounded-full relative transition-all flex items-center p-1 ${enabled ? 'nm-flat' : 'nm-inset'}`}>
                                        <div className={`w-6 h-6 rounded-full transition-all shadow-sm ${enabled ? 'bg-primary translate-x-6' : 'bg-muted-foreground/40 translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'security' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-extrabold mb-6">Security Settings</h3>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Current Password</label>
                                <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">New Password</label>
                                <input type="password" value={passwords.newPass} onChange={e => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold font-mono" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Confirm New Password</label>
                                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full nm-inset px-5 py-4 rounded-2xl bg-transparent outline-none text-foreground font-semibold font-mono" />
                            </div>
                        </div>
                        {passError && (
                            <div className="p-4 nm-inset rounded-2xl flex items-center gap-2 text-accent-rose font-bold text-sm bg-accent-rose/10">
                                <AlertTriangle className="w-5 h-5" /> {passError}
                            </div>
                        )}
                        <button onClick={handlePasswordChange} disabled={!passwords.current || !passwords.newPass}
                            className="nm-button px-8 py-4 font-bold disabled:opacity-40 w-full text-foreground hover:text-primary transition-colors">
                            Update Password
                        </button>

                        <div className="pt-8 mt-8 border-t-[1px] border-border/10">
                            <div className="flex items-center justify-between p-6 nm-inset rounded-2xl bg-background/20">
                                <div>
                                    <p className="text-lg font-bold">Two-Factor Auth</p>
                                    <p className="text-sm font-medium text-muted-foreground mt-1">
                                        {twoFA ? 'Enabled — extra security active' : 'Add extra security to your account'}
                                    </p>
                                </div>
                                <button onClick={() => { setTwoFA(!twoFA); handleSave(); }}
                                    className={`nm-button px-6 py-3 font-bold ${twoFA ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                                    {twoFA ? 'Disable' : 'Enable 2FA'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'integrations' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-extrabold mb-6">Connected Apps</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {integrations.map((int, index) => (
                                <div key={int.name} className="flex items-center justify-between p-6 rounded-2xl nm-inset bg-background/20">
                                    <div>
                                        <p className="font-bold text-lg mb-1">{int.name}</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${int.connected ? 'bg-accent-emerald shadow-[0_0_8px_var(--accent-emerald)]' : 'bg-muted-foreground'}`} />
                                            <p className={`text-xs font-bold tracking-widest uppercase ${int.connected ? 'text-accent-emerald' : 'text-muted-foreground'}`}>{int.status}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleToggleIntegration(index)}
                                        className={`nm-button w-12 h-12 flex items-center justify-center rounded-full ${int.connected ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                                        {int.connected ? <Link2 className="w-5 h-5 opacity-50 block" /> : <Plus className="w-5 h-5" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'team' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-extrabold">Team Members <span className="opacity-40">({teamMembers.length})</span></h3>
                        </div>
                        <div className="space-y-4">
                            {teamMembers.map((m, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-2xl nm-inset bg-background/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full nm-flat flex items-center justify-center text-primary text-xl font-extrabold">
                                            {m.name[0]}
                                        </div>
                                        <div>
                                            <span className="text-[15px] font-bold block">{m.name}</span>
                                            {editingMember === index ? (
                                                <div className="flex gap-2 mt-2">
                                                    {['Agent', 'Manager', 'Admin'].map(r => (
                                                        <button key={r} onClick={() => handleRoleChange(index, r)}
                                                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${m.role === r ? 'nm-flat text-primary' : 'nm-button text-muted-foreground hover:text-foreground'}`}>
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mt-1">{m.role}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditingMember(editingMember === index ? null : index)}
                                            className="nm-button px-4 py-2 font-bold text-sm text-foreground">
                                            {editingMember === index ? 'Done' : 'Edit'}
                                        </button>
                                        <button onClick={() => handleRemoveMember(index)}
                                            className="nm-button w-10 h-10 flex items-center justify-center text-accent-rose rounded-full">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <AnimatePresence>
                            {showInvite ? (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    className="flex gap-3 overflow-hidden mt-6">
                                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleInvite()}
                                        placeholder="email@company.com" className="nm-inset flex-1 px-5 py-4 rounded-2xl bg-transparent outline-none font-semibold text-foreground placeholder:text-muted-foreground/50" autoFocus />
                                    <button onClick={handleInvite} disabled={!inviteEmail.trim()} className="nm-button px-8 font-bold text-primary disabled:opacity-40">
                                        <Mail className="w-4 h-4 mr-2 inline-block" /> Send Invite
                                    </button>
                                    <button onClick={() => { setShowInvite(false); setInviteEmail(''); }}
                                        className="nm-button w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0">
                                        <X className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </motion.div>
                            ) : (
                                <button onClick={() => setShowInvite(true)}
                                    className="w-full py-5 text-sm font-bold uppercase tracking-widest text-primary border-2 border-dashed border-border/10 rounded-2xl hover:bg-background/40 transition-colors flex items-center justify-center gap-2 mt-6">
                                    <Plus className="w-5 h-5" /> Invite New Member
                                </button>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {tab === 'appearance' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-extrabold mb-6">Appearance</h3>
                        <div className="flex items-center justify-between p-6 nm-inset rounded-2xl bg-background/20">
                            <div>
                                <p className="text-lg font-bold mb-1">Theme Mode</p>
                                <p className="text-sm font-medium text-muted-foreground">{isDark ? 'Dark theme active' : 'Light theme active'}</p>
                            </div>
                            <button onClick={toggleDark}
                                className={`w-16 h-8 rounded-full relative transition-all flex items-center p-1 ${isDark ? 'nm-flat' : 'nm-inset'}`}>
                                <div className={`w-6 h-6 rounded-full transition-all shadow-sm ${isDark ? 'bg-primary translate-x-8' : 'bg-muted-foreground/40 translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            <div className="flex justify-end pt-4">
                <button onClick={handleSave} className="nm-button px-8 py-4 font-bold flex items-center gap-2 text-primary shadow-lg shadow-background/10">
                    {saved ? <><Check className="w-5 h-5 text-accent-emerald" /> Saved Successfully!</> : <><Save className="w-5 h-5" /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}
