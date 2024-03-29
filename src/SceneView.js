import React, { useContext, useEffect, useState } from 'react';
import { gEditorSystem } from './EngineCanvas';
import { MeshRenderer, Tag } from './engine/src/components';
import { GetActiveScene } from './App';
import { GlobalState } from './GlobalState';
import { ListGroup, Table } from 'react-bootstrap';
import { IoAdd, IoAddCircle, IoTrashBin } from 'react-icons/io5';

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

  const doClone = (entity) => {
    GetActiveScene().cloneEntity(entity);
    refreshEntities();
  }

  const doAdd = () => {
    GetActiveScene().newEntity();
    refreshEntities();
  };

  const doClear = () => {
    GetActiveScene().clear();
    refreshEntities();
  }

  const doSetSelected = (entity) => {
    // First, set outline of currently selected to false, if valid
    if (GetActiveScene().isEntityValid(selectedEntity)) {
      GetActiveScene().forceGetComponent(selectedEntity, MeshRenderer).outline = false;
    }
    // Outline selected entity
    GetActiveScene().forceGetComponent(entity, MeshRenderer).outline = true;
    setSelectedEntity(entity);
  }

  const doDeselect = () => {
    if (GetActiveScene().isEntityValid(selectedEntity)) {
      GetActiveScene().forceGetComponent(selectedEntity, MeshRenderer).outline = false;
    }
    setSelectedEntity(-1);
  }

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
      <ListGroup>
        {/* <Table striped bordered hover>
        <tbody> */}
        {entities.map(entity => {
          // Solves a race when SceneView is rendering while scene is destroyed
          if (!activeScene.getComponent(entity, Tag)) {
            return null;
          }
          return (
            <ListGroup.Item
              as='li'
              key={`${entity}`}
              style={{ cursor: 'pointer', transition: 'transform 200ms' }}
              className={selectedEntity === entity ? "selectedEntity" : ""}
              onClick={() => selectedEntity === entity ? doDeselect() : doSetSelected(entity)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {activeScene.getComponent(entity, Tag).name}
              <div className='color-state-override' style={{ float: 'right', border: 'none', backgroundColor: 'transparent' }}>
                <button
                  className='bi bi-trash-fill color-state-override'
                  style={{
                    color: 'red',
                    border: 'none',
                    backgroundColor: 'transparent',
                    transition: 'transform 200ms',
                  }}
                  onClick={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                      target.style.transform = 'scale(1)';
                    }, 200);
                    doRemove(entity);
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                ></button>
                <button
                  className='bi bi-copy color-state-override'
                  style={{
                    border: 'none',
                    color: 'blue',
                    backgroundColor: 'transparent',
                    transition: 'transform 200ms',
                  }}
                  onClick={(e) => {
                    const target = e.currentTarget;
                    target.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                      target.style.transform = 'scale(1)';
                    }, 200);
                    doClone(entity);
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                ></button>
              </div>
            </ListGroup.Item>
          );
        })}
        {/* </tbody>
      </Table> */}
      </ListGroup>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <IoAddCircle
          color="green"
          size={30}
          style={{ margin: '5% 2%', transition: 'transform 200ms', cursor: 'pointer' }}
          onClick={() => doAdd()}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        <IoTrashBin
          color="red"
          size={30}
          style={{ margin: '5% 2%', transition: 'transform 200ms', cursor: 'pointer' }}
          onClick={() => doClear()}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>
    </div>
  );
};
