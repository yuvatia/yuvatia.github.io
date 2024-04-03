import { useEffect, useState } from "react";
import { SimpleDirector } from "./engine/src/Director"
import { Renderer } from "./engine/src/renderer"
import { Material, MeshFilter, MeshRenderer } from "./engine/src/components";
import { DCELRepresentation } from "./engine/src/halfmesh";
import { Cube } from "./engine/src/geometry";
import { Point, Vector } from "./engine/src/math";
import { Tag } from "./engine/src/scene";
import { Transform } from "./engine/src/transform";
import { setupScene } from "./engine/src/script";


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
export let gDirector = null;

export const EngineCanvas = () => {
    const [activeBuffer, setActiveBuffer] = useState('color');
    useEffect(() => {
        if (gDirector) {
            console.log("Director already initialized, skipping...");
            return;
        }

        const buffers = ["color", "depth", "stencil"].map(name => document.getElementById(name)).filter(e => e !== null);
        if (!buffers || buffers.length != 3) {
            console.log("Buffers not available yet, postponing initialization");
            return;
        }
        const [color, depth, stencil] = buffers;
        gDirector = SimpleDirector(color, depth, stencil, false);
        gDirector.registerSystem(gEditorSystem);

        gDirector.setFpsTarget(60);
        gDirector.start();

        // return () => {
        //     gDirector.stop();
        //     gDirector.unsubscribeFromEvents();
        //     gDirector = null;
        // };
    }, []);

    return (
        <div style={{ width: "100%", height: "100%", touchAction: "none" }}>
            <canvas id="color"></canvas>
            <canvas id="depth" hidden></canvas>
            <canvas id="stencil" hidden></canvas>
        </div>
    );
}
