export enum WorkspaceActions {
  CHANGEMAPPROJECTION = 'change-map-projection',
}

interface WorkspaceOptions {
  workspaceAction: WorkspaceActions | string ;
  mapProjection: string;
}

export const setWorkspaceParameters = (options: WorkspaceOptions) => {
  return options;
}
