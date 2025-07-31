import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import FlowchartPreview from "../FlowchartPreview/FlowchartPreview";

const FlowchartList = () => {
  const [flowcharts, setFlowcharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFlowchartId, setSelectedFlowchartId] = useState(null);
  const [selectedFlowchartNodes, setSelectedFlowchartNodes] = useState([]);

  const [nodeLabel, setNodeLabel] = useState("New Step");
  const [nodeType, setNodeType] = useState("default");
  const [edgeLabel, setEdgeLabel] = useState("next");
  const [sourceNodeId, setSourceNodeId] = useState("");
  const [positionType, setPositionType] = useState("end"); // NEW

  const fetchFlowcharts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/api/flowchart");
      setFlowcharts(response.data);
    } catch (error) {
      console.error("❌ Error fetching flowcharts:", error.message);
      setError("Failed to load flowcharts.");
    } finally {
      setLoading(false);
    }
  };

  const appendToFlowchart = async () => {
    const newNodeId = crypto.randomUUID().slice(0, 6);

    const newNode = {
      id: newNodeId,
      type: nodeType,
      data: { label: nodeLabel },
      position: {
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      },
    };

    const fallbackSource = selectedFlowchartNodes[selectedFlowchartNodes.length - 1];
    const firstNode = selectedFlowchartNodes[0];
    let edgesToAdd = [];

    if (positionType === "start" && firstNode) {
      edgesToAdd.push({
        id: `${newNodeId}-${firstNode.id}`,
        source: newNodeId,
        target: firstNode.id,
        type: "default",
        label: edgeLabel,
      });
    } else if (positionType === "end" || positionType === "both") {
      const sourceId = sourceNodeId || fallbackSource?.id || "1";
      edgesToAdd.push({
        id: `${sourceId}-${newNodeId}`,
        source: sourceId,
        target: newNodeId,
        type: "default",
        label: edgeLabel,
      });
    }

    try {
      await axios.post("http://localhost:5001/api/flowchart/append", {
        flowchart_id: selectedFlowchartId,
        nodes: [newNode],
        edges: edgesToAdd,
        positionType, // NEW
      });

      await fetchFlowcharts();
      handleCloseDialog();
    } catch (err) {
      console.error("❌ Error appending to flowchart:", err.message);
    }
  };

  const handleOpenDialog = (flowchartId, nodes) => {
    setSelectedFlowchartId(flowchartId);
    setSelectedFlowchartNodes(nodes || []);
    setSourceNodeId("");
    setPositionType("end");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNodeLabel("New Step");
    setNodeType("default");
    setEdgeLabel("next");
    setSourceNodeId("");
    setPositionType("end");
  };

  useEffect(() => {
    fetchFlowcharts();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        bgcolor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        pt: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", mb: 4, textAlign: "center", color: "#333" }}
        >
          All Flowcharts
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : flowcharts.length === 0 ? (
          <Typography>No flowcharts available.</Typography>
        ) : (
          flowcharts.map((item) => (
            <Card
              key={item.flowchart.flowchart_id}
              sx={{ my: 2, backgroundColor: "#fff", boxShadow: 2, borderRadius: 2, width: "100%" }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#000" }}>
                  {item.flowchart.title || "Untitled Flowchart"}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ color: "#555" }}>
                  {item.flowchart.description || "No description provided."}
                </Typography>

                {item.nodes.length > 0 ? (
                  <Box mt={2}>
                    <FlowchartPreview
                      nodes={item.nodes.map((n) => ({
                        ...n,
                        data: typeof n.data === "string" ? JSON.parse(n.data) : n.data,
                      }))}
                      edges={item.edges}
                    />
                  </Box>
                ) : (
                  <Typography sx={{ mt: 2, fontStyle: "italic", color: "#999" }}>
                    No nodes/edges to display.
                  </Typography>
                )}

                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => handleOpenDialog(item.flowchart.flowchart_id, item.nodes)}
                >
                  ➕ Add Custom Node
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        {/* 🚀 Dialog for Custom Node Input */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add Node to Flowchart</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Node Label"
              fullWidth
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Node Type"
              select
              fullWidth
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="approval">Approval</MenuItem>
              <MenuItem value="end">End</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              label="Edge Label"
              fullWidth
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
            />

            <TextField
              margin="dense"
              label="Source Node"
              select
              fullWidth
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(e.target.value)}
              disabled={positionType === "start"} // disable if adding at start
            >
              {selectedFlowchartNodes.map((node) => (
                <MenuItem key={node.id} value={node.id}>
                  {node.data?.label || node.id}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              margin="dense"
              label="Position Type"
              select
              fullWidth
              value={positionType}
              onChange={(e) => setPositionType(e.target.value)}
            >
              <MenuItem value="start">Start</MenuItem>
              <MenuItem value="end">End</MenuItem>
              <MenuItem value="both">Both</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={appendToFlowchart} variant="contained">
              Add Node
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default FlowchartList;
