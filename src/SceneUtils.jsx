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

export const UploadScene = () => {
    return new Promise((resolve, reject) => {
        // Create a new button element
        const button = document.createElement('button');
        button.textContent = 'Upload Scene';

        // Create a hidden file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.style.display = 'none';

        // Attach an event listener to the file input
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();

            reader.onload = function (e) {
                const content = e.target.result;
                try {
                    const scene = JSON.parse(content, Reviver.parse);
                    if (scene.constructor.name === Scene.name) {
                        // Resolve the promise with the scene
                        resolve(scene);
                    } else {
                        reject('Invalid scene');
                    }
                } catch (error) {
                    reject(`${error}`);
                } finally {
                    // Remove the button and file input
                    document.body.removeChild(button);
                    document.body.removeChild(fileInput);
                }
            };
            reader.readAsText(file);
        });

        // Attach an event listener to the button
        button.addEventListener('click', () => {
            // Trigger the file input when the button is clicked
            fileInput.click();
        });

        // Append the button and file input to the body
        document.body.appendChild(button);
        document.body.appendChild(fileInput);

        // Trigger
        button.click();
    });
}
