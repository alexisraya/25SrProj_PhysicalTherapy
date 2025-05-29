<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  export let modelPath = ''; // Path to the 3D model
  let container;
  let mixer; // Animation mixer
  let scene, camera, renderer, controls, loader;
  let currentModel = null; // Track the current model
  let animationId; // Track animation frame
  let isLoadingModel = false; // Track loading state
  console.log('MODEL PATH');
  console.log(modelPath);

  function handleResize() {
    if (!container) return;

    // Force a specific aspect ratio if needed
    const aspectRatio = 9 / 16; // Or whatever ratio works best for your model

    // Check what layout we're in (mobile vs desktop)
    const isMobile = window.innerWidth < 800;

    // Set a consistent height based on width and aspect ratio
    if (isMobile) {
      container.style.height = `${container.clientWidth / aspectRatio}px`;
    } else {
      // For desktop you might want a different approach
      container.style.height = '50vh'; // Or another value
    }
  }

  function setupScene() {
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      1,
      1000
    );
    camera.position.set(0, 0, 100);

    renderer = new THREE.WebGLRenderer({ alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
    scene.add(hemiLight);
    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight);

    // OrbitControls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // Prevent looking up by setting minimum polar angle to 90 degrees (horizontal)
    controls.minPolarAngle = Math.PI / 2; // This prevents looking up above the horizontal plane
    controls.maxPolarAngle = Math.PI / 2; // Allow full downward rotation
    controls.minDistance = 50;
    controls.maxDistance = 500;

    loader = new GLTFLoader();
  }

  function clearCurrentModel() {
    if (currentModel) {
      console.log('Clearing current model');
      scene.remove(currentModel);

      // Dispose of geometries and materials to free memory
      currentModel.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });

      currentModel = null;
    }

    // Stop current animation mixer
    if (mixer) {
      mixer.stopAllAction();
      mixer.uncacheRoot(mixer.getRoot());
      mixer = null;
    }

    // Extra safety: remove any remaining objects from scene
    const objectsToRemove = [];
    scene.traverse((child) => {
      if (child.type === 'Group' || child.type === 'Object3D') {
        if (child !== scene && child.parent === scene) {
          // Only remove direct children that aren't lights
          if (!child.isLight) {
            objectsToRemove.push(child);
          }
        }
      }
    });

    objectsToRemove.forEach((obj) => {
      scene.remove(obj);
    });
  }

  function loadModel(path) {
    if (!path || !loader || !scene) {
      console.log('Cannot load model - missing path, loader, or scene');
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoadingModel) {
      console.log('Already loading a model, skipping...');
      return;
    }

    console.log('Loading new model:', path);
    isLoadingModel = true;

    // Load the new model first, BEFORE clearing the old one
    loader.load(
      path,
      (glb) => {
        console.log('Model loaded successfully:', path);

        // Now that the new model is ready, clear the old one
        clearCurrentModel();

        // Add the new model
        currentModel = glb.scene;
        currentModel.scale.set(30, 30, 30);
        currentModel.position.set(-2, -20, 0);
        scene.add(currentModel);

        // Handle animations
        if (glb.animations.length > 0) {
          mixer = new THREE.AnimationMixer(currentModel);
          const action = mixer.clipAction(glb.animations[0]);
          action.loop = THREE.LoopRepeat;
          action.play();
          console.log('Animation started for model:', path);
        }

        isLoadingModel = false;
      },
      (progress) => {
        // Optional: you could show loading progress here if needed
        // console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('An error occurred while loading the model:', path, error);
        isLoadingModel = false;
      }
    );
  }

  function startAnimation() {
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta); // Update animation
      if (controls) controls.update();
      if (renderer && scene && camera) renderer.render(scene, camera);
    };

    animate();
  }

  function stopAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  // Reactive statement to handle modelPath changes
  $: {
    if (modelPath && scene) {
      console.log('Reactive: modelPath changed to', modelPath);
      loadModel(modelPath);
    }
  }

  onMount(() => {
    setupScene();

    // Load initial model if path is provided
    if (modelPath) {
      loadModel(modelPath);
    }

    startAnimation();

    // Handle window resize
    const onWindowResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    // Call resize handler initially and on window resize
    handleResize();
    window.addEventListener('resize', () => {
      handleResize();
      onWindowResize();
    });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  onDestroy(() => {
    console.log('ExerciseModel component destroyed');
    stopAnimation();
    clearCurrentModel();

    // Clean up Three.js resources
    if (controls) {
      controls.dispose();
    }
    if (renderer) {
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    }
  });
</script>

<!-- Three.js Canvas -->
<div bind:this={container} class="three-canvas"></div>

<style>
  .three-canvas {
    width: 100%;
    background: transparent;
    min-height: 385px;
  }
</style>
