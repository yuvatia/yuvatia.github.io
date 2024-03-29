import { Col, Form, Row } from 'react-bootstrap';


import { VectorView } from './VectorView';
import { Point, Vector } from './engine/src/math';
import { Tag, UUID, UUIDComponent } from './engine/src/components';
import React, { useContext, useEffect, useState } from 'react';
import { GlobalState } from './GlobalState';
import { gEditorSystem } from './EngineCanvas';


export const EntitySelector = ({ value, onChange }) => {
  const { activeScene } = useContext(GlobalState);

  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);

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

  return (
    activeScene &&
    <Form.Select defaultValue={value && value.uuid ? value.uuid : UUID.empty} onChange={(e) => {
      const res = e.target.value === "null" ? null : e.target.value;
      const selectedUUID = Object.assign(new UUID(), { value: res });
      onChange(selectedUUID)
    }}>
      <option value={UUID.empty}>
        None
      </option>
      {entities.map(entity => {
        // There's a race when playing the scene
        if (!activeScene || !activeScene.getComponent(entity, Tag)) {
          return null;
        }
        const tag = activeScene.getName(entity);
        const uuid = activeScene.getComponent(entity, UUIDComponent);
        return (
          <option value={uuid.uuid}>
            {tag}
          </option>
        )
      })}
    </Form.Select>)
}


export const GenericInput = ({ fieldType, name, value, onChange, onVectorChange }) => {
  switch (fieldType) {
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
        <Form.Group key={name}>
          <Row>
            <Col>
              <Form.Label>{name}</Form.Label>
            </Col>
            <Col>
              <Form.Control
                key={`${fieldType}.${name}`}
                type="text"
                value={value}
                onChange={({ currentTarget }) => onChange(name, currentTarget.value)}
              />
            </Col>
          </Row>
        </Form.Group>
      );
    case Number.name:
      return (
        <Form.Group as={Row} key={name} className="mb-3">
          <Form.Label column sm="3">
            {name}
          </Form.Label>
          <Col sm="9">
            <Form.Control
              type="number"
              value={value}
              onChange={({ currentTarget }) =>
                onChange(name, Number(currentTarget.value))
              }
            />
          </Col>
        </Form.Group>
      );
    case Boolean.name:
      return (
        <Form.Check
          type="checkbox"
          id={name}
          label={name + '?'}
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
          <p>{name}</p>
          <p>No specialized input for {fieldType}</p>
        </div>
      );
  }
};
