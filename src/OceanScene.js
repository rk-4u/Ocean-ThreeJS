import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Navbar from './Navbar.js';
import Card from './Card.js';

const OceanBackground = () => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null); // Reference to track the renderer
  const cameraRef = useRef(null); // Reference to track the camera

  useEffect(() => {
    let camera, scene, renderer, controls, water, sun;
    let targetPosition = new THREE.Vector3(0, 10, 0); // Target position for the camera
    const initialCameraPosition = 100; // Initial distance from the target

    const init = () => {
      // Initialize renderer
      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.5;

      if (containerRef.current) {
        containerRef.current.appendChild(renderer.domElement);
      }

      rendererRef.current = renderer; // Store renderer in ref for cleanup

      // Initialize scene and camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
      camera.position.set(30, 30, initialCameraPosition); // Start further away
      cameraRef.current = camera; // Store camera in ref

      // Initialize sun
      sun = new THREE.Vector3();

      // Water
      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
      water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', (texture) => {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
      });
      water.rotation.x = -Math.PI / 2;
      scene.add(water);

      // Skybox
      const sky = new Sky();
      sky.scale.setScalar(10000);
      scene.add(sky);

      const skyUniforms = sky.material.uniforms;
      skyUniforms['turbidity'].value = 10;
      skyUniforms['rayleigh'].value = 2;
      skyUniforms['mieCoefficient'].value = 0.005;
      skyUniforms['mieDirectionalG'].value = 0.8;

      const parameters = {
        elevation: 2,
        azimuth: 180,
      };

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      let renderTarget;

      const updateSun = () => {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        if (renderTarget !== undefined) renderTarget.dispose();

        renderTarget = pmremGenerator.fromScene(sky);
        scene.environment = renderTarget.texture;
      };

      updateSun();

      // Controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.target.copy(targetPosition); // Center the target
      controls.minDistance = 40.0;
      controls.maxDistance = 200.0;
      controls.update();

      // Resize event
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('scroll', onScroll); // Add scroll event listener
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const onScroll = (event) => {
      // Adjust camera position based on scroll
      const scrollY = window.scrollY;
      const zoomFactor = 0.1; // Adjust this value for sensitivity
      camera.position.z = initialCameraPosition - scrollY * zoomFactor;

      // Limit camera zoom to prevent going too far or too close
      camera.position.z = Math.max(40, Math.min(200, camera.position.z)); // Keep within bounds
      controls.update(); // Update controls to reflect new camera position
    };

    const animate = () => {
      water.material.uniforms['time'].value += 1.0 / 60.0;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('scroll', onScroll); // Cleanup scroll event listener

      // Cleanup: Check if the container and renderer exist before removing
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose(); // Dispose the renderer to release resources
      }
    };
  }, []);

  return (
    <>
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div
          ref={containerRef}
          style={{
            position: 'fixed',
            width: '100%',
            height: '100%',
            top: 0,
            bottom: 0,
            left: 0,
          }}
        />
      </div>
      <div
        style={{
          textAlign: 'center',
          top: 0,
          left: 0,
        }}
      >
        <Navbar />
        <Card />
      </div>
    </>
  );
};

export default OceanBackground;
