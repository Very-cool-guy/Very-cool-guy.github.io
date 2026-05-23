(async function() {
        const BABYLON = window.BABYLON;
        const canvas = document.getElementById('niko-canvas');
        const engine = new BABYLON.Engine(canvas, true, { premultipliedAlpha: false, preserveDrawingBuffer: true });
        
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0.7, 1.8), scene);
        camera.setTarget(new BABYLON.Vector3(0, 0.7, 0));
        
        BABYLON.SceneLoader.ImportMeshAsync("", "resources/", "Niko.glb", scene).then(function(result) {
          result.meshes.forEach(function(mesh) {
            if (mesh.material) {
              if (mesh.material.emissiveColor === undefined) {
                mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
              }
              mesh.material.disableLighting = true;
            }
          });
          scene.onBeforeRenderObservable.add(function() {
            result.meshes.forEach(function(mesh) {
              mesh.rotation.y += 0.01;
            });
          });
        });

        BABYLON.SceneLoader.ImportMeshAsync("", "resources/", "i_just_want_my_style_bro.glb", scene).then(function(result) {
          result.meshes.forEach(function(mesh) {
            if (mesh.material) {
              if (mesh.material.emissiveColor === undefined) {
                mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
              }
              mesh.material.disableLighting = true;
            }
            mesh.position.y += 0.4;
          });
          scene.onBeforeRenderObservable.add(function() {
            result.meshes.forEach(function(mesh) {
              mesh.rotation.y += 0.05;
            });
          });
        });
        
        engine.runRenderLoop(() => scene.render());
        window.addEventListener('resize', () => engine.resize());
      })();