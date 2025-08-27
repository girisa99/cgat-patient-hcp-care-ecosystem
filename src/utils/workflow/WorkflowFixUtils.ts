import { supabase } from '@/integrations/supabase/client';

export interface AutoFixResult {
  success: boolean;
  message: string;
  changes?: {
    nodesAdded?: any[];
    nodesRemoved?: string[];
    nodesModified?: any[];
    edgesAdded?: any[];
    edgesRemoved?: string[];
  };
}

export class WorkflowFixUtils {
  /**
   * Auto-fix isolated nodes by connecting them to the main flow
   */
  static async fixIsolatedNodes(nodes: any[], edges: any[]): Promise<AutoFixResult> {
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    
    if (isolatedNodes.length === 0) {
      return {
        success: true,
        message: 'No isolated nodes found'
      };
    }

    const newEdges = [];
    const mainFlowNodes = nodes.filter(node => connectedNodes.has(node.id));
    
    // Connect isolated nodes to the nearest node in the main flow
    for (const isolatedNode of isolatedNodes) {
      if (mainFlowNodes.length > 0) {
        // Find the closest node by position
        const closestNode = mainFlowNodes.reduce((closest, current) => {
          const isolatedPos = isolatedNode.position || { x: 0, y: 0 };
          const currentPos = current.position || { x: 0, y: 0 };
          const closestPos = closest.position || { x: 0, y: 0 };
          
          const currentDistance = Math.sqrt(
            Math.pow(isolatedPos.x - currentPos.x, 2) + 
            Math.pow(isolatedPos.y - currentPos.y, 2)
          );
          
          const closestDistance = Math.sqrt(
            Math.pow(isolatedPos.x - closestPos.x, 2) + 
            Math.pow(isolatedPos.y - closestPos.y, 2)
          );
          
          return currentDistance < closestDistance ? current : closest;
        });

        newEdges.push({
          id: `auto-fix-${isolatedNode.id}-${closestNode.id}`,
          source: closestNode.id,
          target: isolatedNode.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#10b981' }
        });
      }
    }

    return {
      success: true,
      message: `Connected ${isolatedNodes.length} isolated nodes`,
      changes: {
        edgesAdded: newEdges
      }
    };
  }

  /**
   * Auto-fix missing start node
   */
  static async fixMissingStartNode(nodes: any[], edges: any[]): Promise<AutoFixResult> {
    const hasStartNode = nodes.some(node => node.type === 'start' || node.data?.isStart);
    
    if (hasStartNode) {
      return {
        success: true,
        message: 'Start node already exists'
      };
    }

    // Find nodes with no incoming edges (potential start points)
    const nodeIds = new Set(nodes.map(n => n.id));
    const targetNodes = new Set(edges.map(e => e.target));
    const potentialStartNodes = nodes.filter(node => !targetNodes.has(node.id));

    if (potentialStartNodes.length === 0) {
      // Create a new start node
      const startNode = {
        id: 'auto-start-node',
        type: 'start',
        position: { x: 100, y: 100 },
        data: {
          label: 'Start',
          isStart: true
        }
      };

      return {
        success: true,
        message: 'Created new start node',
        changes: {
          nodesAdded: [startNode]
        }
      };
    } else {
      // Mark the first potential start node as the start
      const startNode = { ...potentialStartNodes[0] };
      startNode.data = {
        ...startNode.data,
        isStart: true,
        label: startNode.data?.label || 'Start'
      };
      
      return {
        success: true,
        message: 'Marked existing node as start',
        changes: {
          nodesModified: [startNode]
        }
      };
    }
  }

  /**
   * Auto-fix missing end node
   */
  static async fixMissingEndNode(nodes: any[], edges: any[]): Promise<AutoFixResult> {
    const hasEndNode = nodes.some(node => node.type === 'end' || node.data?.isEnd);
    
    if (hasEndNode) {
      return {
        success: true,
        message: 'End node already exists'
      };
    }

    // Find nodes with no outgoing edges (potential end points)
    const sourceNodes = new Set(edges.map(e => e.source));
    const potentialEndNodes = nodes.filter(node => !sourceNodes.has(node.id));

    if (potentialEndNodes.length === 0) {
      // Create a new end node
      const endNode = {
        id: 'auto-end-node',
        type: 'end',
        position: { x: 500, y: 400 },
        data: {
          label: 'End',
          isEnd: true
        }
      };

      return {
        success: true,
        message: 'Created new end node',
        changes: {
          nodesAdded: [endNode]
        }
      };
    } else {
      // Mark the first potential end node as the end
      const endNode = { ...potentialEndNodes[0] };
      endNode.data = {
        ...endNode.data,
        isEnd: true,
        label: endNode.data?.label || 'End'
      };
      
      return {
        success: true,
        message: 'Marked existing node as end',
        changes: {
          nodesModified: [endNode]
        }
      };
    }
  }

