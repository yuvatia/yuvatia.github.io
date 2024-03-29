import React, { useContext, useEffect, useState } from 'react';
import { gEditorSystem } from './EngineCanvas';
import { Tag } from './engine/src/components';
import { GetActiveScene } from './App';
import { GlobalState } from './GlobalState';
import { CloseButton, Table } from 'react-bootstrap';
import { IoAddCircle } from 'react-icons/io5';

export const SceneView = () => {
  const { activeScene, selectedEntity, setSelectedEntity } = useContext(GlobalState);
  const [entities, setEntities] = useState([]);

  const refreshEntities = () => {
    setEntities(GetActiveScene().getEntities().map(({ id: entity }) => entity));
  };

  const doRemove = (entity) => {
    GetActiveScene().destroyEntity(entity);
    refreshEntities();
  };

  const doAdd = () => {
    GetActiveScene().newEntity();
    refreshEntities();
  };

  useEffect(() => {
    const onEngineEvent = (event) => {
      if (event.name === "onFrameStart" || event.name == "onSetActiveScene") {
        refreshEntities();
      }
    };

    gEditorSystem.subscribe(onEngineEvent);
    return () => {
      gEditorSystem.unsubscribe(onEngineEvent);
    };
  }, [activeScene]); // Empty array means this effect runs once on mount and cleanup on unmount

  return (
    <div>
      <Table striped bordered hover>
        <tbody>
          {entities.map(entity => {
            // Solves a race when SceneView is rendering while scene is destroyed
            if (!activeScene.getComponent(entity, Tag)) {
              return null;
            }
            return (
              <tr key={`${entity}`} onClick={() => setSelectedEntity(entity)}>
                {activeScene.getComponent(entity, Tag).name}
                <CloseButton onClick={() => doRemove(entity)}></CloseButton>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <IoAddCircle onClick={() => doAdd()} />
    </div>
  );
};
