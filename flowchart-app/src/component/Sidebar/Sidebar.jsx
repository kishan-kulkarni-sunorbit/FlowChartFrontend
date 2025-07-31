import React from "react";
import { List, ListItem, ListItemText, Box } from "@mui/material";

const Sidebar = ({ flowcharts, onSelectFlowchart }) => {
  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "#f0f0f0",
        height: "100vh",
        overflowY: "auto",
        borderRight: "1px solid #ccc",
      }}
    >
      <List>
        {flowcharts.map((fc) => (
          <ListItem
            button
            key={fc.flowchart_id}
            onClick={() => onSelectFlowchart(fc.flowchart_id)}
          >
            <ListItemText primary={fc.title} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
