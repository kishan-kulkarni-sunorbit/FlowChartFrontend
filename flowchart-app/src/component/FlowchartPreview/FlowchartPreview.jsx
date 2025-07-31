import React, { useCallback } from 'react';
import axios from 'axios';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const FlowchartPreview = ({ nodes, edges }) => {
  // Color-coded parent (green) and child (red) nodes
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(
    nodes.map((node) => ({
      ...node,
      style: {
        backgroundColor: node.parent_node_key ? '#f8d7da' : '#d1e7dd', // red for child, green for parent
        border: '1px solid #888',
        padding: 10,
      },
    }))
  );

  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(
    edges.map((e) => ({
      ...e,
      label: e.label || 'next',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      style: { stroke: '#555' },
      labelStyle: {
        fill: '#222',
        fontWeight: 500,
        fontSize: 12,
      },
    }))
  );

  const onConnect = useCallback(
    (params) =>
      setFlowEdges((eds) =>
        addEdge({ ...params, type: 'default', label: 'connected' }, eds)
      ),
    [setFlowEdges]
  );

  const onNodeDragStop = useCallback(
    async (event, node) => {
      setFlowNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
      );

      try {
        await axios.patch('http://localhost:5001/api/flowchart/update-node-position', {
          node_key: node.id, // node_key from your DB
          position: {
            x: node.position.x,
            y: node.position.y,
          },
        });
      } catch (err) {
        console.error('❌ Failed to update node position:', err.message);
      }
    },
    [setFlowNodes]
  );

  return (
    <div style={{ height: 300, width: '100%' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={12} size={1} color="#aaa" />
      </ReactFlow>
    </div>
  );
};

export default FlowchartPreview;
