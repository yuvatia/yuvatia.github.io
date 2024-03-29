import { useContext, useEffect, useState } from 'react';
import { gEditorSystem } from './EngineCanvas';
import { GlobalState } from './GlobalState';
import { Accordion, CloseButton } from 'react-bootstrap';
import { GenericInput } from './GenericInput';
import { Tag } from './engine/src/components';

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
    // The issue seems to be that componentview refreshes only when selectedEntity changes, need to solve  
    // Sync from global state
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
    <Accordion>
      <Accordion.Header>
        {getHeader()}
        {isRemovable() ? <CloseButton onClick={removeMe}></CloseButton> : null}
      </Accordion.Header>
      <Accordion.Body>
        {fields.map((fieldEntry) => {
          const name = (fieldEntry.constructor.name === String.name) ? fieldEntry : fieldEntry.name;
          if (!component.hasOwnProperty(name)) return;
          const fieldType = fieldEntry.constructor.name === String.name ? component[name].constructor.name : fieldEntry.type;
          return (
            <GenericInput
              fieldType={fieldType}
              name={name}
              value={component[name]}
              onVectorChange={updateVectorField}
              onChange={UpdateField}>
            </GenericInput>
          )
        })}
      </Accordion.Body>
    </Accordion>
  );
};

