import { useState } from 'react';
import { Input, Badge, Avatar, Dropdown } from 'antd';
import { SearchOutlined, BellOutlined, LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Topbar = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div className="font-semibold text-slate-800 text-sm">{user?.name || 'Admin'}</div>
          <div className="text-xs text-slate-400">{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  const initials = (user?.name || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="bg-white border-b border-slate-100 h-[64px] px-8 flex items-center justify-between flex-shrink-0">
      {/* Left: Page title + Search */}
      <div className="flex items-center gap-6 flex-1">
        <h1 className="text-base font-bold text-slate-800 whitespace-nowrap">{title}</h1>
        <div className="max-w-sm w-full">
          <Input
            prefix={<SearchOutlined className="text-slate-400 text-sm" />}
            placeholder="Search or press '/' for commands"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === '/') e.target.select(); }}
            className="!bg-slate-50 !border-slate-100 hover:!border-sky-300 focus:!border-sky-400 !rounded-xl !text-sm !py-2"
            allowClear
          />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <Badge count={3} size="small" offset={[-2, 2]}>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <BellOutlined className="text-lg" />
          </button>
        </Badge>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-100" />

        {/* User Dropdown */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
          overlayStyle={{ minWidth: 200 }}
        >
          <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all group">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-700 leading-none">{user?.name || 'Super Admin'}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{user?.email || 'admin@cms.com'}</div>
            </div>
            <Avatar
              size={36}
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}
            >
              {initials}
            </Avatar>
          </button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Topbar;
