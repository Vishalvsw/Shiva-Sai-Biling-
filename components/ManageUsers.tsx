import React, { useState } from 'react';

type AppUser = { password: string; role: 'admin' | 'user' };

interface ManageUsersProps {
    users: { [key: string]: AppUser };
    setUsers: React.Dispatch<React.SetStateAction<{ [key: string]: AppUser }>>;
    onBack: () => void;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ users, setUsers, onBack }) => {
    const [editingUser, setEditingUser] = useState<{ username: string; data: AppUser } | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSave = (username: string, data: AppUser) => {
        if (!username.trim() || !data.password.trim()) {
            alert('Username and password cannot be empty.');
            return;
        }
        setUsers(prev => ({ ...prev, [username]: data }));
        setEditingUser(null);
        setIsCreating(false);
    };

    const handleDelete = (username: string) => {
        const userToDelete = users[username];
        // FIX: Explicitly type `u` to resolve `Property 'role' does not exist on type 'unknown'` error.
        const adminCount = Object.values(users).filter((u: AppUser) => u.role === 'admin').length;

        if (userToDelete.role === 'admin' && adminCount <= 1) {
            alert('Cannot delete the last admin user.');
            return;
        }

        if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            setUsers(prev => {
                const newUsers = { ...prev };
                delete newUsers[username];
                return newUsers;
            });
        }
    };
    
    const UserForm: React.FC<{ user?: { username: string; data: AppUser }, onSave: (username: string, data: AppUser) => void, onCancel: () => void }> = ({ user, onSave, onCancel }) => {
        const [username, setUsername] = useState(user?.username || '');
        const [password, setPassword] = useState('');
        const [role, setRole] = useState<'admin' | 'user'>(user?.data.role || 'user');

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            onSave(username, { password: password || user?.data.password, role });
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-4">
                    <h3 className="text-xl font-bold">{user ? 'Edit User' : 'Create User'}</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            disabled={!!user}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm disabled:bg-slate-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input 
                            type="password" 
                            placeholder={user ? 'Leave blank to keep unchanged' : ''}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        )
    };


    return (
        <div className="space-y-6">
            {(editingUser || isCreating) && <UserForm user={editingUser} onSave={handleSave} onCancel={() => { setEditingUser(null); setIsCreating(false); }} />}
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Manage Users</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Dashboard
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                <div className="flex justify-end">
                    <button onClick={() => setIsCreating(true)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        Add New User
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Username</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Role</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {/* FIX: Explicitly type `[username, data]` to resolve `Property 'role' does not exist on type 'unknown'` error. */}
                            {Object.entries(users).map(([username, data]: [string, AppUser]) => (
                                <tr key={username}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">{username}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 capitalize">{data.role}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                                        <button onClick={() => setEditingUser({ username, data })} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(username)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
