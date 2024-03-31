import { gDirector } from "./EngineCanvas";
import { Reviver } from "./engine/src/reviver";
import { Scene } from "./engine/src/scene";

export const DownloadScene = (scene) => {
    const serializedScene = JSON.stringify(scene);
    // Save scene to file, file is a JSON file, we save by:
    const blob = new Blob([serializedScene], { type: 'application/json' });

    // Create an invisible link
    const link = document.createElement('a');
    link.style.display = 'none';

    // Set the download attribute and href
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${scene.name}.json`);

    // Append the link to the body and trigger a click event
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
}

export const UploadScene = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = function (e) {
        const content = e.target.result;
        const scene = JSON.parse(content, Reviver.parse);
        if (scene.constructor.name === Scene.name) {
            // Used to be not commented out, shouldn't be needed though?
            // setActiveScene(scene);
            gDirector.setActiveScene(scene);
        }
    };
    reader.readAsText(file);
}