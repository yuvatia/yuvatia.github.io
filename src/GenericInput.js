import { Col, Form, Row } from 'react-bootstrap';


import { VectorView } from './VectorView';
import { Point, Vector } from './engine/src/math';
import { Tag, UUID, UUIDComponent } from './engine/src/components';
import React, { useContext, useEffect, useState } from 'react';
import { GlobalState } from './GlobalState';
import { gEditorSystem } from './EngineCanvas';
import { Asset, MeshAsset } from './engine/asset';

function GenericSelect({ defaultValue, noneValue, onChange, options }) {
  return (
    <Form.Select value={defaultValue} onChange={(e) => onChange(e.target.value)}>
      {noneValue ?
        (<option value={noneValue}>
          None
        </option>) : null}
      {options.map(({ value, display }) => (
        <option value={value}>
          {display}
        </option>
      ))}
    </Form.Select>
  );
}


export const EntitySelector = ({ value, onChange }) => {
  const { activeScene } = useContext(GlobalState);

  const [entities, setEntities] = useState([]);

  const refreshEntities = () => {
    setEntities(activeScene.getEntities().map(({ id: entity }) => entity));
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


  const options = entities.map(entity => {
    if (!activeScene || !activeScene.getComponent(entity, Tag)) {
      return null;
    }
    const tag = activeScene.getName(entity);
    const uuid = activeScene.getComponent(entity, UUIDComponent);
    return { value: uuid.uuid, display: tag };
  }).filter(Boolean);

  const defaultValue = value || UUID.empty;
  const handleOnChange = (value) => {
    const res = value === "null" ? null : value;
    const selectedUUID = Object.assign(new UUID(), { value: res });
    onChange(selectedUUID)
  };

  return (
    <GenericSelect defaultValue={defaultValue} noneValue={UUID.empty} onChange={handleOnChange} options={options} />
  );
}

export const AssetSelector = ({ AssetType, value, onChange }) => {
  const { activeScene } = useContext(GlobalState);

  const [assets, setAssets] = useState([]);

  const refreshAssets = () => {
    setAssets(Asset.filter(v => v instanceof AssetType));
  };

  useEffect(() => {
    const onEngineEvent = (event) => {
      if (event.name === "onFrameStart" || event.name == "onSetActiveScene") {
        refreshAssets();
      }
    };

    gEditorSystem.subscribe(onEngineEvent);
    return () => {
      gEditorSystem.unsubscribe(onEngineEvent);
    };
  }, [activeScene]); // Empty array means this effect runs once on mount and cleanup on unmount


  const options = assets.map(asset => {
    return { value: asset.name, display: asset.name };
  }).filter(Boolean);

  const defaultValue = value.name;
  const handleOnChange = (value) => {
    onChange(Asset.get(value) || Asset.empty);
  };

  return (
    <GenericSelect defaultValue={defaultValue} noneValue={UUID.empty} onChange={handleOnChange} options={options} />
  );
}


export const GenericInput = ({
  fieldType,
  name,
  value,
  onChange,
  onVectorChange }) => {
  const type = fieldType || value.type;
  if (value instanceof Asset) {
    return (
      <AssetSelector AssetType={value.constructor} value={value} onChange={(value) => onChange(name, value)} />
    )
  }
  switch (type) {
    case Vector.name:
    case Point.name:
      return (
        <VectorView
          key={name}
          name={name}
          vector={value}
          onChange={(axis, value) => {
            onVectorChange(name, axis, value);
          }}></VectorView>
      );
    case String.name:
      return (
        <Form.Control
          key={`${fieldType}.${name}`}
          type="text"
          value={value}
          onChange={({ currentTarget }) => onChange(name, currentTarget.value)}
        />
      );
    case Number.name:
      return (
        <Form.Control
          type="number"
          value={value}
          onChange={({ currentTarget }) =>
            onChange(name, Number(currentTarget.value))
          }
        />
      );
    case Boolean.name:
      return (
        <Form.Check
          type="checkbox"
          id={name}
          checked={value}
          onChange={({ currentTarget }) => onChange(name, currentTarget.checked)}
          style={{ display: 'flex', flexDirection: 'row', gap: '1vw' }}
        />
      );
    case UUID.name:
      return (
        <EntitySelector value={value} onChange={(value) => onChange(name, value)} />
      )
    default:
      return (
        <div key={name}>
          <p>No specialized input for {fieldType}</p>
        </div>
      );
  }
};
