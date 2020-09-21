export enum AppEvents {
  SET_LUCIADMAP = 'MAP/SET/LUCIADMAP',
  SET_CURRENT_LAYER = 'MAP/SET/CURRENTLAYER',
  SET_MAP_PROJECTION = 'MAP/SET/PROJECTION',
  SET_MAP_FAVORITE_2D_PROJECTION = 'MAP/SET/2D/PROJECTION',
  SET_RULER_2D = 'MAP/SET/RULER/2D',
  SET_RULER_3D = 'MAP/SET/RULER/3D',


  COMMAND_SEND = 'COMMAND/SEND',
  COMMAND_COMPLETE = 'COMMAND/COMPLETE',
  COMMAND_CANCEL = 'COMMAND/CANCEL',

  SET_CONTEXTMENU = 'WINDOWMANAGER/SET/CONTEXTMENU',
  SET_WINDOWS = 'WINDOWMANAGER/SET/WINDOWS',
  SET_TOP_WINDOW = 'WINDOWMANAGER/SET/TOP/WINDOWS',
}
