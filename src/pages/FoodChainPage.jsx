import { useMemo, useRef, useState } from 'react'
import SectionHeading from '../components/SectionHeading'

const CHAIN_PRESETS = {
  alpine: {
    label: 'Alpine Predator Web',
    nodes: [
      { id: 'alpine-grass', name: 'Alpine Grass', level: 'Producer', x: 15, y: 78 },
      { id: 'berry-shrub', name: 'Berry Shrub', level: 'Producer', x: 33, y: 78 },
      { id: 'pika', name: 'Pika', level: 'Primary Consumer', x: 22, y: 52, dependsOn: ['alpine-grass'] },
      { id: 'blue-sheep', name: 'Blue Sheep', level: 'Primary Consumer', x: 45, y: 54, dependsOn: ['alpine-grass', 'berry-shrub'] },
      { id: 'musk-deer', name: 'Musk Deer', level: 'Primary Consumer', x: 62, y: 52, dependsOn: ['berry-shrub'] },
      { id: 'lammergeier', name: 'Lammergeier', level: 'Scavenger', x: 76, y: 32, dependsOn: ['blue-sheep', 'musk-deer'] },
      { id: 'snow-leopard', name: 'Snow Leopard', level: 'Apex Predator', x: 52, y: 22, dependsOn: ['blue-sheep', 'pika', 'musk-deer'] },
      { id: 'decomposer', name: 'Soil Decomposers', level: 'Recycling', x: 84, y: 74, dependsOn: ['pika', 'blue-sheep', 'musk-deer', 'snow-leopard'] },
    ],
  },
  forest: {
    label: 'Temperate Forest Chain',
    nodes: [
      { id: 'oak', name: 'Oak Trees', level: 'Producer', x: 18, y: 78 },
      { id: 'berries', name: 'Forest Berries', level: 'Producer', x: 35, y: 78 },
      { id: 'insects', name: 'Insects', level: 'Primary Consumer', x: 20, y: 54, dependsOn: ['oak', 'berries'] },
      { id: 'pheasant', name: 'Monal Pheasant', level: 'Primary Consumer', x: 41, y: 54, dependsOn: ['insects', 'berries'] },
      { id: 'langur', name: 'Langur', level: 'Primary Consumer', x: 61, y: 52, dependsOn: ['oak', 'berries'] },
      { id: 'fox', name: 'Red Fox', level: 'Secondary Consumer', x: 72, y: 36, dependsOn: ['insects', 'pheasant'] },
      { id: 'leopard', name: 'Leopard', level: 'Apex Predator', x: 50, y: 22, dependsOn: ['pheasant', 'langur', 'fox'] },
      { id: 'fungi', name: 'Fungi', level: 'Recycling', x: 84, y: 74, dependsOn: ['insects', 'pheasant', 'langur', 'leopard'] },
    ],
  },
  river: {
    label: 'Glacial River Chain',
    nodes: [
      { id: 'algae', name: 'Algae', level: 'Producer', x: 16, y: 78 },
      { id: 'plankton', name: 'Plankton', level: 'Producer', x: 34, y: 78 },
      { id: 'larvae', name: 'Aquatic Larvae', level: 'Primary Consumer', x: 22, y: 54, dependsOn: ['algae', 'plankton'] },
      { id: 'trout', name: 'Snow Trout', level: 'Secondary Consumer', x: 44, y: 52, dependsOn: ['larvae', 'plankton'] },
      { id: 'otter', name: 'Otter', level: 'Secondary Consumer', x: 63, y: 52, dependsOn: ['trout'] },
      { id: 'eagle', name: 'Mountain Eagle', level: 'Apex Predator', x: 73, y: 30, dependsOn: ['trout', 'otter'] },
      { id: 'bear', name: 'Brown Bear', level: 'Apex Predator', x: 50, y: 22, dependsOn: ['trout', 'otter'] },
      { id: 'bacteria', name: 'Bacteria', level: 'Recycling', x: 84, y: 74, dependsOn: ['larvae', 'trout', 'otter', 'eagle', 'bear'] },
    ],
  },
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function buildPositionMap(nodes) {
  return Object.fromEntries(nodes.map((node) => [node.id, { x: node.x, y: node.y }]))
}

function FoodChainPage() {
  const [selectedChainId, setSelectedChainId] = useState('alpine')
  const [removedNodeId, setRemovedNodeId] = useState('')
  const activeChain = CHAIN_PRESETS[selectedChainId]
  const [nodePositions, setNodePositions] = useState(() => buildPositionMap(activeChain.nodes))
  const [draggingNodeId, setDraggingNodeId] = useState('')
  const dragMetaRef = useRef({ moved: false, pointerId: null })

  const nodes = useMemo(() => activeChain.nodes, [activeChain])

  const nodeMap = useMemo(() => {
    return new Map(
      nodes.map((node) => [node.id, { ...node, x: nodePositions[node.id]?.x ?? node.x, y: nodePositions[node.id]?.y ?? node.y }]),
    )
  }, [nodes, nodePositions])

  const edgeList = useMemo(
    () => nodes.flatMap((node) => (node.dependsOn ?? []).map((sourceId) => ({ sourceId, targetId: node.id }))),
    [nodes],
  )

  const impactedSet = useMemo(() => {
    if (!removedNodeId) return new Set()

    const impacted = new Set([removedNodeId])
    let changed = true

    while (changed) {
      changed = false
      nodes.forEach((node) => {
        if (impacted.has(node.id) || !node.dependsOn?.length) return
        const nowImpacted = node.dependsOn.some((dependencyId) => impacted.has(dependencyId))
        if (nowImpacted) {
          impacted.add(node.id)
          changed = true
        }
      })
    }

    impacted.delete(removedNodeId)
    return impacted
  }, [nodes, removedNodeId])

  const impacts = useMemo(() => {
    if (!removedNodeId) {
      return {
        impactedCount: 0,
        severeRisk: 0,
        statusRows: [],
        topTips: [
          'Select any node to simulate local extinction and visualize cascading impacts.',
          'Prioritize producer and prey restoration to stabilize predators naturally.',
          'Protect migration and grazing corridors to reduce isolation collapse.',
        ],
      }
    }

    const statusRows = nodes.map((node) => {
      if (node.id === removedNodeId) {
        return { ...node, status: 'Removed', severity: 3 }
      }
      if (impactedSet.has(node.id)) {
        const dependencyHitCount = (node.dependsOn ?? []).filter(
          (dependencyId) => dependencyId === removedNodeId || impactedSet.has(dependencyId),
        ).length
        const severe = dependencyHitCount >= 2 || node.level === 'Apex Predator'
        return { ...node, status: severe ? 'Critical' : 'At Risk', severity: severe ? 2 : 1 }
      }
      return { ...node, status: 'Stable', severity: 0 }
    })

    const impactedCount = statusRows.filter((row) => row.severity > 0).length
    const severeRisk = statusRows.filter((row) => row.status === 'Critical').length

    const removedNode = nodeMap.get(removedNodeId)
    const topTips = [
      `Restore ${removedNode?.name ?? 'keystone nodes'} habitat using native vegetation patches.`,
      'Create community-led monitoring zones around feeding and breeding pockets.',
      'Reduce poaching pressure and road disturbance across connected corridors.',
    ]

    if (removedNode?.level === 'Producer') {
      topTips[0] = 'Protect alpine meadows and native shrubs first to prevent herbivore collapse.'
    }

    if (removedNode?.level === 'Apex Predator') {
      topTips[0] = 'Secure prey populations and anti-poaching patrols to recover apex predator stability.'
    }

    return { impactedCount, severeRisk, statusRows, topTips }
  }, [impactedSet, nodeMap, nodes, removedNodeId])

  function setChain(chainId) {
    const chain = CHAIN_PRESETS[chainId]
    setSelectedChainId(chainId)
    setNodePositions(buildPositionMap(chain.nodes))
    setRemovedNodeId('')
    setDraggingNodeId('')
    dragMetaRef.current = { moved: false, pointerId: null }
  }

  function pointerToViewBox(event) {
    const svg = event.currentTarget.ownerSVGElement ?? event.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    return { x: clamp(x, 6, 94), y: clamp(y, 12, 90) }
  }

  function handleNodePointerDown(event, nodeId) {
    dragMetaRef.current = { moved: false, pointerId: event.pointerId }
    setDraggingNodeId(nodeId)
  }

  function handleCanvasPointerMove(event) {
    if (!draggingNodeId) return
    const { x, y } = pointerToViewBox(event)
    dragMetaRef.current.moved = true
    setNodePositions((prev) => ({ ...prev, [draggingNodeId]: { x, y } }))
  }

  function handleCanvasPointerUp() {
    if (!draggingNodeId) return
    if (!dragMetaRef.current.moved) {
      setRemovedNodeId((prev) => (prev === draggingNodeId ? '' : draggingNodeId))
    }
    setDraggingNodeId('')
    dragMetaRef.current = { moved: false, pointerId: null }
  }

  return (
    <section className="page-panel food-chain-page">
      <SectionHeading
        title="Food Chain Collapse Visualizer"
        subtitle="Drag nodes to explore structure, then click a node to remove it and observe cascade collapse"
      />

      <div className="food-chain-controls glass">
        <p>Choose Chain:</p>
        <div className="food-chain-picker" role="tablist" aria-label="Food chain presets">
          {Object.entries(CHAIN_PRESETS).map(([chainId, chain]) => (
            <button
              key={chainId}
              type="button"
              className={`impact-filter-btn ${selectedChainId === chainId ? 'active' : ''}`}
              onClick={() => setChain(chainId)}
            >
              {chain.label}
            </button>
          ))}
        </div>
        <small>Tip: drag any node to rearrange the network, then click a node once to remove/restore it.</small>
      </div>

      <div className="food-chain-layout">
        <article className="food-chain-canvas glass">
          <svg
            viewBox="0 0 100 100"
            role="img"
            aria-label="Food chain node and connection graph"
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
          >
            {edgeList.map((edge) => {
              const source = nodeMap.get(edge.sourceId)
              const target = nodeMap.get(edge.targetId)
              if (!source || !target) return null

              const sourceDown = source.id === removedNodeId || impactedSet.has(source.id)
              const targetDown = target.id === removedNodeId || impactedSet.has(target.id)

              return (
                <line
                  key={`${edge.sourceId}-${edge.targetId}`}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className={`food-chain-link ${sourceDown || targetDown ? 'broken' : ''}`}
                />
              )
            })}

            {nodes.map((node) => {
              const position = nodeMap.get(node.id) ?? node
              const isRemoved = node.id === removedNodeId
              const isImpacted = impactedSet.has(node.id)
              const tone = isRemoved ? 'removed' : isImpacted ? 'risk' : 'stable'

              return (
                <g key={node.id} className={`food-chain-node ${tone}`}>
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="4.8"
                    className={draggingNodeId === node.id ? 'dragging' : ''}
                    onPointerDown={(event) => handleNodePointerDown(event, node.id)}
                  />
                  <text x={position.x} y={position.y + 8.2} textAnchor="middle">
                    {node.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </article>

        <article className="food-chain-insights glass">
          <h3>Collapse Impact</h3>
          <div className="food-chain-stats">
            <div>
              <small>Nodes Impacted</small>
              <strong>{impacts.impactedCount}</strong>
            </div>
            <div>
              <small>Critical Risk</small>
              <strong>{impacts.severeRisk}</strong>
            </div>
            <div>
              <small>Removed Node</small>
              <strong>{removedNodeId ? nodeMap.get(removedNodeId)?.name : 'None'}</strong>
            </div>
          </div>

          <div className="food-chain-status-list">
            {(impacts.statusRows.length ? impacts.statusRows : nodes.map((node) => ({ ...node, status: 'Stable' }))).map((row) => (
              <div key={row.id} className="food-status-row">
                <span>{row.name}</span>
                <strong className={`status-${String(row.status).toLowerCase().replace(' ', '-')}`}>{row.status}</strong>
              </div>
            ))}
          </div>

          <div className="food-chain-tips">
            <h4>How To Stabilize</h4>
            <ul>
              {impacts.topTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  )
}

export default FoodChainPage
