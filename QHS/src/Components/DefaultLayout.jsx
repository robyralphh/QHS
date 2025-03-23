import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useStateContext } from "../Context/ContextProvider";
import axiosClient from "../axiosClient";
import { useEffect, useState, useMemo, useCallback } from "react"; 
import * as React from 'react';
import * as Mui from '../assets/muiImports';
import { Avatar } from "@mui/material";
import { getInitials } from "../utils";

// Clock Component
const Clock = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Function to update the clock and date
  const updateClock = useCallback(() => {
    const now = new Date();
    const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "PM" : "AM";
    const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
    const dateString = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentTime(timeString);
    setCurrentDate(dateString);
  }, []);

  // Update the clock every second
  useEffect(() => {
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [updateClock]);

  return (
    <>
      <Mui.Typography variant="body1" sx={{ marginRight: 2 }}>
        {currentTime}
      </Mui.Typography>
      <Mui.Typography variant="body1">
        {currentDate}
      </Mui.Typography>
    </>
  );
};

export default function DefaultLayout() {
  const { user, token, setUser, setToken } = useStateContext();
  const location = useLocation();
  const [title, setTitle] = useState("Admin"); 
  const drawerWidth = 240;
  const theme = Mui.useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Logout handler
  const onLogout = (ev) => {
    ev.preventDefault();
    axiosClient.get('/logout')
      .then(() => {
        setUser(null);
        setToken(null);
      });
  };

  // Fetch user data on component mount
  useEffect(() => {
    axiosClient.get("/user")
      .then(({ data }) => {
        setUser(data);
      });
  }, []);

  useEffect(() => {
    const getTitleFromPath = (pathname) => {
      if (pathname.startsWith("/admin/users")) {
        return "User Management";
      } else if (pathname.startsWith("/admin/lab")) {
        return "Laboratories";
      } else if (pathname.startsWith("/admin/equipment")) {
        return "Equipments and Items";
      } else if (pathname.startsWith("/admin/transactions")) {
        return "Transactions";
      } else {
        return "Dashboard";
      }
    };
    setTitle(getTitleFromPath(location.pathname)); 
  }, [location.pathname]); 

  if (!token) {
    return <Navigate to='../auth' />;
  }

  // Styled Components
  const Main = Mui.styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `-${drawerWidth}px`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      }),
    }),
  );

  const AppBar = Mui.styled(Mui.MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  const DrawerHeader = Mui.styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  }));

  return (
    <Mui.Box sx={{ display: 'flex' }}>
      <Mui.CssBaseline />
      <AppBar position="fixed" open={open}>
        <Mui.Toolbar sx={{ backgroundColor: 'maroon' }}>
          <Mui.IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{          
              mr: 1, ...(open && { display: 'none' }) 
            }}
          >
            <Mui.MenuIcon />
          </Mui.IconButton>
          <Mui.Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title} {/* Use state for title */}
          </Mui.Typography>
          {/* Clock and Date */}
          <Clock />
        </Mui.Toolbar>
      </AppBar>
      <Mui.Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Avatar
            src={ 'http://192.168.254.219:8000/storage/' + user.avatar}
            sx={{ width: 44, height: 44, fontSize: 14, m: 'auto' }}
          >
            {!user.avatar && getInitials(user.name)}
          </Avatar>
          {user.name}
          <Mui.IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <Mui.ChevronLeftIcon /> : <Mui.ChevronRightIcon />}
          </Mui.IconButton>
        </DrawerHeader>
        <Mui.Divider />
        <Mui.List>
          <Mui.ListItem>
            <Mui.Typography variant="body" sx={{ color: 'gray'}}>
              Primary 
            </Mui.Typography>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="/admin" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.DashboardIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Dashboard" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="users" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.PeopleIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Users" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="lab" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.ScienceIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Laboratories" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="equipment" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.BiotechIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Equipments" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="transactions" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.BusinessIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Transactions" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="return" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.ReturnIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Returned" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          {/* Maintenance */}
          <Mui.Divider />
          <Mui.ListItem>
            <Mui.Typography variant="body" sx={{ color: 'gray'}}>
              Maintenance
            </Mui.Typography>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="category" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.CategoryIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Category" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="inventory" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.InventoryIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Inventory" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
          <Mui.Divider />
          <Mui.ListItem>
            <Mui.Typography variant="body" sx={{color: 'gray'}}>
              Reports
            </Mui.Typography>
          </Mui.ListItem>
          <Mui.ListItem disablePadding>
            <Link to="logs" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
              <Mui.ListItemButton>
                <Mui.ListItemIcon>
                  <Mui.DescriptionIcon />
                </Mui.ListItemIcon>
                <Mui.ListItemText primary="Logs" />
              </Mui.ListItemButton>
            </Link>
          </Mui.ListItem>
        </Mui.List>
        <Mui.Divider />
        <Mui.ListItem disablePadding>
          <Link to="#" style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}>
            <Mui.ListItemButton onClick={onLogout}>
              <Mui.ListItemIcon>
                <Mui.LogoutIcon />
              </Mui.ListItemIcon>
              <Mui.ListItemText primary="Logout" />
            </Mui.ListItemButton>
          </Link>
        </Mui.ListItem>
      </Mui.Drawer>
      <Main open={open}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Mui.Box>
  );
}