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
  useTheme,
} from "@mui/material";
import FlowchartPreview from "../FlowchartPreview/FlowchartPreview";

const FlowchartList = () => {
  const theme = useTheme();
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
  const [positionType, setPositionType] = useState("end");

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
        positionType,
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
        background: "linear-gradient(to right, #dfe9f3, #ffffff)",
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700, color: "#2c3e50", mb: 5 }}
        >
          📊 Flowchart Dashboard
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : flowcharts.length === 0 ? (
          <Typography align="center">No flowcharts available.</Typography>
        ) : (
          flowcharts.map((item) => (
            <Card
              key={item.flowchart.flowchart_id}
              sx={{
                mb: 4,
                borderRadius: 3,
                backgroundColor: "#ffffff",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.01)" },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#34495e" }}>
                  {item.flowchart.title || "Untitled Flowchart"}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" sx={{ color: "#666" }}>
                  {item.flowchart.description || "No description provided."}
                </Typography>

                {item.nodes.length > 0 ? (
                  <Box mt={2} sx={{ border: "1px dashed #ccc", borderRadius: 2, p: 1 }}>
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
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    backgroundColor: "#2e86de",
                    "&:hover": { backgroundColor: "#1e70bf" },
                  }}
                  onClick={() => handleOpenDialog(item.flowchart.flowchart_id, item.nodes)}
                >
                  ➕ Add Custom Node
                </Button>
              </CardContent>
            </Card>
          ))
        )}

        {/* 📌 Node Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 600, color: "#2e86de" }}>
            ➕ Add Node to Flowchart
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <TextField
              margin="normal"
              label="Node Label"
              fullWidth
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
            />
            <TextField
              margin="normal"
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
              margin="normal"
              label="Edge Label"
              fullWidth
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
            />
            <TextField
              margin="normal"
              label="Source Node"
              select
              fullWidth
              disabled={positionType === "start"}
              value={sourceNodeId}
              onChange={(e) => setSourceNodeId(e.target.value)}
            >
              {selectedFlowchartNodes.map((node) => (
                <MenuItem key={node.id} value={node.id}>
                  {node.data?.label || node.id}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="normal"
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
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button
              onClick={appendToFlowchart}
              variant="contained"
              sx={{
                borderRadius: 2,
                backgroundColor: "#2e86de",
                "&:hover": { backgroundColor: "#1e70bf" },
              }}
            >
              Add Node
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default FlowchartList;
