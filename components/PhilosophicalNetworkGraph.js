import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Minus, Move, Link, Type, Trash2 } from 'lucide-react';

const PhilosophicalNetworkGraph = () => {
  const [nodes, setNodes] = useState([
    { id: 1, statement: "I think therefore I am", type: "axiom", x: 200, y: 150 },
    { id: 2, statement: "It rained on wednesday", type: "empirical", x: 400, y: 100 },
    { id: 3, statement: "It did not rain on wednesday", type: "empirical", x: 400, y: 200 },
    { id: 4, statement: "The road was wet on wednesday", type: "empirical", x: 600, y: 150 }
  ]);

  const [edges, setEdges] = useState([
    { id: 1, from: 2, to: 3, type: "contradiction", label: "contradicts" },
    { id: 2, from: 2, to: 4, type: "implication", label: "implies" }
  ]);

  const [relationshipTypes, setRelationshipTypes] = useState([
    { id: 1, name: "contradiction", color: "#ff4444" },
    { id: 2, name: "implication", color: "#44ff44" },
    { id: 3, name: "supports", color: "#4444ff" },
    { id: 4, name: "weakens", color: "#ffaa00" }
  ]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [mode, setMode] = useState('navigate'); // navigate, add-node, add-edge, add-edge-type, add-node-type
  const [newNode, setNewNode] = useState({ statement: '', type: 'empirical' });
  const [newRelationType, setNewRelationType] = useState({ name: '', color: '#666666' });
  const [newNodeType, setNewNodeType] = useState({ name: '', color: '#888888' });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdgeType, setSelectedEdgeType] = useState('implication');
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [edgeStrength, setEdgeStrength] = useState(1);
  
  const svgRef = useRef();
  const containerRef = useRef();

  const nodeTypes = ['axiom', 'empirical', 'theoretical', 'normative'];
  const [customNodeTypes, setCustomNodeTypes] = useState([]);

  // Handle mouse events
  const handleMouseDown = useCallback((e, node) => {
    if (mode === 'navigate') {
      e.stopPropagation();
      setHasDragged(false);
      setDragState({
        type: 'node',
        nodeId: node.id,
        startX: e.clientX,
        startY: e.clientY,
        nodeStartX: node.x,
        nodeStartY: node.y
      });
    } else if (mode === 'add-edge') {
      e.stopPropagation();
      if (selectedNodes.length === 0) {
        setSelectedNodes([node.id]);
      } else if (selectedNodes.length === 1 && selectedNodes[0] !== node.id) {
        // Create edge
        const newEdge = {
          id: Math.max(...edges.map(e => e.id), 0) + 1,
          from: selectedNodes[0],
          to: node.id,
          type: selectedEdgeType,
          label: relationshipTypes.find(rt => rt.name === selectedEdgeType)?.name || selectedEdgeType,
          strength: (selectedEdgeType === 'supports' || selectedEdgeType === 'weakens') ? edgeStrength : undefined
        };
        setEdges([...edges, newEdge]);
        setSelectedNodes([]);
      }
    }
  }, [mode, selectedNodes, selectedEdgeType, edges, relationshipTypes, edgeStrength]);

  // Handle node click for editing
  const handleNodeClick = useCallback((e, node) => {
    if (mode === 'navigate' && !hasDragged) {
      e.stopPropagation();
      setSelectedNodeForEdit(node);
      setEditingNode({
        id: node.id,
        statement: node.statement,
        type: node.type
      });
    }
  }, [hasDragged, mode]);

  // Save edited node
  const saveEditedNode = () => {
    if (editingNode) {
      setNodes(prev => prev.map(node => 
        node.id === editingNode.id 
          ? { ...node, statement: editingNode.statement, type: editingNode.type }
          : node
      ));
      setSelectedNodeForEdit(null);
      setEditingNode(null);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setSelectedNodeForEdit(null);
    setEditingNode(null);
  };

  const handleMouseMove = useCallback((e) => {
    if (dragState) {
      if (dragState.type === 'node') {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Mark as dragged if moved more than 5 pixels
        if (distance > 5) {
          setHasDragged(true);
        }
        
        const scaledDeltaX = deltaX / zoom;
        const scaledDeltaY = deltaY / zoom;
        
        setNodes(prev => prev.map(node => 
          node.id === dragState.nodeId 
            ? { ...node, x: dragState.nodeStartX + scaledDeltaX, y: dragState.nodeStartY + scaledDeltaY }
            : node
        ));
      } else if (dragState.type === 'pan') {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        setPan({ x: dragState.panStartX + deltaX, y: dragState.panStartY + deltaY });
      }
    }
  }, [dragState, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleSvgMouseDown = useCallback((e) => {
    if (mode === 'navigate') {
      setDragState({
        type: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        panStartX: pan.x,
        panStartY: pan.y
      });
    } else if (mode === 'add-node') {
      const rect = svgRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      
      if (newNode.statement.trim()) {
        const node = {
          id: Math.max(...nodes.map(n => n.id), 0) + 1,
          statement: newNode.statement,
          type: newNode.type,
          x,
          y
        };
        setNodes([...nodes, node]);
        setNewNode({ statement: '', type: 'empirical' });
      }
    }
  }, [mode, pan, zoom, newNode, nodes]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.2, Math.min(3, prev + delta)));
  };

  const addRelationshipType = () => {
    if (newRelationType.name.trim()) {
      const type = {
        id: Math.max(...relationshipTypes.map(rt => rt.id), 0) + 1,
        name: newRelationType.name.toLowerCase(),
        color: newRelationType.color
      };
      setRelationshipTypes([...relationshipTypes, type]);
      setNewRelationType({ name: '', color: '#666666' });
    }
  };

  const addNodeType = () => {
    if (newNodeType.name.trim()) {
      const type = {
        id: Math.max(...customNodeTypes.map(nt => nt.id), 0) + 1,
        name: newNodeType.name.toLowerCase(),
        color: newNodeType.color
      };
      setCustomNodeTypes([...customNodeTypes, type]);
      setNewNodeType({ name: '', color: '#888888' });
    }
  };

  const getAllNodeTypes = () => {
    return [...nodeTypes, ...customNodeTypes.map(cnt => cnt.name)];
  };

  const calculateNodeStrength = (nodeId) => {
    const incomingEdges = edges.filter(edge => edge.to === nodeId && (edge.type === 'supports' || edge.type === 'weakens'));
    let total = 0;
    
    incomingEdges.forEach(edge => {
      if (edge.strength !== undefined) {
        if (edge.type === 'supports') {
          total += edge.strength;
        } else if (edge.type === 'weakens') {
          total -= edge.strength;
        }
      }
    });
    
    return { total, hasStrengthEdges: incomingEdges.length > 0 };
  };

  const deleteNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setEdges(edges.filter(e => e.from !== nodeId && e.to !== nodeId));
  };

  const deleteEdge = (edgeId) => {
    setEdges(edges.filter(e => e.id !== edgeId));
  };

  const getNodeColor = (type) => {
    // Check custom node types first
    const customType = customNodeTypes.find(cnt => cnt.name === type);
    if (customType) {
      return customType.color;
    }
    
    // Fall back to default types
    switch (type) {
      case 'axiom': return '#ffffff';
      case 'empirical': return '#cccccc';
      case 'theoretical': return '#888888';
      case 'normative': return '#444444';
      default: return '#cccccc';
    }
  };

  return (
    <div ref={containerRef} className="w-full h-screen bg-black text-white font-mono flex flex-col">
      {/* Top toolbar */}
      <div className="border-b border-gray-700 p-4 space-y-4">
        {/* Mode selection */}
        <div className="flex space-x-2">
          <button
            onClick={() => setMode('navigate')}
            className={`px-3 py-1 border ${mode === 'navigate' ? 'bg-white text-black' : 'border-gray-600 hover:border-gray-400'}`}
          >
            <Move className="w-4 h-4 inline mr-1" />
            Navigate
          </button>
          <button
            onClick={() => setMode('add-node')}
            className={`px-3 py-1 border ${mode === 'add-node' ? 'bg-white text-black' : 'border-gray-600 hover:border-gray-400'}`}
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Node
          </button>
          <button
            onClick={() => setMode('add-edge')}
            className={`px-3 py-1 border ${mode === 'add-edge' ? 'bg-white text-black' : 'border-gray-600 hover:border-gray-400'}`}
          >
            <Link className="w-4 h-4 inline mr-1" />
            Add Edge
          </button>
          <button
            onClick={() => setMode('add-edge-type')}
            className={`px-3 py-1 border ${mode === 'add-edge-type' ? 'bg-white text-black' : 'border-gray-600 hover:border-gray-400'}`}
          >
            <Link className="w-4 h-4 inline mr-1" />
            Add Edge Type
          </button>
          <button
            onClick={() => setMode('add-node-type')}
            className={`px-3 py-1 border ${mode === 'add-node-type' ? 'bg-white text-black' : 'border-gray-600 hover:border-gray-400'}`}
          >
            <Type className="w-4 h-4 inline mr-1" />
            Add Node Type
          </button>
        </div>

        {/* Mode-specific controls */}
        {mode === 'add-node' && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Statement..."
              value={newNode.statement}
              onChange={(e) => setNewNode({...newNode, statement: e.target.value})}
              className="flex-1 px-2 py-1 bg-black border border-gray-600 text-white"
            />
            <select
              value={newNode.type}
              onChange={(e) => setNewNode({...newNode, type: e.target.value})}
              className="px-2 py-1 bg-black border border-gray-600 text-white"
            >
              {getAllNodeTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <span className="text-sm text-gray-400 self-center">Click on graph to place</span>
          </div>
        )}

        {mode === 'add-edge' && (
          <div className="flex space-x-2">
            <select
              value={selectedEdgeType}
              onChange={(e) => setSelectedEdgeType(e.target.value)}
              className="px-2 py-1 bg-black border border-gray-600 text-white"
            >
              {relationshipTypes.map(type => (
                <option key={type.name} value={type.name}>{type.name}</option>
              ))}
            </select>
            {(selectedEdgeType === 'supports' || selectedEdgeType === 'weakens') && (
              <input
                type="number"
                value={edgeStrength}
                onChange={(e) => setEdgeStrength(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-black border border-gray-600 text-white"
                placeholder="Strength"
              />
            )}
            <span className="text-sm text-gray-400 self-center">
              {selectedNodes.length === 0 ? 'Click first node' : 'Click second node'}
            </span>
            {selectedNodes.length > 0 && (
              <button
                onClick={() => setSelectedNodes([])}
                className="px-2 py-1 border border-gray-600 hover:border-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {mode === 'add-edge-type' && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Edge relationship name..."
              value={newRelationType.name}
              onChange={(e) => setNewRelationType({...newRelationType, name: e.target.value})}
              className="flex-1 px-2 py-1 bg-black border border-gray-600 text-white"
            />
            <input
              type="color"
              value={newRelationType.color}
              onChange={(e) => setNewRelationType({...newRelationType, color: e.target.value})}
              className="w-10 h-8 bg-black border border-gray-600"
            />
            <button
              onClick={addRelationshipType}
              className="px-3 py-1 border border-gray-600 hover:border-gray-400"
            >
              Add Edge Type
            </button>
          </div>
        )}

        {mode === 'add-node-type' && (
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Knowledge type name..."
              value={newNodeType.name}
              onChange={(e) => setNewNodeType({...newNodeType, name: e.target.value})}
              className="flex-1 px-2 py-1 bg-black border border-gray-600 text-white"
            />
            <input
              type="color"
              value={newNodeType.color}
              onChange={(e) => setNewNodeType({...newNodeType, color: e.target.value})}
              className="w-10 h-8 bg-black border border-gray-600"
            />
            <button
              onClick={addNodeType}
              className="px-3 py-1 border border-gray-600 hover:border-gray-400"
            >
              Add Node Type
            </button>
            <div className="text-sm text-gray-400 self-center">
              Examples: intuitive, revealed, experiential, logical
            </div>
          </div>
        )}

        {/* Zoom controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-1 border border-gray-600 hover:border-gray-400"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm self-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => handleZoom(0.2)}
            className="p-1 border border-gray-600 hover:border-gray-400"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main graph area */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
          onMouseDown={handleSvgMouseDown}
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Render edges */}
            {edges.map(edge => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const relType = relationshipTypes.find(rt => rt.name === edge.type);
              const color = relType?.color || '#666666';

              return (
                <g key={edge.id}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={color}
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 10}
                    fill={color}
                    fontSize="10"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {edge.label}{edge.strength !== undefined ? ` (${edge.strength})` : ''}
                  </text>
                  <circle
                    cx={(fromNode.x + toNode.x) / 2}
                    cy={(fromNode.y + toNode.y) / 2}
                    r="8"
                    fill="transparent"
                    className="cursor-pointer hover:fill-red-900"
                    onClick={() => deleteEdge(edge.id)}
                  />
                </g>
              );
            })}

            {/* Render nodes */}
            {nodes.map(node => {
              const strengthInfo = calculateNodeStrength(node.id);
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="40"
                    fill={getNodeColor(node.type)}
                    stroke={selectedNodes.includes(node.id) ? "#ff4444" : "#666666"}
                    strokeWidth={selectedNodes.includes(node.id) ? "3" : "2"}
                    className="cursor-pointer"
                    onMouseDown={(e) => handleMouseDown(e, node)}
                    onClick={(e) => handleNodeClick(e, node)}
                  />
                  <text
                    x={node.x}
                    y={node.y - 8}
                    textAnchor="middle"
                    fill="black"
                    fontSize="10"
                    className="pointer-events-none"
                    style={{ maxWidth: '70px' }}
                  >
                    {node.statement.length > 20 ? node.statement.substring(0, 17) + '...' : node.statement}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="black"
                    fontSize="8"
                    className="pointer-events-none"
                  >
                    [{node.type}]
                  </text>
                  {strengthInfo.hasStrengthEdges && (
                    <text
                      x={node.x}
                      y={node.y + 15}
                      textAnchor="middle"
                      fill={strengthInfo.total >= 0 ? "darkgreen" : "darkred"}
                      fontSize="8"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {strengthInfo.total >= 0 ? '+' : ''}{strengthInfo.total}
                    </text>
                  )}
                  <circle
                    cx={node.x + 30}
                    cy={node.y - 30}
                    r="8"
                    fill="red"
                    className="cursor-pointer hover:fill-red-700"
                    onClick={() => deleteNode(node.id)}
                  />
                  <Trash2 
                    x={node.x + 26} 
                    y={node.y - 34} 
                    width="8" 
                    height="8" 
                    fill="white"
                    className="pointer-events-none"
                  />
                </g>
              );
            })}
          </g>

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#666666"
              />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Node Edit Modal */}
      {selectedNodeForEdit && editingNode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border border-gray-600 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Node</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Statement:</label>
                <textarea
                  value={editingNode.statement}
                  onChange={(e) => setEditingNode({...editingNode, statement: e.target.value})}
                  className="w-full h-32 px-3 py-2 bg-black border border-gray-600 text-white resize-none"
                  placeholder="Enter the statement or idea..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  {editingNode.statement.length} characters
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Type:</label>
                <select
                  value={editingNode.type}
                  onChange={(e) => setEditingNode({...editingNode, type: e.target.value})}
                  className="w-full px-3 py-2 bg-black border border-gray-600 text-white"
                >
                  {getAllNodeTypes().map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <div className="text-sm text-gray-400 mb-2">Preview:</div>
                <div className="flex items-center justify-center">
                  <div 
                    className="w-20 h-20 rounded-full border-2 border-gray-600 flex flex-col items-center justify-center text-xs text-center"
                    style={{ backgroundColor: getNodeColor(editingNode.type) }}
                  >
                    <div className="text-black font-semibold">
                      {editingNode.statement.length > 15 
                        ? editingNode.statement.substring(0, 12) + '...' 
                        : editingNode.statement}
                    </div>
                    <div className="text-black text-xs">
                      [{editingNode.type}]
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={saveEditedNode}
                className="flex-1 px-4 py-2 bg-white text-black hover:bg-gray-200"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 border border-gray-600 hover:border-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhilosophicalNetworkGraph;