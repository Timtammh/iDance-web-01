import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ConvexHull } from "three/addons/math/ConvexHull.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import modelUrl from "../../productShot/XD301/XD301.glb?url";
import styles from "./ProductHero.module.css";

function disposeModel(model: THREE.Object3D) {
  model.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      for (const value of Object.values(material)) if (value instanceof THREE.Texture) value.dispose();
      material.dispose();
    }
  });
}

export function ProductModelViewer() {
  const host = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("載入模型中 · Loading model…");
  useEffect(() => {
    const element = host.current!;
    let disposed = false;
    let model: THREE.Object3D | undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setStatus("模型載入失敗 · Unable to display 3D model. Please reload.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Only the camera moves, so the model/light shadow map stays valid.
    renderer.shadowMap.autoUpdate = false;
    canvasHost.current!.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room);
    room.dispose();
    pmrem.dispose();
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.18;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x606060, 0.25));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.bias = -0.0003;
    scene.add(key);
    const framingPoints: THREE.Vector3[] = [];
    const projected = new THREE.Vector3();
    let radius = 1;
    let azimuth = 0.3;
    let elevation = 0.85;
    const render = () => {
      if (disposed) return;
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const distance = radius / Math.sin(Math.min(vertical, horizontal)) * 1.12;
      camera.zoom = 1.2;
      camera.position.set(distance * Math.cos(elevation) * Math.sin(azimuth), distance * Math.sin(elevation), distance * Math.cos(elevation) * Math.cos(azimuth));
      camera.near = distance / 100;
      camera.far = distance + radius * 10;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      // Center the projected product silhouette, rather than only its world-space pivot.
      if (framingPoints.length) {
        let left = Infinity, right = -Infinity, bottom = Infinity, top = -Infinity;
        for (const point of framingPoints) {
          projected.copy(point).project(camera);
          left = Math.min(left, projected.x);
          right = Math.max(right, projected.x);
          bottom = Math.min(bottom, projected.y);
          top = Math.max(top, projected.y);
        }
        camera.projectionMatrix.elements[8] += (left + right) / 2;
        camera.projectionMatrix.elements[9] += (bottom + top) / 2;
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
      }
      renderer.render(scene, camera);
    };
    let frame = 0;
    const requestRender = () => {
      if (frame || disposed) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        render();
      });
    };
    const resize = () => {
      // Layout dimensions exclude the GSAP entrance scale, which otherwise
      // leaves a smaller, left-aligned canvas after the animation completes.
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    new GLTFLoader().load(modelUrl, gltf => {
      if (disposed) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      // Replace even unlit or emissive imported materials with a uniform lit clay finish.
      const originalMaterials = new Set<THREE.Material>();
      const originalTextures = new Set<THREE.Texture>();
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        const originals = Array.isArray(object.material) ? object.material : [object.material];
        const clayMaterials = originals.map(original => {
          originalMaterials.add(original);
          for (const value of Object.values(original)) {
            if (value instanceof THREE.Texture) originalTextures.add(value);
          }
          return new THREE.MeshStandardMaterial({
            color: "#909090",
            metalness: 0,
            roughness: 0.8,
            emissive: 0x000000,
            emissiveIntensity: 0,
            side: original.side,
          });
        });
        object.material = Array.isArray(object.material) ? clayMaterials : clayMaterials[0];
        object.castShadow = true;
        object.receiveShadow = true;
      });
      originalTextures.forEach(texture => texture.dispose());
      originalMaterials.forEach(material => material.dispose());
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
      model.position.sub(center);
      // Fit the shadow camera to the actual model, with a raking upper-left key light.
      key.position.set(-radius * 3, radius * 4, radius * 2);
      key.shadow.camera.left = key.shadow.camera.bottom = -radius * 1.1;
      key.shadow.camera.right = key.shadow.camera.top = radius * 1.1;
      key.shadow.camera.near = radius * 0.1;
      key.shadow.camera.far = radius * 8;
      key.shadow.normalBias = radius * 0.002;
      key.shadow.camera.updateProjectionMatrix();
      scene.add(model);
      model.updateMatrixWorld(true);
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        // Mesh bounding-box corners can extend beyond the actual silhouette,
        // especially after rotation. Frame only vertices used by rendered triangles.
        const positions = object.geometry.getAttribute("position");
        const index = object.geometry.getIndex();
        const used = new Set<number>();
        const start = object.geometry.drawRange.start;
        const count = Math.min(object.geometry.drawRange.count, (index?.count ?? positions.count) - start);
        for (let i = start; i < start + count; i++) {
          const vertex = index ? index.getX(i) : i;
          if (used.has(vertex)) continue;
          used.add(vertex);
          framingPoints.push(new THREE.Vector3().fromBufferAttribute(positions, vertex).applyMatrix4(object.matrixWorld));
        }
      });
      // A convex hull has the same projected extrema as the full mesh, but
      // only its outermost vertices need projecting during camera rotation.
      const hull = new ConvexHull().setFromPoints(framingPoints);
      const outerPoints = new Set<THREE.Vector3>();
      for (const face of hull.faces) {
        let edge = face.edge;
        do {
          outerPoints.add(edge.head().point);
          edge = edge.next;
        } while (edge !== face.edge);
      }
      framingPoints.length = 0;
      outerPoints.forEach(point => framingPoints.push(point));
      renderer.shadowMap.needsUpdate = true;
      render();
      element.dataset.loaded = "true";
      setStatus("");
    }, undefined, () => {
      if (!disposed) setStatus("模型載入失敗 · Unable to load model. Please reload.");
    });
    let drag: { id: number; x: number; y: number } | undefined;
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || !model) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      element.setPointerCapture(event.pointerId);
      element.focus({ preventScroll: true });
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      azimuth -= (event.clientX - drag.x) * 0.008;
      // Vertical touch gestures remain available for normal page scrolling.
      if (event.pointerType !== "touch") elevation = THREE.MathUtils.clamp(elevation + (event.clientY - drag.y) * 0.006, 0.15, 1.45);
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      requestRender();
    };
    const stop = () => { drag = undefined; };
    const keyboard = (event: KeyboardEvent) => {
      if (!model || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "ArrowLeft") azimuth -= 0.12;
      if (event.key === "ArrowRight") azimuth += 0.12;
      if (event.key === "ArrowUp") elevation = Math.min(1.45, elevation + 0.1);
      if (event.key === "ArrowDown") elevation = Math.max(0.15, elevation - 0.1);
      render();
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      setStatus("3D 顯示中斷 · Please reload to view the model.");
    };
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", stop);
    element.addEventListener("pointercancel", stop);
    element.addEventListener("lostpointercapture", stop);
    element.addEventListener("keydown", keyboard);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", stop);
      element.removeEventListener("pointercancel", stop);
      element.removeEventListener("lostpointercapture", stop);
      element.removeEventListener("keydown", keyboard);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      if (model) disposeModel(model);
      key.shadow.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete element.dataset.loaded;
    };
  }, []);
  return <div ref={host} className={styles.viewer} data-hero-product tabIndex={0} role="region" aria-label="XD301 interactive 3D model" aria-describedby="hero-help" aria-busy={status.includes("Loading")}>
    <div ref={canvasHost} className={styles.canvas} />
    {status && <span className={styles.loading} role="status">{status}</span>}
  </div>;
}
