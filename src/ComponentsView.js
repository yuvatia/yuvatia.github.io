import React, { useContext, useEffect, useState } from 'react';
import { Transform } from './engine/src/transform';
import { Tag, DirectionalLight, Material, MeshFilter, MeshRenderer } from './engine/src/components';
import { gEditorSystem } from './EngineCanvas';
import { ComponentView } from './ComponentView';
import { GlobalState } from './GlobalState';
import { Dropdown } from 'react-bootstrap';
import { FollowConstraint, Rigidbody } from './engine/src/kinematics';
import { IoAddCircle } from 'react-icons/io5';

export const ComponentSpecification = {
  Tag: {
    type: Tag,
    fields: ["name"]
  },
  Transform: {
    type: Transform,
    fields: ["position", "rotation", "scale"]
  },
  MeshRenderer: {
    type: MeshRenderer,
    fields: ["shading", "writeIdToStencil"]
  },
  Material: {
    type: Material,
    fields: ["diffuseColor", "faceColoring"]
  },
  DirectionalLight: {
    type: DirectionalLight,
    fields: ["color", "intensity", "direction"]
  },
  MeshFilter: {
    type: MeshFilter,
    fields: []  // For now
  },
  Rigidbody: {
    type: Rigidbody,
    // Missing collider, invMass. We remove Transform though
    fields: ["mass", "friction", "restitution", "linearVelocity", "linearDamping", "angularVelocity", "angularDamping", "gravityScale"]
  },
  FollowConstraint: {
    type: FollowConstraint,
    fields: ["rb1ID", "rb2ID", "rb1Anchor"]
  }
};


export const ComponentsView = ({ entity, activeScene }) => {
  // const { activeScene } = useContext(GlobalState);
  const [availableTypes, setAvailableTypes] = useState([]);

  // Missing: MeshFilter, Kinematics (FollowConstraint, Rigidbody, Collider)

  const refreshAvailableComponents = () => {
    const available = Object.keys(ComponentSpecification).filter(name => activeScene.hasComponent(entity, ComponentSpecification[name].type));
    setAvailableTypes(available);
  };

  const getUnavailableComponents = () => {
    return Object.keys(ComponentSpecification).filter(name => !activeScene.hasComponent(entity, ComponentSpecification[name].type));
  };

  const doAdd = (component) => {
    activeScene.addComponent(entity, component);
    refreshAvailableComponents();
  };

  const doRemove = (component) => {
    activeScene.removeComponent(entity, component);
    refreshAvailableComponents();
  };

  useEffect(() => {
    const onEngineEvent = (event) => {
      if (event.name === "onFrameStart" || event.name == "onSetActiveScene") {
        refreshAvailableComponents();
      }
    }

    gEditorSystem.subscribe(onEngineEvent);
    return () => {
      gEditorSystem.unsubscribe(onEngineEvent);
    };
  }, [entity]);  // See doc in ComponentView


  return (
    <React.Fragment>
      {availableTypes.map(name => {
        const { type, fields } = ComponentSpecification[name];
        return (
          !!activeScene.getComponent(entity, type) ?
            <ComponentView
              key={type}
              activeScene={activeScene}
              typename={name}
              type={type}
              entity={entity}
              fields={fields}
              removeMe={() => doRemove(type)} />
            :
            null
        );
      })}
      <Dropdown onSelect={(type) => {
        doAdd(ComponentSpecification[type].type)
      }}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          <IoAddCircle />
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {getUnavailableComponents().map(name => {
            return (
              <Dropdown.Item className="dropdown-item-hover" key={name} eventKey={name}>
                {name}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </React.Fragment>
  );
};
