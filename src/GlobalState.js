import { createContext } from 'react';



export const GlobalState = createContext({
  activeScene: null,
  backupScene: null,  // activeScene is forked to backupScene when we start playing
  selectedEntity: -1
});
