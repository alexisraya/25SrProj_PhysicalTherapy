<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  export let modelPath = ''; // Path to the 3D model
  let container;
  let mixer; // Animation mixer
// limit zoom in and out, x axis, y axis. intial camera view
  onMount(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 0, 100);

    const renderer = new THREE.WebGLRenderer({ alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
    scene.add(hemiLight);
    const frontLight = new THREE.DirectionalLight(0xffffff, 1);
    frontLight.position.set(0, 0, 1);
    scene.add(frontLight);

    // Load the 3D model with animations
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (glb) => {
        const model = glb.scene;
        model.scale.set(30, 30, 30);
        model.position.set(-2, -20, 0);
        scene.add(model);

        // Handle animations
        if (glb.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          const action = mixer.clipAction(glb.animations[0]); // Play the first animation
          action.loop = THREE.LoopRepeat; // Make it loop
          action.play();
        }
      },
      undefined,
      (error) => console.error('An error occurred while loading the model:', error)
    );

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 10;
    controls.maxDistance = 500;

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta); // Update animation
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const onWindowResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  });
</script>

<!-- Three.js Canvas -->
<div bind:this={container} class="three-canvas"></div>

<style>
  .three-canvas {
    width: 100%;
    height: 100%;
    background: transparent;
  }
</style>
