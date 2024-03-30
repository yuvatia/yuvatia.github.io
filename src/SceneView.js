import React, { useContext, useEffect, useState } from 'react';
import { gDirector, gEditorSystem } from './EngineCanvas';
import { MeshRenderer, Tag } from './engine/src/components';
import { GetActiveScene } from './App';
import { GlobalState } from './GlobalState';
import { Form, InputGroup, ListGroup, Table } from 'react-bootstrap';
import { IoAdd, IoAddCircle, IoTrashBin } from 'react-icons/io5';
import { Camera } from './engine/src/camera';
import { Transform } from './engine/src/transform';
import { FaSearch } from 'react-icons/fa';

export const NiceButton = ({ value, className, style, onClick }) => {
  return (
    <button
      className={`bi ${className} color-state-override`}
      style={{
        border: 'none',
        backgroundColor: 'transparent',
        transition: 'transform 200ms',
        ...style
      }}
      onClick={(e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        target.style.transform = 'scale(1.2)';
        setTimeout(() => {
          target.style.transform = 'scale(1)';
        }, 200);
        onClick(value);
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    ></button>);
}

export const ListItem = ({ value, selectedValue, selectedClass, doSetSelected, doDeselect, onDelete, onLookup, onCopy, children }) => {
  return (
    <ListGroup.Item
      as='li'
      key={value}
      style={{ cursor: 'pointer', transition: 'transform 200ms' }}
      className={selectedValue === value ? selectedClass : ""}
      onClick={() => selectedValue === value ? doDeselect() : doSetSelected(value)}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
      <div className='color-state-override' style={{ float: 'right', border: 'none', backgroundColor: 'transparent' }}>
        {onDelete ? <NiceButton value={value} className='bi-trash-fill' style={{ color: 'red' }} onClick={onDelete} /> : null}
        {onCopy ? <NiceButton value={value} className='bi-copy' style={{ color: 'blue' }} onClick={onCopy} /> : null}
        {onLookup ? <NiceButton value={value} className='bi-search' style={{ color: 'black' }} onClick={onLookup} /> : null}
      </div>
    </ListGroup.Item>
  );
}

export const NiceList = ({ values, selectedValue, doSetSelected, doDeselect, doRemove, doFocus, doClone, doAdd, doClear, children }) => {
  const [search, setSearch] = useState('');
  const filteredValues = values.filter(value => {
    const iSearch = search.toLowerCase();
    return String(value).toLowerCase().includes(iSearch) || String(children(value)).toLowerCase().includes(iSearch);
  });

  return (
    <div>
      <InputGroup className="mb-3">
        <InputGroup.Text><FaSearch /></InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </InputGroup>
      <ListGroup>
        {filteredValues.map(value => (
          <ListItem
            value={value}
            selectedValue={selectedValue}
            selectedClass="selectedEntity"
            doSetSelected={doSetSelected}
            doDeselect={doDeselect}
            onDelete={doRemove}
            onLookup={doFocus}
            onCopy={doClone}
          >
            {children(value)}
          </ListItem>

        ))}
      </ListGroup>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {doAdd ? <IoAddCircle
          color="green"
          size={30}
          style={{ margin: '5% 2%', transition: 'transform 200ms', cursor: 'pointer' }}
          onClick={() => doAdd()}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        /> : null}
        {doClear ? <IoTrashBin
          color="red"
          size={30}
          style={{ margin: '5% 2%', transition: 'transform 200ms', cursor: 'pointer' }}
          onClick={() => doClear()}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        /> : null}
      </div>
    </div>
  );
}

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
    const newEntity = GetActiveScene().cloneEntity(entity);
    refreshEntities();
    setSelectedEntity(newEntity);
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
    console.log(entity);
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

  const doFocus = (entity) => {
    if (!gDirector) return;
    if (!GetActiveScene().hasComponent(entity, Transform)) return;
    const position = GetActiveScene().getComponent(entity, Transform).position;
    const renderer = gDirector.renderer;
    if (!renderer) return;
    renderer.camera.lookAt(position);
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
    <NiceList
      values={entities.filter(entity => GetActiveScene().hasComponent(entity, Tag))}
      selectedValue={selectedEntity}
      doSetSelected={doSetSelected}
      doDeselect={doDeselect}
      doRemove={doRemove}
      doFocus={doFocus}
      doClone={doClone}
      doAdd={doAdd}
      doClear={doClear}
    >
      {(entity) => {
        // Solves a race when SceneView is rendering while scene is destroyed
        if (!activeScene.getComponent(entity, Tag)) {
          return null;
        }
        return (activeScene.getComponent(entity, Tag).name);
      }}
    </NiceList>
  );
};
