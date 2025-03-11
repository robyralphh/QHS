import { Navigate, Outlet, Link } from "react-router-dom";
import { useStateContext } from "../Context/ContextProvider";
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import * as React from 'react';

// Directly import Material-UI components
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ListItemIcon from '@mui/material/ListItemIcon';
// Directly import Material-UI icons
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ProfileIcon from '@mui/icons-material/Person';
import CartIcon from '@mui/icons-material/ShoppingBasket';



// Define pages with their corresponding links


export default function UserLayout() {
  const { user, token, setUser, setToken } = useStateContext();

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  

  useEffect(() => {
    axiosClient.get("/user")
      .then(({ data }) => {
        setUser(data);
      });
  }, []);

  // Redirect to login if no token is found
  if (!token) {
    return <Navigate to='../auth' />;
  }

  const pages = [
    { name: 'Home', link: '/' },
    { name: 'Laboratories', link: '/laboratories' },
    { name: 'About Us', link: '/#' },
  ];
  
  const settings = [
      {name: user.name.toUpperCase(), icon: <ProfileIcon />},
      {name: 'Cart', icon: <CartIcon />},
      {name: 'Logout', icon: <LogoutIcon />},
  ];
  // Handlers for opening and closing the navigation menu
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Handlers for opening and closing the user menu
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Logout handler
  const onLogout = () => {
    axiosClient.get('/logout')
      .then(() => {
        setUser(null);
        setToken(null);
      });
  };

  return (
    <div>
      {/* ResponsiveAppBar */}
      <AppBar position="sticky" sx={{backgroundColor:'maroon'}}>
        <Container maxWidth="xl" >
         
          <Toolbar disableGutters sx={{gap:'2%'}}>
          
          <Box 
            component="img"
            src="http://192.168.254.219:8000/storage/logo/logo.png"
            sx={{
              display: { xs: "none", md: "flex" }, // Responsive display
              width: "50px",
              height: "50px",
              borderRadius: "50%",
            }}
          />

         
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              
              
              Quirino Highschool
            </Typography>
              
            {/* Mobile Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                    <Link to={page.link} style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
                      <Typography sx={{ textAlign: 'center' }}>{page.name}</Typography>
                    </Link>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Mobile Logo */}
            
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              QHS
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Link
                  key={page.name}
                  to={page.link}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Button
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    {page.name}
                  </Button>
                </Link>
              ))}
            </Box>

            {/* User Menu */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt={user.name.toUpperCase()} src={'http://127.0.0.1:8000/storage/' + user.avatar} />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                 <MenuItem key={setting.name}
                     onClick={setting.name === 'Logout' ? onLogout : handleCloseUserMenu}>
                     <ListItemIcon>
                       {setting.icon}
                     </ListItemIcon>
                     <Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
                 </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Outlet for nested routes */}
      <Outlet />
    </div>
  );
}