  /**
   * Remove invalid connections
   */
  static async fixInvalidConnections(nodes: any[], edges: any[]): Promise<AutoFixResult> {
    const nodeIds = new Set(nodes.map(n => n.id));
    const validEdges = edges.filter(edge => 
      nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    const removedCount = edges.length - validEdges.length;
    
    if (removedCount === 0) {
      return {
        success: true,
        message: 'All connections are valid'
      };
    }

    const invalidEdgeIds = edges
      .filter(edge => !nodeIds.has(edge.source) || !nodeIds.has(edge.target))
      .map(edge => edge.id);

    return {
      success: true,
      message: `Removed ${removedCount} invalid connections`,
      changes: {
        edgesRemoved: invalidEdgeIds
      }
    };
  }

  /**
   * Apply multiple fixes in sequence
   */
  static async applyBulkFixes(
    nodes: any[], 
    edges: any[], 
    fixTypes: string[]
  ): Promise<AutoFixResult> {
    let currentNodes = [...nodes];
    let currentEdges = [...edges];
    const allChanges = {
      nodesAdded: [] as any[],
      nodesRemoved: [] as string[],
      nodesModified: [] as any[],
      edgesAdded: [] as any[],
      edgesRemoved: [] as string[]
    };

    const results = [];

    for (const fixType of fixTypes) {
      let result: AutoFixResult;

      switch (fixType) {
        case 'isolated_nodes':
          result = await this.fixIsolatedNodes(currentNodes, currentEdges);
          break;
        case 'missing_start':
          result = await this.fixMissingStartNode(currentNodes, currentEdges);
          break;
        case 'missing_end':
          result = await this.fixMissingEndNode(currentNodes, currentEdges);
          break;
        case 'invalid_connections':
          result = await this.fixInvalidConnections(currentNodes, currentEdges);
          break;
        default:
          result = { success: false, message: `Unknown fix type: ${fixType}` };
      }

      results.push(result);

      if (result.success && result.changes) {
        // Apply changes to current state
        if (result.changes.nodesAdded) {
          currentNodes.push(...result.changes.nodesAdded);
          allChanges.nodesAdded.push(...result.changes.nodesAdded);
        }
        if (result.changes.nodesRemoved) {
          currentNodes = currentNodes.filter(n => !result.changes.nodesRemoved!.includes(n.id));
          allChanges.nodesRemoved.push(...result.changes.nodesRemoved);
        }
        if (result.changes.nodesModified) {
          result.changes.nodesModified.forEach(modifiedNode => {
            const index = currentNodes.findIndex(n => n.id === modifiedNode.id);
            if (index !== -1) {
              currentNodes[index] = modifiedNode;
            }
          });
          allChanges.nodesModified.push(...result.changes.nodesModified);
        }
        if (result.changes.edgesAdded) {
          currentEdges.push(...result.changes.edgesAdded);
          allChanges.edgesAdded.push(...result.changes.edgesAdded);
        }
        if (result.changes.edgesRemoved) {
          currentEdges = currentEdges.filter(e => !result.changes.edgesRemoved!.includes(e.id));
          allChanges.edgesRemoved.push(...result.changes.edgesRemoved);
        }
      }
    }

    const successfulFixes = results.filter(r => r.success).length;
    
    return {
      success: successfulFixes > 0,
      message: `Applied ${successfulFixes}/${fixTypes.length} fixes successfully`,
      changes: allChanges
    };
  }

  /**
   * Validate workflow after fixes
   */
  static async validateAfterFix(nodes: any[], edges: any[]): Promise<{
    isValid: boolean;
    issues: string[];
    warnings: string[];
  }> {
    const issues = [];
    const warnings = [];

    // Check basic structure
    if (nodes.length === 0) {
      issues.push('Workflow is empty');
      return { isValid: false, issues, warnings };
    }

    // Check for start/end nodes  
    const hasStart = nodes.some(n => n.type === 'start' || n.data?.isStart);
    const hasEnd = nodes.some(n => n.type === 'end' || n.data?.isEnd);
    
    if (!hasStart) issues.push('Missing start node');
    if (!hasEnd) issues.push('Missing end node');

    // Check connections
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedCount = nodes.filter(node => !connectedNodes.has(node.id)).length;
    if (isolatedCount > 0) {
      warnings.push(`${isolatedCount} isolated nodes remain`);
    }

    // Check for invalid edges
    const nodeIds = new Set(nodes.map(n => n.id));
    const invalidEdges = edges.filter(edge => 
      !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
    );
    
    if (invalidEdges.length > 0) {
      issues.push(`${invalidEdges.length} invalid connections found`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }
}