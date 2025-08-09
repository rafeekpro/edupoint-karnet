import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@nextui-org/react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigateToDashboard = () => {
    if (user) {
      navigate(`/${user.role}/dashboard`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isBordered>
        <NavbarBrand
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <p className="font-bold text-inherit">Therapy System</p>
        </NavbarBrand>
        
        <NavbarContent justify="end">
          {user ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  name={user.name}
                  size="sm"
                  showFallback
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-default-500">{user.role}</p>
                </DropdownItem>
                <DropdownItem 
                  key="dashboard" 
                  onClick={navigateToDashboard}
                  textValue="Dashboard"
                >
                  Dashboard
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  color="danger" 
                  onClick={logout}
                  textValue="Logout"
                >
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <NavbarItem>
              <Button
                color="primary"
                variant="flat"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </NavbarItem>
          )}
        </NavbarContent>
      </Navbar>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <footer className="bg-gray-100 py-6 px-4 mt-auto">
        <div className="container mx-auto text-center">
          <p className="text-sm text-gray-600">
            © 2024 Therapy System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;