<script>
    import { onMount } from 'svelte';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
  
    export let modelPath = ''; // Path to the 3D model
    let container;
  
    onMount(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 1, 1000);
      camera.position.set(0, 0, 100); // Center camera directly on the model
  
      const renderer = new THREE.WebGLRenderer({ alpha: false });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x000000, 0); // Black color with 0 opacity (transparent background)
      container.appendChild(renderer.domElement);
  
      // Lighting
        // Hemisphere light for soft ambient light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
        scene.add(hemiLight);
    
        // Directional light from the front
        const frontLight = new THREE.DirectionalLight(0xffffff, 1);
        frontLight.position.set(0, 0, 1);
        scene.add(frontLight);
    
        // Directional light from the back
        const backLight = new THREE.DirectionalLight(0xffffff, 1);
        backLight.position.set(0, 0, -1);
        scene.add(backLight);
    
        // Directional light from the left
        const leftLight = new THREE.DirectionalLight(0xffffff, 0.5);
        leftLight.position.set(-1, 0, 0);
        scene.add(leftLight);
    
        // Directional light from the right
        const rightLight = new THREE.DirectionalLight(0xffffff, 1);
        rightLight.position.set(1, 0, 0);
        scene.add(rightLight);
  
        // Directional light from the bottom light
        const bottomLight = new THREE.DirectionalLight(0xffffff, 0.3);
        bottomLight.position.set(0, -1, 0); // Positioning it below the scene
        scene.add(bottomLight);
  
        // Directional light from the bottom light
        const topLight = new THREE.DirectionalLight(0xffffff , 1);
        topLight.position.set(0, 1, 0); // Positioning it above the scene
        scene.add(topLight);
  
      // Load the 3D model
      const loader = new GLTFLoader();
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(30, 30, 30); // Set uniform scale
          model.position.set(-2, -20, 0); // Center the model
          scene.add(model);
        },
        undefined,
        (error) => console.error('An error occurred while loading the model:', error)
      );
  
      // OrbitControls setup
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.dampingFactor = 0.05;
      controls.zoomSpeed = 1; // Adjusted for smoother zoom
      controls.screenSpacePanning = false;
      controls.maxPolarAngle = Math.PI;
      controls.minDistance = 10;
      controls.maxDistance = 500;
  
      // Mobile-specific controls adjustment
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        controls.enableRotate = false; // Disable rotation for mobile
        controls.enablePan = false; // Disable panning for mobile
      }
  
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update(); // Required for damping
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
  
      // Cleanup on component unmount
      return () => window.removeEventListener('resize', onWindowResize);
    });
</script>

  <!-- Three.js Canvas -->
  <div bind:this={container} class="three-canvas"></div>

<style>
  .three-canvas {
    width: 100%;
    /* max-height: 264px;*/
    height: 100%;
    z-index: 1; /* Place the Three.js canvas on top */
    background: transparent;
  }
</style>