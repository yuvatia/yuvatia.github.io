import React, { useContext, useEffect, useState } from 'react';
import { gDirector, gEditorSystem } from './EngineCanvas';
import { MeshFilter, MeshRenderer, Tag } from './engine/src/components';
import { GetActiveScene } from './App';
import { GlobalState } from './GlobalState';
import { Form, InputGroup, ListGroup, Table } from 'react-bootstrap';
import { IoAddCircle } from 'react-icons/io5';
import { FaTrashCan } from "react-icons/fa6";
import { Transform } from './engine/src/transform';
import { FaDownload, FaSave, FaSearch, FaUpload } from 'react-icons/fa';
import { DownloadScene, UploadScene } from './SceneUtils';

export const NiceButton = ({ value, className, color, style, onClick, noEffects, ...props }) => {
  return (
    <button
      className={`bi ${className} color-state-override`}
      style={{
        border: 'none',
        backgroundColor: 'transparent',
        transition: 'transform 200ms',
        color,
        ...style
      }}
      onClick={onClick ? (e) => {
        e.stopPropagation();
        const target = e.currentTarget;
        target.style.transform = 'scale(1.2)';
        setTimeout(() => {
          target.style.transform = 'scale(1)';
        }, 200);
        onClick(value);
      } : () => { }}
      onMouseOver={noEffects ? () => { } : (e) => e.currentTarget.style.transform = 'scale(1.2)'}
      onMouseOut={noEffects ? () => { } : (e) => e.currentTarget.style.transform = 'scale(1)'}
      {...props}
    ></button>);
}

export const BigIcon = ({ AsIcon, onClick, ...props }) => {
  if (!onClick) return null;
  return (<AsIcon
    color="green"
    size={30}
    style={{ margin: '5% 2%', transition: 'transform 200ms', cursor: 'pointer' }}
    {...props}
    onClick={() => onClick()}
    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
  />);
}

export const ListItem = ({
  value,
  iconOverrides,
  selectedValue,
  selectedClass,
  doSetSelected,
  doDeselect,
  actions,
  onDelete,
  onLookup,
  onCopy,
  noHover,
  noHoverWhenSelected,
  hoverScale,
  style,
  selectedStyle,
  children }) => {
  const iconValues = { delete: 'bi-trash-fill', copy: 'bi-copy', lookup: 'bi-search', ...iconOverrides };
  const actionsFallback = [
    { className: iconValues.delete, onClick: onDelete, color: 'red' },
    { className: iconValues.copy, onClick: onCopy, color: 'var(--bs-link-color)' },
    { className: iconValues.lookup, onClick: onLookup, color: 'black' }
  ];
  const isSelected = (v) => {
    if (selectedValue && selectedValue.includes) {
      return selectedValue.includes(value);
    }
    return selectedValue === value;
  }
  return (
    <ListGroup.Item
      as='li'
      key={value}
      style={{ cursor: 'pointer', transition: 'transform 200ms', ...(isSelected(value) ? selectedStyle : style) }}
      className={`list-item ${isSelected(value) ? selectedClass : ''}`}
      onClick={(e) => {
        if (isSelected(value)) {
          doDeselect(value);
        } else {
          doSetSelected(value);
          if (noHoverWhenSelected) {
            e.currentTarget.style.transform = 'scale(1)';
          }
        }
      }}
      onMouseOver={noHover || (noHoverWhenSelected && isSelected(value)) ? () => { } : (e) => e.currentTarget.style.transform = `scale(${hoverScale || 1.1})`}
      onMouseOut={noHover ? () => { } : (e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {children}
      <div className='color-state-override' style={{ float: 'right', border: 'none', backgroundColor: 'transparent' }}>
        {(actions || actionsFallback).map(action => action.onClick ? <NiceButton value={value} {...action} /> : null)}
      </div>
    </ListGroup.Item>
  );
}

export const NiceList = ({
  values,
  selectedClass,
  selectedValue,
  doSetSelected,
  doDeselect,
  bottomMenu,
  doAdd,
  doClear,
  children,
  notSearchable,
  searchHint,
  ...props }) => {
  const bottomMenuFallback = [{ AsIcon: IoAddCircle, onClick: doAdd, color: 'green' },
  { AsIcon: FaTrashCan, onClick: doClear, color: 'red' }];
  const [search, setSearch] = useState('');
  const filteredValues = values.filter(value => {
    const iSearch = search.toLowerCase();
    return String(value).toLowerCase().includes(iSearch) || String(children(value)).toLowerCase().includes(iSearch);
  });

  return (
    <div>
      {notSearchable ? null :
        <InputGroup className="mb-3">
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            type="text"
            placeholder={searchHint || "Search..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>}
      <ListGroup>
        {filteredValues.map(value => (
          <ListItem
            value={value}
            selectedValue={selectedValue}
            selectedClass={selectedClass || "selectedEntity"}
            doSetSelected={doSetSelected}
            doDeselect={doDeselect}
            {...props}
          >
            {children(value)}
          </ListItem>

        ))}
      </ListGroup>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {(bottomMenu || bottomMenuFallback).map(entry => <BigIcon {...entry} />)}
      </div>
    </div>
  );
}

export const SceneView = () => {
  const { activeScene, setActiveScene, selectedEntity, setSelectedEntity } = useContext(GlobalState);
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
    const meshFilter = GetActiveScene().getComponent(entity, MeshFilter);
    if (!meshFilter || !meshFilter.meshRef || !meshFilter.meshRef.mesh) return;
    const mesh = meshFilter.meshRef.mesh;
    renderer.camera.focusAt(mesh.getBoundingBox().translate(position));
    // renderer.camera.lookAt(position);
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
    <div style={{ margin: 'min(1vw, 1vh)' }}>
      <NiceList
        values={entities.filter(entity => GetActiveScene().hasComponent(entity, Tag))}
        searchHint={"Search for entity..."}
        selectedValue={selectedEntity}
        doSetSelected={doSetSelected}
        doDeselect={doDeselect}
        actions={[
          { className: 'bi-trash-fill', onClick: doRemove, color: 'red' },
          { className: 'bi-copy', onClick: doClone, color: 'var(--bs-link-color)' },
          { className: 'bi-search', onClick: doFocus, color: 'black' }
        ]}
        bottomMenu={[
          { AsIcon: IoAddCircle, onClick: doAdd, color: 'green' },
          { AsIcon: FaTrashCan, onClick: doClear, color: 'red' },
          { AsIcon: FaSave, onClick: () => { }, color: 'black' },
          { AsIcon: FaDownload, onClick: () => DownloadScene(GetActiveScene()), className: 'controlIcon', color: 'red' },
        ]}
      >
        {(entity) => {
          // Solves a race when SceneView is rendering while scene is destroyed
          if (!activeScene.getComponent(entity, Tag)) {
            return null;
          }
          return (activeScene.getComponent(entity, Tag).name);
        }}
      </NiceList>
    </div>
  );
};
