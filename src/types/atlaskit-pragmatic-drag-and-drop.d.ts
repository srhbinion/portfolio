declare module '@atlaskit/pragmatic-drag-and-drop/dist/esm/entry-point/element/adapter' {
  import type { CleanupFn, ElementDragType, DropTargetArgs } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
  
  type DraggableArgs = {
    element: HTMLElement;
    dragHandle?: Element;
    canDrag?: (args: any) => boolean;
    getInitialData?: (args: any) => Record<string, unknown>;
    getInitialDataForExternal?: (args: any) => Record<string, string>;
    [key: string]: any;
  };

  export function draggable(args: DraggableArgs): CleanupFn;
  export function dropTargetForElements(args: DropTargetArgs<ElementDragType>): CleanupFn;
  export function monitorForElements(args: any): CleanupFn;
  
  export type { 
    ElementEventBasePayload, 
    ElementEventPayloadMap, 
    ElementDropTargetEventPayloadMap,
    ElementDropTargetEventBasePayload,
    ElementGetFeedbackArgs,
    ElementDropTargetGetFeedbackArgs,
    ElementMonitorGetFeedbackArgs
  } from '@atlaskit/pragmatic-drag-and-drop/dist/types/entry-point/element/adapter';
}

