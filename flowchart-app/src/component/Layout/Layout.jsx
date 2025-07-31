import React from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const drawerWidth = 240;

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* AppBar/Header */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: "#34495e",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Flowchart Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar/Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#2c3e50",
            color: "#fff",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", height: "100%" }}>
          <List>
            <ListItem button>
              <ListItemText primary="All Flowcharts" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Create Flowchart" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          pt: 8, // To avoid overlap with AppBar
          height: "100vh",
          overflow: "auto",
          backgroundColor: "#f4f6f8",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
