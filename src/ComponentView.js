import { useEffect, useState } from 'react';
import { Collapse, Table, useAccordionButton } from 'react-bootstrap';
import { gEditorSystem } from './EngineCanvas';
import { GenericInput } from './GenericInput';
import { NiceList } from './SceneView';
import { Tag } from './engine/src/components';

export const GenericObjectForm = ({ fields, component, updateVectorField, UpdateField }) => {
  if (fields === null) {
    return null;
  }
  return (
    <Table hover>
      <tbody>
        {fields.map((fieldEntry) => {
          if (fieldEntry === null) {
            console.log(`Null field entry in ${component.constructor.name}`);
            return;
          }
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
  )
};

export const ComponentView = ({ type, typename, entity, activeScene, fields, removeMe }) => {
  const [component, setComponent] = useState(null);
  const [open, setOpen] = useState(false);

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
    <>
      <NiceList
        notSearchable
        values={[type]}
        selectedValue={null}
        doSetSelected={() => { setOpen(!open) }}
        doDeselect={() => { setOpen(!open) }}
        actions={[
          { className: open ? 'bi-chevron-up' : 'bi-chevron-down', onClick: () => setOpen(!open), color: 'var(--bs-link-color)' },
          { className: 'bi-trash-fill', onClick: isRemovable() ? () => removeMe() : null, color: 'red' },
        ]}
      >
        {value => {
          return (
            <>
              {getHeader()}
            </>
          )
        }}
      </NiceList>
      <Collapse in={open}>
        <div>
          <GenericObjectForm
            fields={fields}
            component={component}
            updateVectorField={updateVectorField}
            UpdateField={UpdateField}
          />
        </div>
      </Collapse>
    </>
  );
};

