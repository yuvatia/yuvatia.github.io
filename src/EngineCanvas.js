import { useEffect, useRef } from "react";
import { SimpleDirector } from "./engine/src/Director";


class EditorSystem {
    callbacks = [];
    scene = null;

    getName() {
        return 'Editor';
    }

    subscribe(callback) {
        this.callbacks.push(callback);
    }

    onSetActiveScene(scene) {
        this.scene = scene;
        this.#raiseEvent("onSetActiveScene", scene);
    }

    unsubscribe(callback) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }

    #raiseEvent(name, ...args) {
        // This is the performance bottleneck
        this.callbacks.forEach(cb => {
            cb({ name, data: { ...args } });
        });
    }

    onFrameStart(scene, renderer, dt) {
        this.#raiseEvent("onFrameStart", scene, renderer, dt);
    }
    renderScene(scene, renderer, dt) {
        // this.#raiseEvent("renderScene", scene, renderer, dt);
    }
    onFixedStep(scene, renderer) {
        // this.#raiseEvent("onFixedStep", scene, renderer);
    }
};

export const gEditorSystem = new EditorSystem();
// export let gDirector = null;

export const EngineCanvas = ({ director, setDirector, id }) => {
    const color = useRef(null);
    const stencil = useRef(null);
    const depth = useRef(null);

    useEffect(() => {
        if (director) {
            console.log("Director already initialized, skipping...");
            return;
        }

        director = SimpleDirector(color.current, depth.current, stencil.current, false);
        director.registerSystem(gEditorSystem);

        director.setFpsTarget(60);
        director.start();

        setDirector(director);

        // return () => {
        //     gDirector.stop();
        //     gDirector.unsubscribeFromEvents();
        //     gDirector = null;
        // };
    }, []);

    return (
        <div className="canvas-container">
            <canvas className='color-canvas' ref={color} id={`${id}-color`}></canvas>
            <canvas className='depth-canvas' ref={depth} id={`${id}-depth`} hidden></canvas>
            <canvas className='stencil-canvas' ref={stencil} id={`${id}-stencil`} hidden></canvas>
        </div>
    );
}
