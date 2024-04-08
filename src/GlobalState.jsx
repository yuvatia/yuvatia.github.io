import { createContext } from 'react';

export const GlobalState = createContext({
  activeScene: null,
  editorSystem: null
});
