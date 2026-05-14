import { useCallback, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  type NodeTypes, type EdgeTypes,
  BackgroundVariant, ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTopologyStore } from '../../store/topologyStore';
import { OLTNode } from '../../nodes/OLTNode';
import { ONUNode } from '../../nodes/ONUNode';
import { SplitterNode } from '../../nodes/SplitterNode';
import { ODFNode } from '../../nodes/ODFNode';
import { EndDeviceNode } from '../../nodes/EndDeviceNode';
import { FiberEdge } from '../../edges/FiberEdge';
import { EthernetEdge } from '../../edges/EthernetEdge';
import { WirelessEdge } from '../../edges/WirelessEdge';
import type { SplitterRatio, EndDeviceType } from '../../types/network';

const nodeTypes: NodeTypes = {
  olt: OLTNode as never,
  onu: ONUNode as never,
  splitter: SplitterNode as never,
  odf: ODFNode as never,
  enddevice: EndDeviceNode as never,
};

const edgeTypes: EdgeTypes = {
  fiber: FiberEdge as never,
  ethernet: EthernetEdge as never,
  wireless: WirelessEdge as never,
};

// Use individual selectors to avoid unnecessary re-renders
const selectNodes = (s: ReturnType<typeof useTopologyStore.getState>) => s.nodes;
const selectEdges = (s: ReturnType<typeof useTopologyStore.getState>) => s.edges;
const selectOnNodesChange = (s: ReturnType<typeof useTopologyStore.getState>) => s.onNodesChange;
const selectOnEdgesChange = (s: ReturnType<typeof useTopologyStore.getState>) => s.onEdgesChange;
const selectOnConnect = (s: ReturnType<typeof useTopologyStore.getState>) => s.onConnect;
const selectSetSelectedNode = (s: ReturnType<typeof useTopologyStore.getState>) => s.setSelectedNode;
const selectSetSelectedEdge = (s: ReturnType<typeof useTopologyStore.getState>) => s.setSelectedEdge;
const selectAddOLT = (s: ReturnType<typeof useTopologyStore.getState>) => s.addOLT;
const selectAddONU = (s: ReturnType<typeof useTopologyStore.getState>) => s.addONU;
const selectAddSplitter = (s: ReturnType<typeof useTopologyStore.getState>) => s.addSplitter;
const selectAddODF = (s: ReturnType<typeof useTopologyStore.getState>) => s.addODF;
const selectAddEndDevice = (s: ReturnType<typeof useTopologyStore.getState>) => s.addEndDevice;

type RFInstance = { screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number } };

export function TopologyCanvas() {
  const nodes = useTopologyStore(selectNodes);
  const edges = useTopologyStore(selectEdges);
  const onNodesChange = useTopologyStore(selectOnNodesChange);
  const onEdgesChange = useTopologyStore(selectOnEdgesChange);
  const onConnect = useTopologyStore(selectOnConnect);
  const setSelectedNode = useTopologyStore(selectSetSelectedNode);
  const setSelectedEdge = useTopologyStore(selectSetSelectedEdge);
  const addOLT = useTopologyStore(selectAddOLT);
  const addONU = useTopologyStore(selectAddONU);
  const addSplitter = useTopologyStore(selectAddSplitter);
  const addODF = useTopologyStore(selectAddODF);
  const addEndDevice = useTopologyStore(selectAddEndDevice);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<RFInstance | null>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/pon-device');
    if (!type || !reactFlowWrapper.current || !rfInstance.current) return;

    const rect = reactFlowWrapper.current.getBoundingClientRect();
    const position = rfInstance.current.screenToFlowPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (type === 'olt') addOLT(position);
    else if (type === 'onu') addONU(position);
    else if (type === 'odf') addODF(position);
    else if (type.startsWith('splitter-')) {
      const ratio = parseInt(type.split('-')[1]) as SplitterRatio;
      addSplitter(ratio, position);
    } else if (type.startsWith('dev-')) {
      addEndDevice(type.replace('dev-', '') as EndDeviceType, position);
    }
  }, [addOLT, addONU, addSplitter, addODF, addEndDevice]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_: unknown, node: { id: string }) => {
    setSelectedNode(node.id);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  const onEdgeClick = useCallback((_: unknown, edge: { id: string }) => {
    setSelectedNode(null);
    setSelectedEdge(edge.id);
  }, [setSelectedNode, setSelectedEdge]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={(instance) => { rfInstance.current = instance as RFInstance; }}
        fitView
        deleteKeyCode="Delete"
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        defaultEdgeOptions={{ type: 'fiber' }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={20} size={1} />
        <Controls />
        <MiniMap nodeColor={(n) => {
          if (n.type === 'olt') return '#1d4ed8';
          if (n.type === 'onu') return '#22c55e';
          if (n.type === 'splitter') return '#7c3aed';
          return '#78716c';
        }} />
      </ReactFlow>
    </div>
  );
}
