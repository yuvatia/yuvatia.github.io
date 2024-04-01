import { useContext, useEffect, useState } from 'react';
import { gEditorSystem } from './EngineCanvas';
import { GlobalState } from './GlobalState';
import { Accordion, Button, CloseButton, Table } from 'react-bootstrap';
import { GenericInput } from './GenericInput';
import { Tag } from './engine/src/components';

export const GenericObjectForm = ({ fields, component, updateVectorField, UpdateField }) => (
  <Table hover>
    <tbody>
      {fields.map((fieldEntry) => {
        const name = (fieldEntry.constructor.name === String.name) ? fieldEntry : fieldEntry.name;
        if (!component.hasOwnProperty(name)) return null;
        const fieldType = fieldEntry.constructor.name === String.name ? component[name].constructor.name : fieldEntry.type;
        return (
          <tr key={name}>
            <td>{name}</td>
            <td>
              <GenericInput
                fieldType={fieldType}
                name={name}
                value={component[name]}
                onVectorChange={updateVectorField}
                onChange={UpdateField}
              />
            </td>
          </tr>
        );
      })}
    </tbody>
  </Table>
);

export const ComponentView = ({ type, typename, entity, activeScene, fields, removeMe }) => {
  const [component, setComponent] = useState(null);

  const updateVectorField = (name, axis, value) => {
    // setComponent({
    //   ...component,
    //   [name]: {
    //     ...component[name],
    //     [axis]: value
    //   }
    // });
    // Sync global state
    activeScene.getComponent(entity, type)[name][axis] = value;
    refreshComponent();
  };

  const UpdateField = (name, value) => {
    setComponent({
      ...component,
      [name]: value
    });
    // Sync global state
    activeScene.getComponent(entity, type)[name] = value;
    // refreshComponent();
  }

  const refreshComponent = () => {
    const entComponent = activeScene.getComponent(entity, type);
    if (!entComponent) return;
    setComponent({ ...entComponent });
  };

  // Update component whenever entity is changed
  useEffect(() => {
    refreshComponent();
  }, [entity]);

  // Or when active scene schanges
  useEffect(() => {
    refreshComponent();
  }, [activeScene]);

  useEffect(() => {
    refreshComponent();
  }, []);

  // Subscribe to frame events for refresh
  useEffect(() => {
    const onEngineEvent = (event) => {
      if (event.name === "onSetActiveScene" || event.name === "onFrameStart") {
        refreshComponent();
      }
    }

    gEditorSystem.subscribe(onEngineEvent);
    return () => {
      gEditorSystem.unsubscribe(onEngineEvent);
    };
  }, [entity, activeScene]); // // runs on - mount, cleanup, entity change. Important due to binding of refreshComponent


  if (!activeScene || !activeScene.isEntityValid(entity)) return null;
  if (!component) return null;

  const isRemovable = () => {
    return type.name !== Tag.name;
  }

  const getHeader = () => {
    if (type.name === Tag.name) {
      // Header is the name of the entity
      return `Tag (${activeScene.getComponent(entity, type).name})`;
    }
    // Header is the name of the component
    return typename;
  }

  return (
    <Accordion
      style={{ borderBottom: '1px solid #dee2e6', position: 'relative' }}
    >
      <Accordion.Header
        style={{ transition: 'transform 200ms' }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {getHeader()}
        {isRemovable() ?
          <button
            className='bi bi-trash-fill color-state-override'
            style={{
              position: 'absolute',
              right: '40px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              backgroundColor: 'transparent',
              transition: 'transform 200ms',
            }}
            onClick={(e) => {
              const target = e.currentTarget;
              target.style.transform = 'translateY(-50%) scale(1.2)';
              setTimeout(() => {
                target.style.transform = 'translateY(-50%) scale(1)';
              }, 200);
              removeMe();
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1.2)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
          ></button>
          : null}
      </Accordion.Header>
      <Accordion.Body>
        <GenericObjectForm
          fields={fields}
          component={component}
          updateVectorField={updateVectorField}
          UpdateField={UpdateField}
        />
      </Accordion.Body>
    </Accordion>
  );
};

